# ud-annotatrix

The online interface is currently available from several places:

* [Masha's GitHub pages](https://maryszmary.github.io/ud-annotatrix/standalone/annotator.html). 
* [Fran's GitHub pages](https://ftyers.github.io/ud-annotatrix/). 
* [Server version on web-corpora](http://web-corpora.net/wsgi3/annotatrix/)(beta).

To use it offline, clone this repository to your local machine and open the file `index.html` in your browser.

Alternatively, you can serve the files using a web server.  An easy way to do this locally is to run `python3 -m http.server` in the cloned directory.

## Support

Having a problem with Annotatrix ? Want some one-on-one support ? You can try <tt>#_u-dep</tt> on <tt>irc.freenode.net</tt> or
join our [Telegram chat](https://t.me/joinchat/EWWgMhGXARzxvgO5AzI0ew).

## About

### The idea

UD Annotatrix is a client-side, browser only, tool for editting dependency trees in [CoNLL-U](http://universaldependencies.org/format.html) and [VISL](http://beta.visl.sdu.dk/cg3/single/#streamformats) formsts.  The point of this is to make manual editing of dependency corpora quicker. The aim of this project is to create an easy-to-use, quick and interactive interface tool for Universal Dependencies annotation, which would work both online and offline and allow the user to edit the annotation in both graphical and text modes.

Note that something similar exists in [brat](http://brat.nlplab.org), but that we're aiming for a simpler, cleaner, faster interface optimised for Universal Dependencies with an optional server-side component.

### Functionality

At the moment, the interface supports:
* draw dependencies between tokens
* edit dependency relations
* delete dependencies
* edit POS labels
* edit tokens

Editing POS labels, editing deprels, drawing arcs and deleting arcs are undoable and redoable.

The interface supports right-to-left readin order and vertiacal alignment for long sentences.

## User guide

The basic user guide is available on the [help page](https://maryszmary.github.io/ud-annotatrix/standalone/help.html).

## Architecture and components


### Standalone

The standalone part of the project is written in JavaScript. The standalone version supports full functionality, apart from saving corpora on server.

#### Project architecture

* main managing script: `annotator.js`
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
* Grzegorz Stark (@gstark0)
* Jonathan Pan (@JPJPJPOPOP)
* Suresh Michael Peiris (@tsuresh)
* Diogo Fernandes (@diogoscf)
* Robin Richtsfeld (@Androbin)
* Sushain Cherivirala (@sushain97)
* Kevin Brubeck Unhammer (@unhammer)
* Ethan Yang (@thatprogrammer1)
