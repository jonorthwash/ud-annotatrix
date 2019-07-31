module.exports = gui => {
  return {

    uploadFile: require('./upload-file')(gui),
    uploadURL: require('./upload-url')(gui),
    forkFile: require('./fork-file')(gui),
    commitFile: require('./commit-file')(gui),
    pullRequest: require('./pull-request')(gui),

  };
};
