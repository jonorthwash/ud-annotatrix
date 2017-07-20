"""
This is the backend for the annotatrix tool. It allows to save a project
on a server and load it when needed.
"""

from flask import Flask
from flask import send_from_directory
import os


app = Flask(__name__, static_folder='..', static_url_path='/annotatrix')


if __name__ == '__main__':
    app.secret_key = 'toshcpri]7f2ba027b824h6[hs87nja5enact'
    app.run(debug = True, port = 5312)