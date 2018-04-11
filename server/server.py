"""
This is the backend for the annotatrix tool. It allows to save a project
on a server and load it when needed.
"""

import sys
from io import BytesIO
from flask import Flask
from flask import jsonify
from flask import request
from flask import redirect
from flask import send_file
from flask import send_from_directory
from flask import url_for
from flask_github import GitHub
from dotenv import load_dotenv
import os
import uuid
from db import CorpusDB


PATH_TO_CORPORA = 'corpora'

welcome = '''
*******************************************************************************
* NOW POINT YOUR BROWSER AT: http://127.0.0.1:5316/                           *
*******************************************************************************
'''

load_dotenv('.env')
app = Flask(__name__, static_folder='../standalone', static_url_path='/annotatrix')
app.config['GITHUB_CLIENT_ID'] = '2aed75d6a4e13b9dd029'
app.config['GITHUB_CLIENT_SECRET'] = os.getenv('GITHUB_CLIENT_SECRET')
github = GitHub(app)

if not os.path.exists(PATH_TO_CORPORA):
    os.mkdir(PATH_TO_CORPORA)



@app.route('/save', methods=['GET', 'POST'])
def save_corpus():
    if request.form:
        sent = request.form['content']
        treebank_id = request.form['treebank_id']
        path = treebank_id.strip('#') + '.db'
        sent_num = request.form['sentNum']
        if os.path.exists(PATH_TO_CORPORA + '/' + path):
            db = CorpusDB(PATH_TO_CORPORA + '/' + path)
            db.update_db(sent, sent_num)
        return jsonify()
    return jsonify()


@app.route('/load', methods=['GET', 'POST'])
def load_sentence():
    if request.form:
        treebank_id = request.form['treebank_id']
        path = treebank_id.strip('#') + '.db'
        sent_num = request.form['sentNum']
        if os.path.exists(PATH_TO_CORPORA + '/' + path):
            db = CorpusDB(PATH_TO_CORPORA + '/' + path)
            sent, max_sent = db.get_sentence(sent_num)
            return jsonify({'content': sent, 'max': max_sent})
        else:
            return jsonify({'content': 'something wrong'})
    return jsonify()


@app.route('/annotatrix/download', methods=['GET', 'POST'])
def download_corpus():
    if request.args:
        treebank_id = request.args['treebank_id'].strip('#')
        db_path = treebank_id + '.db'
        if os.path.exists(PATH_TO_CORPORA + '/' + db_path):
            db = CorpusDB(PATH_TO_CORPORA + '/' + db_path)
            corpus, corpus_name = db.get_file()
            with open(PATH_TO_CORPORA + '/' + treebank_id, 'w') as f:
                f.write(corpus)
            return send_file(PATH_TO_CORPORA + '/' + treebank_id, as_attachment=True, attachment_filename=corpus_name)
    return jsonify({'corpus': 'something went wrong'})


@app.route('/annotatrix/upload', methods=['GET', 'POST'])
def upload_new_corpus():
    if request.method == 'POST':
        f = request.files['file']
        corpus_name = f.filename
        corpus = f.read().decode()
        treebank_id = str(uuid.uuid4())
        db = CorpusDB(PATH_TO_CORPORA + '/' + treebank_id + '.db')
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

@app.route('/login', methods=['GET', 'POST'])
def login():
    return github.authorize()

@app.route('/github-callback', methods=['GET', 'POST'])
@github.authorized_handler
def authorized(oauth_token):
    print('token', oauth_token)
    
    next_url = request.args.get('next') or url_for('index')
    if oauth_token is None:
        return redirect(next_url)

    '''
    user = User.query.filter_by(github_access_token=oauth_token).first()
    if user is None:
        user = User(oauth_token)
        db_session.add(user)

    user.github_access_token = oauth_token
    db_session.commit()'''
    return redirect(next_url)
# @app.route('/<treebank_id>', methods=['GET', 'POST'])
# def index_corpus(treebank_id):
#     return redirect(url_for('corpus_page', treebank_id=treebank_id))


@app.route('/annotatrix/<treebank_id>')
def corpus_page(treebank_id):
    print('XX:',treebank_id, file=sys.stderr)
    if '.' in treebank_id:
        return send_from_directory('../standalone', treebank_id)
#    if treebank_id == 'help.html':
#        return send_from_directory('../standalone', 'help.html')
#    if treebank_id == 'export.html':
#        return send_from_directory('../standalone', 'export.html')
    return send_from_directory('../standalone', 'annotator.html')


if __name__ == '__main__':
    print(welcome)
    app.secret_key = 'toshcpri]7f2ba027b824h6[hs87nja5enact'
    app.run(debug = True, port = 5316)
