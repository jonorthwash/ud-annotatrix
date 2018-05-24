'use strict'

function sd2Conllu__raw(text) {
    log.debug(`called sd2Conllu__raw(${text})`);

    /* Takes a string in CG, returns a string in conllu. */
    const inputLines = text.split('\n');
    let tokenId = 1,
        tokenToId = {}, // convert from a token to an index
        heads = [], // e.g. heads[1] = 3
        deprels = []; // e.g. deprels[1] = nsubj

    // first enumerate the tokens
    $.each(inputLines[0].split(' '), (i, token) => {
        tokenToId[token] = tokenId;
        tokenId += 1;
    });

    // When there are two surface forms that are the same, you have to specify the one you
    // are referring to.
    //
    // e.g.
    // the bear eats the crisps.
    // det(bear, the-1)
    // det(crisps, the-4)
    // nsubj(eats, bear)
    //
    // In fact, these numbers are optional for all, so det(bear-2, the-1) would also be valid

    // now process the dependency relations
    $.each(inputLines, (i, line) => {
        if (line.indexOf(',') > -1) { // not root node
            let deprel = '',
                headToken = '',
                depToken = '',
                reading = 'deprel';  // reading \elem [ 'deprel', 'head', 'dep' ]

            for (let j=0, l=line.length; j<l; j++) {
                const word = line[j];

                switch (reading) {
                    case ('deprel'):
                        if (word === '(') {
                            reading = 'head';
                        } else {
                            deprel += word;
                        }
                        break;
                    case ('head'):
                        if (word === ',') {
                            reading = 'dep';
                        } else {
                            headToken += word;
                        }
                        break;
                    case ('dep'):
                        if ( !((line[j-1] === ',' && word === ' ') || word === ')') )
                            depToken += word;
                        break;
                }
            }

            let depId, headId;
            if (depToken.search(/-[0-9]+/) > 0)
                depId = parseInt(depToken.split('-')[1]);
            if (headToken.search(/-[0-9]+/) > 0)
                headId = parseInt(headToken.split('-')[1]);

            log.debug(`sd2Conllu(): ${depToken} → ${headToken} @${deprel} | ${tokenToId[depToken]} : tokenToId[headToken] // ${depId} → ${headId}`);
            heads[depId] = headId;
            deprels[depId] = deprel;
        }
    });

    tokenId = 0;
    let sent = new conllu.Sentence();
    sent.comments = '';
    sent.tokens = inputLines[0].split(' ').map((token) => {

        let newToken = new conllu.Token();
        tokenId++;

        newToken.form = token;

        // TODO: automatic recognition of punctation's POS
        if (token.match(/\W/))
            newToken.upostag = 'PUNCT';

        newToken.id = tokenId;
        newToken.head = heads[tokenId];
        newToken.deprel = deprels[tokenId];
        log.debug(`sd2Conllu(): @@@${newToken.form} ${newToken.id} ${newToken.head} ${newToken.deprel}`);

        return newToken;
    });

    return sent.serial;
}
