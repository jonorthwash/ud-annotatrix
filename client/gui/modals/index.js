module.exports = gui => {
  return {

    uploadFile: require('./upload-file')(gui),
    uploadURL: require('./upload-url')(gui),

  };
};
