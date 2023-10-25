const responseJson = (success, data = null, message = "", code = 200, errors = []) => {
  return {
    success,
    data,
    message,
    code,
    errors
  };
};


module.exports = responseJson;
