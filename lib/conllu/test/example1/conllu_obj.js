
var fs = require('fs');

var conllu = {
    serial: fs.readFileSync('test/example1/conllu.conllu').toString(),
    sentences: [
        {
            text: "They buy and sell books.",
            serial: fs.readFileSync('test/example1/sent0/serial.txt').toString(),
            comments: [" sent_id 1", " ..."],
            tokens: [
                {
                    serial: fs.readFileSync('test/example1/sent0/token0.txt').toString(),
                    id: 1,
                    form: "They",
                    lemma: "they",
                    upostag: "PRON",
                    xpostag: "PRP",
                    feats: "Case=Nom|Number=Plur",
                    head: "2",
                    deprel: "nsubj",
                    deps: "4:nsubj",
                    misc: undefined
                },
                {
                    serial: fs.readFileSync('test/example1/sent0/token1.txt').toString(),
                    id: 2,
                    form: "buy",
                    lemma: "buy",
                    upostag: "VERB",
                    xpostag: "VBP",
                    feats: "Number=Plur|Person=3|Tense=Pres",
                    head: "0",
                    deprel: "root",
                    deps: undefined,
                    misc: undefined
                },
                {
                    serial: fs.readFileSync('test/example1/sent0/token2.txt').toString(),
                    id: 3,
                    form: "and",
                    lemma: "and",
                    upostag: "CONJ",
                    xpostag: "CC",
                    feats: undefined,
                    head: "2",
                    deprel: "cc",
                    deps: undefined,
                    misc: undefined
                },
                {
                    serial: fs.readFileSync('test/example1/sent0/token3.txt').toString(),
                    id: 4,
                    form: "sell",
                    lemma: "sell",
                    upostag: "VERB",
                    xpostag: "VBP",
                    feats: "Number=Plur|Person=3|Tense=Pres",
                    head: "2",
                    deprel: "conj",
                    deps: "0:root",
                    misc: undefined
                },
                {
                    serial: fs.readFileSync('test/example1/sent0/token4.txt').toString(),
                    id: 5,
                    form: "books",
                    lemma: "book",
                    upostag: "NOUN",
                    xpostag: "NNS",
                    feats: "Number=Plur",
                    head: "2",
                    deprel: "dobj",
                    deps: "4:dobj",
                    misc: "SpaceAfter=No"
                },
                {
                    serial: fs.readFileSync('test/example1/sent0/token5.txt').toString(),
                    id: 6,
                    form: ".",
                    lemma: ".",
                    upostag: "PUNCT",
                    xpostag: ".",
                    feats: undefined,
                    head: "2",
                    deprel: "punct",
                    deps: undefined,
                    misc: undefined
                }
            ]
        },
        {
            text: "I haven't a clue.",
            serial: fs.readFileSync('test/example1/sent1/serial.txt').toString(),
            comments: [" sent_id 2"," ..."],
            tokens: [
                {
                    serial: fs.readFileSync('test/example1/sent1/token0.txt').toString(),
                    id: 1,
                    form: "I",
                    lemma: "I",
                    upostag: "PRON",
                    xpostag: "PRP",
                    feats: "Case=Nom|Number=Sing|Person=1",
                    head: 2,
                    deprel: "nsubj",
                    deps: undefined,
                    misc: undefined
                },
                {
                    serial: fs.readFileSync('test/example1/sent1/token1.txt').toString(),
                    id: "2-3",
                    form: "haven't",
                    lemma: "",
                    upostag: "",
                    xpostag: "",
                    feats: "",
                    head: undefined,
                    deprel: "",
                    deps: undefined,
                    misc: undefined,
                    tokens: [
                        {
                            serial: fs.readFileSync('test/example1/sent1/token1/token0.txt').toString(),
                            id: 2,
                            form: "have",
                            lemma: "have",
                            upostag: "VERB",
                            xpostag: "VBP",
                            feats: "Number=Sing|Person=1|Tense=Pres",
                            head: 0,
                            deprel: "root",
                            deps: undefined,
                            misc: undefined
                        },
                        {
                            serial: fs.readFileSync('test/example1/sent1/token1/token1.txt').toString(),
                            id: 3,
                            form: "not",
                            lemma: "not",
                            upostag: "PART",
                            xpostag: "RB",
                            feats: "Negative=Neg",
                            head: 2,
                            deprel: "neg",
                            deps: undefined,
                            misc: undefined
                        }
                    ]
                },
                {
                    serial: fs.readFileSync('test/example1/sent1/token2.txt').toString(),
                    id: 4,
                    form: "a",
                    lemma: "a",
                    upostag: "DET",
                    xpostag: "DT",
                    feats: "Definite=Ind|PronType=Art",
                    head: 4,
                    deprel: "det",
                    deps: undefined,
                    misc: undefined
                },
                {
                    serial: fs.readFileSync('test/example1/sent1/token3.txt').toString(),
                    id: 5,
                    form: "clue",
                    lemma: "clue",
                    upostag: "NOUN",
                    xpostag: "NN",
                    feats: "Number=Sing",
                    head: 2,
                    deprel: "dobj",
                    deps: undefined,
                    misc: "SpaceAfter=No"
                },
                {
                    serial: fs.readFileSync('test/example1/sent1/token4.txt').toString(),
                    id: 6,
                    form: ".",
                    lemma: ".",
                    upostag: "PUNCT",
                    xpostag: ".",
                    feats: undefined,
                    head: 2,
                    deprel: "punct",
                    deps: undefined,
                    misc: undefined
                }
            ]
        }
    ]
};

// if using Node.js export module
if (typeof exports !== 'undefined' && this.exports !== exports) {
    exports.conllu = conllu;
}
