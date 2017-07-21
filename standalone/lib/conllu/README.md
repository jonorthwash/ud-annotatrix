# Conllu
Conllu is a JavaScript library capable of manipulating files in CoNLL-U format, including the creation and manipulation of multi-word tokens in a sentence.

## Installation

#### Node.js

Conllu is available on npm.

`npm install conllu`

Then, require the conllu library.

`var conllu = require('conllu')`

## Overview

###Conllu object
The Conllu object is the highest level object, and allows manipulation at the full file level. The object comprises an array of sentences as well as functions allowing for getting information from an existing conllu file, splitting and merging sentences, and exporting into conllu format. 
 
 To create a Conllu object from an existing file:
 
    c = new conllu.Conllu()
    c.serial = fs.readFileSync('example.conllu','utf8')
    
The Conllu object should now contain a property `sentences` which is an array of Sentence objects representing, in order, each sentence of the conllu file. 

To split a sentence, call the method splitSentence on the conllu object. The sentence index corresponds to the sentence in the conllu object's sentence array that is to be split, with the token id corrresponding to the token at which the split should occur, with the start of the new sentence beginning with the first token after the specified token id:

`c.splitSentence(sentenceIndex, tokenId)`

Merging two sentences only requires specifying the index of the sentence in conllu.sentences which is to be merged with the sentence directly following it:

`c.mergeSentence(sentenceIndex)
`
###Sentence object
The Sentence object represents a sentence in the conllu file, and comprises two arrays, one for tokens and one for comments. It contains internally consistent token id numbering, starting with 1 for the first word. Comments which often initiate the sentence (see conllu documentation) are also contained within this object. It is possible to change, split, merge, add or delete such comments.

To create a sentence object:

`s = new conllu.Sentence()`

The Sentence object contains a `comments` property, which is an array of comments (as strings) found in the sentence.

It also contains a `tokens` property which is an array representing the list of Token and MultiwordToken objects that the sentence is composed of.

To split a token in a sentence, call split on the sentence object using the token id of the token to be split, as well as the string index of the token's form property at the point of the split:

`s.split(tokenId, stringIndex)`

To merge two tokens in a sentence, call merge on the sentence object using the token id of the token to be merged with the next proceeding token: 

`s.merge(tokenId)`

Similarly, to split and merge comments, call splitComment and mergeComment on the sentence object. splitComment takes the arguments of the comment index in sentence's comment array, as well as the string index of the split point. mergeComment takes the index of the comment that is to be merged with the next following comment in the sentence's comments array:

`splitComment(commentIndex, stringIndex)`

`mergeComment(commentIndex)`

To expand a token to a multiword token, call expand on the sentence object specifying both the token id of the token to be expanded, as well as the string index of the split point (e.g. "haven't" would be split between "have" and "n't"):

`s.expand(tokenId, stringIndex)`

To collapse a multiword token, call collapse on the sentence object at the token id of the token to be collapsed:

`s.collapse(tokenId)`


###Token object
The Token object is representative of the individual word. It is possible to split a token into separate parts, for example to rectify tokenization errors. It is also possible to merge tokens into a single token object.

`t = new conllu.Token()`

A token object contains the properties `id`, `form`, `lemma`, `upostag`, `xpostag`, `feats`, `head`, `deprel`, and `deps`, representing each of the columns of a conllu file.

###MultiwordToken object
The MultiwordToken object is specific to tokens composed of multiple semantic parts. The expand and collapse functions in the sentence object apply to this object. It is composed of a parent, which is the full word found in the text; and of children, which are the semantically independent sub-parts. The id of a multi-word token is simply the range of its children's ids. Children id's follow from the preceding tokens in the sentence.

`mwt = new conllu.MultiwordToken()`

## License

Conllu uses a CC BY-SA license.