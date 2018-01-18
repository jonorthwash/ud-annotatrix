"""
This is the database module. It contains DB class.
"""

import os
import sqlite3


class CorpusDB():
    '''the db fith tests and users'''

    def __init__(self, path):
        self.path = path
        if not os.path.exists(self.path):
            self.create() # create the database if there's none yet

    def create(self):
        """
        Creates the database.
        """
        db = sqlite3.connect(self.path)
        cur = db.cursor()
        cur.execute('CREATE TABLE corpus (SentNum integer, sentence)')
        cur.execute('CREATE TABLE meta (corp_name)')
        db.commit()

    def write_corpus(self, corpus, corpus_name):
        """
        Writes the corpus data to the database
        """
        db = sqlite3.connect(self.path)
        cur = db.cursor()
        corpus = enumerate(corpus.split('\n\n'))
        cur.executemany('INSERT INTO corpus VALUES (?, ?)', corpus)
        db.commit()
        cur.execute('INSERT INTO meta VALUES (?)', (corpus_name, ))
        db.commit()
        db.close()
