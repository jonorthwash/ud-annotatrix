import os

class Env():
    def __init__(self, filepath):
        self.variables = {}
        self.read(filepath)

    def read(self, filepath):
        with open(filepath) as f:
            for line in f.readlines():
                key,value = line.split('=')
                self.variables[key] = value.strip('\n')

    def get(self, key):
        if key in self.variables:
            return self.variables[key]
        return None

    def __repr__(self):
        return str(self.variables)
