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
from log import Logger

env = Env(filename='.env')

PATH_TO_CORPORA = env.get('PATH_TO_CORPORA', 'corpora')
SECRET_KEY = env.get('SECRET_KEY', 'secret-key-123')
HOST = env.get('HOST', '127.0.0.1')
PORT = env.get('PORT', '5316')

logger = Logger(env=env, name='SERVER')

welcome = '''
*******************************************************************************
* NOW POINT YOUR BROWSER AT: http://{}:{}/                           *
*******************************************************************************
'''

app = Flask(__name__, static_folder='../standalone', static_url_path='/annotatrix')

if not os.path.exists(PATH_TO_CORPORA):
    logger.info('Initializing: Corpus ({})'.format(PATH_TO_CORPORA))
    os.mkdir(PATH_TO_CORPORA)


@app.route('/save', methods=['GET', 'POST'])
def save_corpus():
    logger.info('{} /save'.format(request.method))
    if request.form:
        logger.info('/save form: {}'.format(request.form))
        sent = request.form['content']
        treebank_id = request.form['treebank_id']
        db_path = treebank_path(treebank_id)
        sent_num = request.form['sentNum']
        if os.path.exists(db_path):
            logger.debug('/save updating db at {}'.format(db_path))
            db = CorpusDB(db_path)
            db.update_db(sent, sent_num)
        else:
            logger.warn('/save no db found at {}'.format(db_path))
        return jsonify()
    else:
        logger.warn('/save no form received')
    return jsonify()


@app.route('/load', methods=['GET', 'POST'])
def load_sentence():
    logger.info('{} /load'.format(request.method))
    if request.form:
        logger.info('/load form: {}'.format(request.form))
        treebank_id = request.form['treebank_id']
        db_path = treebank_path(treebank_id)
        sent_num = request.form['sentNum']
        if os.path.exists(db_path):
            logger.debug('/load updating db at {}'.format(db_path))
            db = CorpusDB(db_path)
            sent, max_sent = db.get_sentence(sent_num)
            return jsonify({'content': sent, 'max': max_sent})
        else:
            logger.warn('/load no db found at {}'.format(db_path))
            return jsonify({'content': 'something wrong'})
    else:
        logger.warn('/load no form received')
    return jsonify()


@app.route('/annotatrix/download', methods=['GET', 'POST'])
def download_corpus():
    logger.info('{} /annotatrix/download'.format(request.method))
    if request.args:
        logger.info('/annotatrix/download args: {}'.format(request.args))
        treebank_id = request.args['treebank_id'].strip('#')
        db_path = treebank_path(treebank_id)
        file_path = treebank_id(treebank_id, extension='')
        if os.path.exists(db_path):
            logger.debug('/annotatrix/download updating db at {}'.format(db_path))
            db = CorpusDB(db_path)
            corpus, corpus_name = db.get_file()
            with open(file_path, 'w') as f:
                f.write(corpus)
            logger.debug('/annotatrix/download sending file {}'.format(file_path))
            return send_file(file_path, as_attachment=True, attachment_filename=corpus_name)
        else:
            logger.warn('/annotatrix/download no db found at {}'.format(db_path))
    else:
        logger.warn('/annotatrix/download no args received')
    return jsonify({'corpus': 'something went wrong'})


@app.route('/annotatrix/upload', methods=['GET', 'POST'])
def upload_new_corpus():
    logger.info('{} /annotatrix/upload'.format(request.method))
    if request.method == 'POST':
        if 'file' in request.files:
            try:
                logger.debug('/annotatrix/upload files: {}'.format(request.files))
                f = request.files['file']
                corpus_name = f.filename
                corpus = f.read().decode()
                treebank_id = str(uuid.uuid4())
                db_path = treebank_path(treebank_id)
                db = CorpusDB(db_path)
                db.write_corpus(corpus, corpus_name)
                return redirect(url_for('corpus_page', treebank_id=treebank_id))
            except Exception as e:
                logger.error('/annotatrix/upload error: {}'.format(e))
        else:
            logger.warn('/annotatrix/upload no file received')
    return jsonify({'something': 'went wrong'})


@app.route('/annotatrix/running', methods=['GET', 'POST'])
def running():
    logger.info('{} /annotatrix/running'.format(request.method))
    return jsonify({'status': 'running'})


@app.route('/annotatrix/', methods=['GET', 'POST'])
def annotatrix():
    logger.info('{} /annotatrix/'.format(request.method))
    treebank_id = str(uuid.uuid4())
    return redirect(url_for('corpus_page', treebank_id=treebank_id))


@app.route('/', methods=['GET', 'POST'])
def index():
    logger.info('{} /'.format(request.method))
    return send_from_directory('../standalone', 'welcome_page.html')


# @app.route('/<treebank_id>', methods=['GET', 'POST'])
# def index_corpus(treebank_id):
#     return redirect(url_for('corpus_page', treebank_id=treebank_id))


@app.route('/annotatrix/<treebank_id>')
def corpus_page(treebank_id):
    logger.info('corpus page for treebank_id: {}'.format(treebank_id))
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
    print(welcome.format(HOST, PORT))
    app.secret_key = SECRET_KEY
    app.run(debug = True, port = PORT)
