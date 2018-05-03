import datetime
import os
import sys

class Logger():

    def __init__(self, env=None, name='DEFAULT'):

        self.name = name

        # get file path
        logs = os.path.join(env.get('ROOT'), 'logs')
        if not os.path.exists(logs):
            os.mkdir(logs)
        self.file = os.path.join(logs, self.name.lower() + '.log')

        # set debug level
        levels = ['CRITICAL','ERROR','WARN','INFO','DEBUG']
        self.level_name = env.get('DEBUG', 'CRITICAL')
        self.level = levels.index(self.level_name)

        # write status stuff
        self.write(file=self.file, message='\n\n\n')
        self.debug('Initializing: {}'.format(self))


    def format(self, show_time=True, prefix=None, message=''):

        string = ''
        if show_time:
            string += '[{}] '.format(get_time())
        string += '{} '.format(self.name)
        if prefix is not None:
            string += '{}: '.format(prefix)
        string += str(message)
        string += '\n'

        return string


    def write(self, file='', message=''):

        with open(file, 'a') as f:
            f.write(message)


    def handle(self, message, file, prefix, level):

        message = self.format(prefix=prefix, message=message)

        if self.level >= level:
            sys.stderr.write(message)
            self.write(file=self.file, message=message)

    def critical(self, message, file='main'):
        self.handle(message, file, 'CRITICAL', 0)

    def error(self, message, file='main'):
        self.handle(message, file, 'ERROR', 1)

    def warn(self, message, file='main'):
        self.handle(message, file, 'WARN', 2)

    def info(self, message, file='main'):
        self.handle(message, file, 'INFO', 3)

    def debug(self, message, file='main'):
        self.handle(message, file, 'DEBUG', 4)


    def __repr__(self):
        return 'Logger (name={}, level={})'.format(self.name, self.level_name)

def get_time():
    return str(datetime.datetime.now())
