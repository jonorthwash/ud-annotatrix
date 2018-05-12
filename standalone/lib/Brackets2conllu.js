'use strict'

// This code is for parsing bracketted notation like:
// [root [nsubj I] have [obj [amod [advmod too] many] commitments] [advmod right now] [punct .]]
// Thanks to Nick Howell for help with a Python version.

function Node(name, s, index, children) {
    log.debug(`called Node constructor (name: ${name}, s: ${s}, index: ${index}, children: ${children})`);

    this.name = name;
    this.s = s;
    this.index = index;
    this.children = children;

    this.maxindex = () => {
        // Returns the maximum index for the node
        // mx = max([c.index for c in self.children] + [self.index])
        let localmax = 0;
        if (parseInt(this.index) > localmax)
            localmax = parseInt(this.index);

        $.each(this.children, (i, child) => {
            if (parseInt(child.index) > localmax)
                localmax = parseInt(child.index);
        });

        return localmax;
    };

    this.paternity = () => {
        $.each(this.children, (i, child) => {
            child.parent = this;
            child.paternity();
        });

        return this;
    };

    this.parent_index = () => {
        if (this.parent !== undefined) {
            if (this.parent.index !== undefined)
                return this.parent.index;
        }
        return 0;
    };

}

function match(s, up, down) {
    log.debug(`called match(s: ${s}, up: ${up}, down: ${down})`);

    let depth = 0, i = 0;
    while(i < s.length && depth >= 0) {

        if (s[i] === up)
            depth += 1;

        if (s[i] === down)
            depth -= 1;

        i++;
    }

    return s.slice(0,i-1);
}

function _max(list) {
    log.debug(`called _max(${JSON.stringify(list)})`);

    // Return the largest number in a list otherwise return 0
    // @l = the list to search in
    let localmax = 0;
    $.each(list, (i, item) => {
        localmax = Math.max(item, localmax);
    });

    return localmax;
}

function _count(needle, haystack) {
    log.debug(`called _count(needle: ${needle}, haystack: ${JSON.stringify(haystack)})`);

    // Return the number of times you see needle in the haystack
    // @needle = string to search for
    // @haystack = string to search in
    return haystack.reduce((acc, item) => {
        return acc + (item === needle);
    }, 0);
}

function node(s, j) {
    log.debug(`called node(s: ${s}, j: ${j})`);

    // Parse a bracketted expression
    // @s = the expression
    // @j = the index we are at

    if (s[0] === '[' && s[-1] === ']')
        s = s.slice(1, -1);

    const first = s.indexOf(' '), // the first space delimiter
        name = s.slice(0, first), // dependency relation name
        remainder = s.slice(first, s.length);

    // this is impossible to understand without meaningful variables names .....
    let index = 0, children = [], word;
    while (i < remainder.length) {

        if (remainder[i] === '[') {
            // We're starting a new expression
            const m = match(remainder.slice(i+1, remainder.length), '[', ']'),
                indices = [index] + children.map((child) => { return child.maxindex(); }),
                n = node(m, _max(indices));

            children.push(n);
            i += m.length + 2;

            if (!word)
                index = _max([index, n.maxindex()]);

        } else if (remainder[i] !== ' ' && (remainder[i-1] === ' ' || i === 0)) {

            const openBracketIndex = remainder.indexOf('[', i);

            if (openBracketIndex < 0) {
                word = remainder.slice(i, remainder.length);
            } else {
                word = remainder.slice(i, remainder.indexOf(' ', i));
            }

            i += word.length;
            index += 1 + _count(' ', word.trim());

        } else {
          i++;
        }
    }

    return new Node(name, word, index, children);
}

function fillTokens(node, tokens) {
    log.debug(`called fillTokens(node: ${node}, tokens: ${JSON.stringify(tokens)})`);

    let newToken = new conllu.Token();
    newToken.form = node.s;

    // TODO: automatic recognition of punctuation's POS
    if (newToken['form'].match(/^[!.)(»«:;?¡,"\-><]+$/))
      newToken.upostag = 'PUNCT';

    newToken.id = node.index;
    newToken.head = node.parent_index();
    newToken.deprel = node.name;
    log.debug(`fillTokens() newToken: (form: ${newToken.form}, id: ${newToken.id}, head: ${newToken.head}, deprel: ${newToken.deprel})`);

    tokens.push(newToken);
    $.each(node.children, (i, child) => {
        tokens = fillTokens(child, tokens);
    });

    return tokens;
}

function Brackets2conllu(text) {
    log.debug(`called Brackets2conllu(${text})`);

    /* Takes a string in bracket notation, returns a string in conllu. */
    const inputLines = text.split('\n'),
        comments = '';

    let tokens = [], // list of tokens
        root = node(inputLines[0], 0);

    root.paternity();
    tokens = fillTokens(root, tokens);
    log.debug(`Brackets2conllu(): tokens: ${JSON.stringify(tokens)}`);

    let sent = new conllu.Sentence();
    sent.comments = comments;
    sent.tokens = tokens;
    return sent.serial;
}
