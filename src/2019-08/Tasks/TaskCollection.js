const axios = require("axios");

class TaskCollection {
  constructor(query = {}) {
    this.query = query;

    return this;
  }

  whereId(id) {
    this.updateQuery({ id });

    return this;
  }

  whereName(name) {
    this.updateQuery({ name });

    return this;
  }

  hasTag(...tags) {
    this.updateQuery({ tags });

    return this;
  }

  updateQuery(query) {
    this.query = Object.assign({}, this.query, query);
  }

  async id() {
    // todo: implement with query content
    return (await axios.get("https://todo.zenaton.com/id")).data;
  }

  async history() {
    // todo: implement with query content
    return (await axios.get("https://todo.zenaton.com/history")).data;
  }

  async skip() {
    // todo: implement with query content
    return (await axios.post("https://todo.zenaton.com/skip")).data;
  }

  getQuery() {
    return this.query;
  }
}

module.exports = (query) => new TaskCollection(query);
