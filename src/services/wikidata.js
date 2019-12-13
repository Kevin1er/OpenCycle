const fetch = require("node-fetch");

class Wikibase {
  constructor(_endpoint) {
    this.endpoint = _endpoint;
  }
  async query(_query) {
    var answer = await fetch(
      `${this.endpoint}?query=${_query}&format=json&origin=*`
    ).then(data => {
      return data.json();
    });
    return await answer;
  }
}

export default Wikibase;
