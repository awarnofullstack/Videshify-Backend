const responseJson = (success, data = null, message = "", code = 200, errors = []) => {
  return {
    success,
    data,
    message: message.length == 0 ? "Successfuly processed." : message,
    code,
    errors
  };
};


module.exports = responseJson;
