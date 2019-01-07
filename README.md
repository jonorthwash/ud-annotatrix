# UD Annotatrix

UD Annotatrix is a client-side, browser-only, language-independent tool for editing dependency trees according to the guidelines established by the [Universal Dependencies](https://universaldependencies.org) project.  UD-Annotatrix supports uploading corpora to the browser to add, remove, and edit dependencies in a wide variety of formats (managed with the [notatrix](https://github.com/keggsmurph21/notatrix) tool), including:
 - [CoNLL-U](http://universaldependencies.org/format.html)
 - [VISL CG3](http://beta.visl.sdu.dk/cg3/single/#streamformats)
 - Brackets
 - SDParse
 - plain text

Note: [brat](http://brat.nlplab.org) is a similar corpus annotation tool, but we're aiming for a simpler, cleaner, faster interface optimized for Universal Dependencies with an optional server-side component.

##### Contents
[Features](#features)

[Getting started](#getting-started)

[User guide](#user-guide)

[Contributing](#contributing)

[Support](#support)

[Acknowledgements](#acknowledgements)

[Contributors](#contributors)

## Features

Note: some features (corpus uploading, collaborative editing, etc.) only work when run with a server.

### dependency editing
| feature | how to use |
| -- | -- |
| add sentences | click the `+` button on the top row |
| remove sentences | click the `-` button on the top row |
| add heads | click on the dependent node, click on its head |
| edit heads | right-click on the dependency arrow, press `d`, click on its new head |
| edit dependency relation | click on the dependency arrow |
| remove heads | right-click on the dependency arrow, press `x`, `Backspace`, or `Delete` |
| edit part of speech labels | click on the light purple blobs below the blue 'form node' |
| edit tokens | right-click on the blue 'form node' |
| split token | click on the blue 'form node', press `s`, insert a `Space` character anywhere in the box, press `Enter` |
| split multi-word token | click on the lighter blue 'multi-word' node, press `s` |
| combine tokens into multi-word token | click on the blue 'form node', press `c`, then either click on one of the green nodes or use the `Left`/`Right` arrow keys |
| merge tokens | click on the blue 'form node', press `m`, then either click on one of the green nodes or use the `Left`/`Right` arrow keys |
| set sentence root | click on the blue 'form node', press `r` |
| direct text editing | edit the text in the main textarea (Note: by default, the textarea is reparsed every 100ms; this can be turned off by click the green `on` text in the bottom left of the screen) |
| table mode (CoNLL-U only) | convert the sentence into `CoNLL-U` format, click `Show > Table` from the dropdown menu |
| support for enhanced dependencies | click the `Tree` icon below the main textarea to toggle enhanced dependencies on/off; when on, adding heads/roots will not delete the existing heads |
| support for LTR/RTL/vertical writing systems | click the `Left-Justify`/`Right-Justify` icons below the main textarea |

### uploading, exporting
| feature | works without server? | how to use |
| -- | -- | -- |
| upload from file | no | |
| upload form URL | no | |
| export to LaTeX | yes | |
| export to PNG | yes | |
| save editor preferences | yes | |
| save annotation data | yes<sup>1</sup> | |

<sup>1</sup> if server unavailable, saves to `localStorage`

### labels
| feature | how to use |
| -- | -- |
| add label to sentence | |
| remove label from sentence | |
| edit label name | |
| edit label description | |
| edit label color | |
| filter sentences by label | |

### real-time collaboration<sup>2</sup>
| feature | how to use |
| -- | -- |
| dependency editing | |
| locking on selected node/edge | |
| global undo/redo | |
| mouse tracking | |
| chat | |

<sup>2</sup> all collaborative features require a server to be running

## Getting started

UD Annotatrix can be used in several different ways.  Some methods don't require a server backend, although this restricts the available features.

Many of these methods require the `node` and `npm` executables.  To check if you have these, run `node -v`.  If you don't, you can find installation instructions [here](https://www.npmjs.com/get-npm).

### serve dynamic files

Run a copy of UD Annotatrix with server backend on your machine.  Uploaded databases will be saved directly to your hard drive.  This is the recommended method.  To install, run
```bash
git clone https://github.com/jonorthwash/ud-annotatrix
cd ud-annotatrix/
npm install
```
You can configure the environment in several ways by setting `KEY=VALUE` pairs in the `.env` file (see [the server configuration file](server/config.js)).

To run the server, run `npm run dev-server` in the project directory root, then navigate your browser to `localhost:5316`.  If you would like to deploy your own copy of UD Annotatrix, you could alternately run `npm run server`.

### remote (dynamic) server

Access a copy of UD Annotatrix with server backend running on another machine.  Uploaded databases will be saved on the remote server.  Some currently active remote servers:
 - [Kevin's website](`http://annotator.murp.us/`)

### as a static file

Run a copy of UD Annotatrix without the server backend from a static file.  This version does __not__ have a server backend, so [some features](#features) will be unavailable.  Uploaded databases will be saved into `localStorage`.  Navigate your browser to `file:///path/to/ud-annotatrix/index.html`.

### serving static files

Serve up a copy of the UD Annotatrix static site.  This version does __not__ have a server backend, so [some features](#features) will be unavailable.  Uploaded databases will be saved into `localStorage`.  To start the server, `cd` to the project directory root and run `python -m http.server`.  The files should be available at `localhost:8000`.

If you want to host the static files, you can do so by

### remote (static) files

Access a copy of the UD Annotatrix static site on another machine.  This version does __not__ have a server backend, so [some features](#features) will be unavailable.  Uploaded databases will be saved into `localStorage`.  Some currently active remote static servers (items marked with '\*' are running older versions):
  - [Jonathan's GitHub Pages](https://jonorthwash.github.io/ud-annotatrix)
  * [Masha's GitHub pages](https://maryszmary.github.io/ud-annotatrix/standalone/annotator.html)\*
  * [Fran's GitHub pages](https://ftyers.github.io/ud-annotatrix/)\*
  * [web-corpora](http://web-corpora.net/wsgi3/annotatrix/)\* (beta).
  * [Jonathan's alternate GitHub pages](https://jonorthwash.github.io/visualiser.html)\* (just the visualizer code)


## User guide

The basic user guide is available on the [help page](https://maryszmary.github.io/ud-annotatrix/standalone/help.html).

## Contributing

We welcome your pull requests!  To get started, fork this repository and run (where `$REPO` gives the fork's URL)
```bash
git clone $REPO
cd ud-annotatrix
npm install
```

Whenever you make changes, you will need to regenerate some of the source files.  You can compile by running `npm run build`.  Alternatively, you could run `npm run build-watch` to compile and then listen for changes.

See also: the [API Documentation](documentation/README.md).

## Support

Having a problem with UD Annotatrix? Want some one-on-one support? You can try to reach us on IRC at <tt>#\_u-dep</tt> on <tt>irc.freenode.net</tt> or
join our [Telegram chat](https://t.me/joinchat/EWWgMhGXARzxvgO5AzI0ew).

## Acknowledgements

If you use UD Annotatrix in your work, please cite:

```
@inproceedings{tyers-etal:2018,
  author = {Francis M. Tyers and Mariya Sheyanova and Jonathan North Washington},
  title = {UD Annotatrix: An annotation tool for Universal Dependencies},
  booktitle ={Proceedings of the 16th International Workshop on Treebanks and Linguistic Theories (TLT16)},
  pages = {10--17},
  year = 2018
}
```

## Contributors

* Jonathan North Washington ([@jonorthwash](https://github.com/jonorthwash))
* Kevin Murphy ([@keggsmurph21](https://github.com/keggsmurph21); [documentation of the changes](https://gist.github.com/keggsmurph21))
* Mariya Sheyanova ([@maryszmary](https://github.com/maryszmary); [documentation of the changes](http://wiki.apertium.org/wiki/UD_annotatrix/UD_annotatrix_at_GSoC_2017))
* Tai Vongsathorn Warner ([@MidasDoas](https://github.com/MidasDoas); [documentation of the changes](https://wikis.swarthmore.edu/ling073/User:Twarner2/Final_project))
* Francis Tyers ([@ftyers](https://github.com/ftyers))
* Grzegorz Stark ([@gstark0](https://github.com/gstark0))
* Jonathan Pan ([@JPJPJPOPOP](https://github.com/JPJPJPOPOP))
* Suresh Michael Peiris ([@tsuresh](https://github.com/tsuresh))
* Diogo Fernandes ([@diogoscf](https://github.com/diogoscf))
* Robin Richtsfeld ([@Androbin](https://github.com/Androbin))
* Sushain Cherivirala ([@sushain97](https://github.com/sushain97))
* Kevin Brubeck Unhammer ([@unhammer](https://github.com/unhammer))
* Ethan Yang ([@thatprogrammer1](https://github.com/thatprogrammer1))

See also: the [AUTHORS](AUTHORS) file.
