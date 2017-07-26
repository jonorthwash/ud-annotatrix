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


app = Flask(__name__, static_folder='../standalone', static_url_path='/annotatrix')


@app.route('/', methods=['GET', 'POST'])
def parse_request():
    data = 'hello world'
    if request.form:
        data = request.form
        print('got it!')
        print(request.args)
    return jsonify()


@app.route('/annotatrix/annotator.html', methods=['GET', 'POST'])
def annotatrix():
    # if request.form:
    #     return redirect(url_for('results'))
    return send_from_directory('../standalone', 'annotator.html')


@app.route('/annotatrix', methods=['GET', 'POST'])
def annotatrix_index():
    # return send_from_directory('../standalone', 'annotator.html') # TODO: redirect
    return redirect(url_for('annotatrix'))


@app.route('/annotatrix/<treebank_id>')
def corpus_page():
    return '<html></html>'

if __name__ == '__main__':
    app.secret_key = 'toshcpri]7f2ba027b824h6[hs87nja5enact'
    app.run(debug = True, port = 5312)