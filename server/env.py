import os

class Env(object):
	def __init__(self, filename='.env'):

		self.root = os.path.abspath(os.path.join(os.path.dirname(__file__),'..'))
		self.filepath = os.path.join(self.root, filename)
		self.variables = {}

		if os.path.exists(self.filepath):
			print('doesn\'t exist')
			self.read()

		self.set('ROOT', self.root)

	def read(self):
		with open(self.filepath) as f:
			for line in f.readlines():
				key,value = line.split('=')
				self.variables[key] = value.strip('\n')
		self.save()

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
