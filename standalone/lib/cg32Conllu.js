'use strict'

function cg32Conllu(CGtext) {
    log.debug(`called cg32Conllu(${CGtext})`);

    /* Takes a string in CG, returns a string in conllu. */

    // TODO: Check for '<s>' ... '</s>' and if you have matching things treat them
    // as comments with #

    if (ambiguityPresent(CGtext)) // to abort conversion if there are ambiguous analyses
        return;

    // remove extra spaces before newline before processing text
    CGtext = CGtext.replace(/ +\n/, '\n');
    let sent = new conllu.Sentence();
    sent.comments = findComments(CGtext);
    sent.tokens = formTokens(CGtext);

    return sent.serial;
}


function findComments(CGtext) {
    /* Takes a string in CG, returns 2 arrays with strings. */
    return CGtext.split('\n')
        .filter((line) => { return line[0] === '#' })  // take only strings beginning with "#"
        .map((line) => { return line.replace(/^#+/, ''); }); // string off leading "#"s
}


function ambiguityPresent(CGtext) {

    // suppose the indent is consistent troughout the sentence
    const lines = CGtext.split(/"<(.*)>"/);
    for (let i = 2, l = lines.length; i < l; i += 2) {
        const indent = lines[i].replace('\n', '').split(/[^\s]/)[0],
            ana = lines[i].trim();
        if (ana.includes(indent) && !ana.includes(indent + indent))
            return true;
    }

    return false;
}


function formTokens(CGtext) {

    // i use the presupposition that there are no ambiguous readings,
    // because i've aborted conversion of ambiguous sentences in ambiguityPresent
    let tokens = [], tokenId = 1;
    $.each(CGtext.split(/"<(.*)>"/).slice(1), (i, line) => {
        if (i % 2 === 1) {
            const form = lines[i - 1];
            line = line.replace(/^\n?;?( +|\t)/, '');
            if (!line.match(/(  |\t)/)) {
                let token = getAnalyses(line, { form:form, id:tokenId });
                tokens.push(formNewToken(token));
                tokenId ++;
            } else {
                const subtokens = line.trim().split('\n'),
                    supertoken = formSupertoken(subtokens, form, tokenId);
                tokens.push(supertoken);
                tokenId += subtokens.length;
            }
        }
    });

    return tokens;
}


function getAnalyses(line, analyses) {
    log.debug(`called getAnalyses(line: ${line}, analyses: ${JSON.stringify(analyses)})`);

    // first replace space (0020) with · for lemmas and forms containing
    // whitespace, so that the parser doesn't get confused.
    const quoted = line.replace(/.*(".*?").*/, '$1'),
        forSubst = quoted.replace(/ /g, '·'),
        gram = line.replace(/".*"/, forSubst)
            .replace(/[\n\t]+/, '').trim().split(' '); // then split on space and iterate

    $.each(gram, (i, analysis) => {
        if (analysis.match(/"[^<>]*"/)) {

            analyses.lemma = analysis.replace(/"([^<>]*)"/, '$1');

        } else if (analysis.match(/#[0-9]+->[0-9]+/)) {

            // in CG sometimes heads are the same as the token id, this breaks visualisation #264
            analyses.head = analysis.replace(/#([0-9]+)->([0-9]+)/, '$2').trim();
            if (analyses.id === analyses.head)
                analyses.head = '';

        } else if (analysis.match(/#[0-9]+->/)) {

            // pass

        } else if (analysis.match(/@[A-Za-z:]+/)) {

            analyses.deprel = analysis.replace(/@([A-Za-z:]+)/, '$1');

        } else if (i < 2) {

            analyses.upostag = analysis; // TODO: what about xpostag?

        } else { // saving other stuff

            analyses.feats = (analyses.feats ? '' : '|') + analysis;

        }
    });

    return analyses;
}


function formNewToken(attrs) {
    log.debug(`called formNewToken(${JSON.stringify(attrs)})`);

    /* Takes a dictionary of attributes. Creates a new token, assigns
    values to the attributes given. Returns the new token. */

    let newToken = new conllu.Token();
    $.each(attrs, (attr, val) => {
        newToken[attr] = val;
    });

    return newToken;
}


function formSupertoken(subtokens, form, tokenId) {
    log.debug(`called formSupertoken(subtokens: ${JSON.stringify(subtokens)}, form: ${form}, tokenId: ${tokenId})`);

    let sup = new conllu.MultiwordToken();
    sup.form = form;

    $.each(subtokens, (i, token) => {
        const newToken = getAnalyses(token, { id:tokenId, form:'_' });
        sup.tokens.push(formNewToken(newToken));
        tokenId++;
    });

    return sup;
}


function conllu2CG(conlluText, indent) {
    log.debug(`called conllu2CG(conllu: ${conlluText}, indent: ${indent})`);

    let sent = new conllu.Sentence();
    sent.serial = conlluText;
    indent = indent || '\t';

    let CGtext = (sent.comments.length ? '#' + sent.comments.join('\n#') : '');

    $.each(sent.tokens, (i, token) => {

        CGtext += (token.form ? `\n"<${token.form}>"\n"` : '');
        if (token.tokens == undefined) {
            CGtext += indent + newCGAnalysis(i, token);
        } else {
            CGtext += token.tokens.map((subtoken, j) => {
                return indent.repeat(j+1) + newCGAnalysis(j, subtoken);
            }).join('\n');
        }
    })

    return CGtext.trim();
}


function newCGAnalysis(i, token) {
    log.debug(`called newCGAnalysis(i: ${i}, token: ${token})`);

    const lemma = (token.lemma ? `"${token.lemma}"` : `""`), // lemma should have "" if blank (#228)
        pos = token.upostag || token.xpostag || '_',
        feats = (token.feats ? ` ${token.feats.replace(/\|/g, ' ')}` : '');
        deprel = (token.deprel ? ` @${token.deprel}` : ' @x'); // is it really what we want by default?
        head = token.head || '';
        cgToken = `${lemma} ${pos}${feats}${deprel} #${token.id}->${head}`;

    log.debug(`got cgToken: ${cgToken}`);
    return cgToken;
}
