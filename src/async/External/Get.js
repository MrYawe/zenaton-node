const axios = require("axios");
const Task = require("../Tasks/Task");

module.exports = Task("zenaton:httpGetTask", {
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

    const response = await axios.get(this.url, {
      params: this.params,
      headers,
    });

    return response.data;
  },
});
