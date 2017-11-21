"""
This is the backend for the annotatrix tool. It allows to save a project
on a server and load it when needed.
"""

from flask import Flask
from flask import jsonify
from flask import request
from flask import redirect
from flask import send_from_directory
from flask import url_for
import os
import uuid


PATH_TO_CORPORA = 'corpora'

app = Flask(__name__, static_folder='../standalone', static_url_path='/annotatrix')

if not os.path.exists(PATH_TO_CORPORA):
    os.mkdir(PATH_TO_CORPORA)


@app.route('/save', methods=['GET', 'POST'])
def save_corpus():
    if request.form:
        data = request.form['content']
        treebank_id = request.form['treebank_id']
        treebank_id = treebank_id.strip('#')

        with open(PATH_TO_CORPORA + '/' + treebank_id, 'w') as f:
            f.write(data)
        return jsonify({'id': treebank_id, 'content': data})
    return jsonify()


@app.route('/load', methods=['GET', 'POST'])
def load_corpus():
    treebank_id = request.form['treebank_id']
    treebank_id = treebank_id.strip('#')
    if os.path.exists(PATH_TO_CORPORA + '/' + treebank_id):
        with open(PATH_TO_CORPORA + '/' + treebank_id) as f:
            corpus = f.read()
        return jsonify({'content': corpus})
    return jsonify()


@app.route('/annotatrix/running', methods=['GET'])
def running():
    return jsonify()


@app.route('/annotatrix/annotator.html', methods=['GET', 'POST'])
def annotatrix():
    treebank_id = str(uuid.uuid4())
    return redirect(url_for('corpus_page', treebank_id=treebank_id))


@app.route('/annotatrix', methods=['GET', 'POST'])
def annotatrix_index():
    return redirect(url_for('annotatrix'))


@app.route('/annotatrix/<treebank_id>')
def corpus_page(treebank_id):
    return send_from_directory('../standalone', 'annotator.html')


if __name__ == '__main__':
    app.secret_key = 'toshcpri]7f2ba027b824h6[hs87nja5enact'
    app.run(debug = True, port = 5316)