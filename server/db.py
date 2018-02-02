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

    def get_sentence(self, sent_num):
        """
        Takes an integer with sentence number and returns a sentence with this number.
        """
        db = sqlite3.connect(self.path)
        cur = db.cursor()
        cur.execute('SELECT sentence FROM corpus WHERE SentNum = ?', (int(sent_num) - 1,))
        sentence = cur.fetchone()[0]
        db.commit()
        cur.execute('SELECT COUNT(sentence) FROM corpus')
        max_sent = cur.fetchone()[0]
        db.commit()
        db.close()
        return sentence, max_sent

    def update_db(self, sentence, sent_num):
        db = sqlite3.connect(self.path)
        cur = db.cursor()
        sent_num = int(sent_num) - 1
        cur.execute('UPDATE corpus SET sentence = (?) WHERE SentNum = (?)', (sentence, sent_num))
        db.commit()
        db.close()

    def get_file(self):
        db = sqlite3.connect(self.path)
        cur = db.cursor()
        cur.execute('SELECT sentence FROM corpus ORDER BY SentNum')
        corpus = cur.fetchall()
        corpus = '\n\n'.join([tu[0] for tu in corpus])
        db.commit()
        cur.execute('SELECT corp_name FROM meta')
        corpus_name = cur.fetchone()[0]
        db.close()
        return corpus, corpus_name
