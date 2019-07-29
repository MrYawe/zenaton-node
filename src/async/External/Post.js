const axios = require("axios");
const Task = require("../Tasks/Task");
const Engine = require("../Engine/Engine");

module.exports = Task("zenaton:httpPostTask", {
  init(url, params, headers) {
    this.url = url;
    this.params = params || {};
    this.headers = headers || {};
  },

  async handle() {
    const headers = Object.assign(
      {},
      {
        "Content-Type": "application/json;charset=utf-8",
      },
      this.headers,
    );

    console.log("FOO", "BAR");
    console.log("HEADERS", headers);
    const response = await axios.post(this.url, this.params, {
      headers,
    });

    if (response.data && response.data.ok) {
      if (response.data.ts) {
        new Engine().getInstanceId();
      }
    }

    return response.data;
  },
});
