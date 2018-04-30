import os

class Env(object):
	def __init__(self, filename):

		self.root = os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
		self.filepath = os.path.join(self.root, filename)
		self.variables = {}

		self.set('ROOT', self.root)

		if os.path.exists(self.filepath):
			self.read()

	def read(self):
		with open(self.filepath) as f:
			for line in f.readlines():
				key,value = line.split('=')
				self.variables[key] = value.strip('\n')

	def get(self, key, default=None):
		if key in self.variables:
			return self.variables[key]
		return default

	def set(self, key, value):
		self.variables[key] = value
		self.save()

	def save(self):
		with open(self.filepath, 'w') as f:
			for key in self.variables:
				f.write('{}={}\n'.format(key, self.variables[key]))

	def __repr__(self):
		return str(self.variables)
