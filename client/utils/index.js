const _ = require('underscore');
const funcs = require('./funcs');

module.exports = _.extend(funcs, {

  errors: require('./errors'),
  export: require('./export'),
  storage: require('./local-storage'),
  validate: require('./validate'),

});
