# ud-annotatrix

The online interface is currently avaliable on [GitHub pages](https://maryszmary.github.io/ud-annotatrix/standalone/annotator.html). To use it offline, clone the repository to your local machine and open the file `visualise.html` in your browser.

## About

### The idea

UD Annotatrix is a client-side, browser only, tool for editting dependency trees in [CoNLL-U](http://universaldependencies.org/format.html) and [VISL](http://beta.visl.sdu.dk/cg3/single/#streamformats) formsts.  The point of this is to make manual editing of dependency corpora quicker. The aim of this project is to create an easy-to-use, quick and interactive interface tool for Universal Dependencies annotation, which would work both online and offline and allow the user to edit the annotation in both graphical and text modes.

Note that something similar exists in [brat](http://brat.nlplab.org), but that we're aiming for a simpler, cleaner, faster interface with optional server-side component.

### Functionality

At the moment, the interface allows to:
* draw depencencies between tokens
* edit dependency relations
* delete dependencies
* edit POS labels
* edit tokens

Editing POS labels, editing deprels, drawing arcs and deleting arcs are undoable and redoable.

The interface supports right-to-left readin order and vertiacal alignment for long sentences.

## User guide

The basic user guide is avaliable on the [help page](https://maryszmary.github.io/ud-annotatrix/standalone/help.html).

## Architecture and components


### Standalone

The standalone part of the project is written in JavaScript. The standalone version supports full functionality, apart from saving corpora on server.

#### Project's modules

* main menaging script: `annotator.js`
* support for visualisation: `visualiser.js`, `cy-style.js`
* support for graphical editing: `gui.js`
* format handling: `converters.js`, `CG2conllu.js`

#### Dependencies

* jQuery
* Cytoscape
* head.js
* undomanager.js
* a JS library for parsing conllu written by Magdalena Parks

All the dependencies are stored in ./standalone/lib/ext/.

#### Tests

Currently, there are only tests for CG3 to CoNLL-U converters.

### Server

The server package provides additional support for deploying the web-interface on a web-server. The back-end is written Python 3, Flask.

#### Dependencies

* Flask

## Contributors

* Jonathan North Washington (@jonorthwash)
* Mariya Sheyanova (@maryszmary; [documentation of the changes](http://wiki.apertium.org/wiki/UD_annotatrix/UD_annotatrix_at_GSoC_2017))
* Tai Vongsathorn Warner (@MidasDoas; [documentation of the changes](https://wikis.swarthmore.edu/ling073/User:Twarner2/Final_project))
* Francis Tyers (@ftyers)
