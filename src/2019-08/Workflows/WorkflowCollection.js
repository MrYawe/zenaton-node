const axios = require("axios");

class WorkflowCollection {
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

  async pause() {
    // todo: implement with query content
    return (await axios.post("https://todo.zenaton.com/pause")).data;
  }

  async resume() {
    // todo: implement with query content
    return (await axios.post("https://todo.zenaton.com/resume")).data;
  }

  async terminate() {
    // todo: implement with query content
    return (await axios.post("https://todo.zenaton.com/terminate")).data;
  }

  async send(name, data) {
    // todo: implement with query content and event
    return (await axios.post("https://todo.zenaton.com/send", {
      name,
      data,
    })).data;
  }

  getQuery() {
    return this.query;
  }
}

module.exports = (query) => new WorkflowCollection(query);
