const request = require('request-promise');

module.exports = {
  userRequest: ({type, endpoint, body}) => {
    let requestOptions;
    if (type === 'GET') {
      requestOptions = {
        method: 'GET',
        uri: `http://localhost:3001/${endpoint}`,
        json: true
      };
    } else if (type === 'POST') {
      requestOptions = {
        method: 'POST',
        uri: `http://localhost:3001/${endpoint}`,
        body,
        json: true
      };
    }

    return request(requestOptions)
    .then((response) => {
      return response;
    })
    .catch((err) => {throw err});
  }
}