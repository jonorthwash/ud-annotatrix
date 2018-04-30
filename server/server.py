'''
This is the backend for the annotatrix tool. It allows to save a project
on a server and load it when needed.
'''

import sys
from io import BytesIO
from flask import Flask
from flask import jsonify
from flask import request
from flask import redirect
from flask import send_file
from flask import send_from_directory
from flask import url_for
import os
import uuid
from db import CorpusDB
from env import Env

env = Env('.env')

PATH_TO_CORPORA = env.get('PATH_TO_CORPORA', 'corpora')
SECRET_KEY = env.get('SECRET_KEY', 'secret-key-123')
HOST = env.get('HOST', '127.0.0.1')
PORT = env.get('PORT', '5316')

welcome = '''
*******************************************************************************
* NOW POINT YOUR BROWSER AT: http://{}:{}/                           *
*******************************************************************************
'''.format(HOST, PORT)

app = Flask(__name__, static_folder='../standalone', static_url_path='/annotatrix')

if not os.path.exists(PATH_TO_CORPORA):
    os.mkdir(PATH_TO_CORPORA)


@app.route('/save', methods=['GET', 'POST'])
def save_corpus():
    if request.form:
        sent = request.form['content']
        treebank_id = request.form['treebank_id']
        db_path = treebank_path(treebank_id)
        sent_num = request.form['sentNum']
        if os.path.exists(db_path):
            db = CorpusDB(db_path)
            db.update_db(sent, sent_num)
        return jsonify()
    return jsonify()


@app.route('/load', methods=['GET', 'POST'])
def load_sentence():
    if request.form:
        treebank_id = request.form['treebank_id']
        db_path = treebank_path(treebank_id)
        sent_num = request.form['sentNum']
        if os.path.exists(db_path):
            db = CorpusDB(db_path)
            sent, max_sent = db.get_sentence(sent_num)
            return jsonify({'content': sent, 'max': max_sent})
        else:
            return jsonify({'content': 'something wrong'})
    return jsonify()


@app.route('/annotatrix/download', methods=['GET', 'POST'])
def download_corpus():
    if request.args:
        treebank_id = request.args['treebank_id'].strip('#')
        db_path = treebank_path(treebank_id)
        file_path = treebank_id(treebank_id, extension='')
        if os.path.exists(db_path):
            db = CorpusDB(db_path)
            corpus, corpus_name = db.get_file()
            with open(file_path, 'w') as f:
                f.write(corpus)
            return send_file(file_path, as_attachment=True, attachment_filename=corpus_name)
    return jsonify({'corpus': 'something went wrong'})


@app.route('/annotatrix/upload', methods=['GET', 'POST'])
def upload_new_corpus():
    if request.method == 'POST':
        f = request.files['file']
        corpus_name = f.filename
        corpus = f.read().decode()
        treebank_id = str(uuid.uuid4())
        db_path = treebank_path(treebank_id)
        db = CorpusDB(db_path)
        db.write_corpus(corpus, corpus_name)
        return redirect(url_for('corpus_page', treebank_id=treebank_id))
    return jsonify({'something': 'went wrong'})


@app.route('/annotatrix/running', methods=['GET', 'POST'])
def running():
    return jsonify({'status': 'running'})


@app.route('/annotatrix/', methods=['GET', 'POST'])
def annotatrix():
    treebank_id = str(uuid.uuid4())
    return redirect(url_for('corpus_page', treebank_id=treebank_id))


@app.route('/', methods=['GET', 'POST'])
def index():
    return send_from_directory('../standalone', 'welcome_page.html')


# @app.route('/<treebank_id>', methods=['GET', 'POST'])
# def index_corpus(treebank_id):
#     return redirect(url_for('corpus_page', treebank_id=treebank_id))


@app.route('/annotatrix/<treebank_id>')
def corpus_page(treebank_id):
    print('XX:',treebank_id, file=sys.stderr)
    if '.' in treebank_id:
        return send_from_directory('../standalone', treebank_id)
    return send_from_directory('../standalone', 'annotator.html')


def treebank_path(treebank_id, extension='.db'):
    '''
    Provides a consistent way to get the path to a corpus from the treebank_id.
    Note that the path used by the db will have a `.db` extension, but files
    sent from the server will not.  In this case, the function should be called
    with extension=''.

    @param treebank_id
    @param extension
    @return path to corpus file (with extension)
    '''
    return os.path.join(PATH_TO_CORPORA, treebank_id.strip('#') + extension)




if __name__ == '__main__':
    print(welcome)
    app.secret_key = SECRET_KEY
    app.run(debug = True, port = PORT)
