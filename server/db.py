"""
This is the database module. It contains DB class.
"""

import os
import sqlite3
import json

class CorpusDB():
    '''the db with tests and users'''

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
        cur.execute('CREATE TABLE corpus (num integer primary key, sent)')
        cur.execute('CREATE TABLE meta (num integer primary key, filename, gui)')
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

    def get_sentence(self, num):
        """
        Takes an integer with sentence number and returns a sentence with this number.
        """
        db = sqlite3.connect(self.path)
        cur = db.cursor()

        cur.execute('SELECT sent FROM corpus WHERE num = ?', (int(num),))
        sentence = cur.fetchone()
        if not sentence:
            raise ValueError(f'unable to get nx at num={num}')
        #sentence = sentence[0]
        db.commit()

        cur.execute('SELECT COUNT(sent) FROM corpus')
        max_sent = cur.fetchone()
        if not max_sent:
            raise ValueError(f'unable to get max_sent at num={num})')
        max_sent = max_sent[0]
        db.commit()

        db.close()

        filename, gui = self.get_meta()
        return sentence, max_sent, filename, gui

    def get_sentences(self):
        """
        Returns all sentences and the total number of sentences
        """
        db = sqlite3.connect(self.path)
        cur = db.cursor()

        cur.execute('SELECT sent FROM corpus')
        sentences = cur.fetchall()
        if not sentences:
            raise ValueError(f'unable to get sent')
        sentences = [s[0] for s in sentences]
        db.commit()

        db.close()

        filename, gui = self.get_meta()
        return sentences, len(sentences), filename, gui

    def get_meta(self):
        """
        Returns the filename and a JSON stringified version of the GUI settings
        """
        db = sqlite3.connect(self.path)
        cur = db.cursor()

        cur.execute('SELECT filename, gui FROM meta')
        meta = cur.fetchall()
        if not meta:
            raise ValueError(f'unable to get meta')
        print(meta)
        meta = meta[0]
        db.commit()

        db.close()
        return meta[0], meta[1]

    def update_db(self, state):
        db = sqlite3.connect(self.path)
        cur = db.cursor()

        sentences = state['sentences']
        for i in range(len(sentences)):
            sent = json.dumps(sentences[i])
            cur.execute('INSERT or REPLACE into corpus (num, sent) VALUES (?, ?)', (i, sent))

        cur.execute('INSERT or REPLACE into meta (num, filename, gui) VALUES (0, ?, ?)', (
            state['filename'],
            json.dumps(state['gui'])
        ));

        db.commit()
        db.close()


    def get_file(self):
        db = sqlite3.connect(self.path)
        cur = db.cursor()
        cur.execute('SELECT sentence FROM corpus ORDER BY num')
        corpus = cur.fetchall()
        corpus = '\n\n'.join([tu[0] for tu in corpus])
        db.commit()
        cur.execute('SELECT corp_name FROM meta')
        corpus_name = cur.fetchone()[0]
        db.close()
        return corpus, corpus_name
