const axios = require("axios");
const service = require("../../../config/services").listeners;
const { Task } = require("../Tasks");
const Engine = require("../Engine/Engine");
const Client = require("../Client");

const AddListenerTask = Task("zenaton:addListenerTask", {
  init(url, params, headers) {
    this.url = url;
    this.params = params || {};
    this.headers = headers || {};
  },

  async handle() {
    const client = new Client();

    this.params.appId = client.getAppId();
    this.params.apiToken = client.getApiToken();
    this.params.instanceId = new Engine().getInstanceId();

    await axios.post(this.url, this.params, this.headers);
  },
});

class Listener {
  constructor(event, filters = null) {
    const tab = event.split(":");

    this.source = tab[0];
    this.event = tab[1] || "*";
    this.setFilters(filters);

    this.url = `${service}/${this.source}`;

    return this;
  }

  setFilters(filters) {
    this.filters = filters;

    return this;
  }

  async listen() {
    const headers = this.headers();
    await new AddListenerTask(
      this.url,
      {
        event: this.event,
        filters: this.filters,
      },
      headers,
    ).execute();
  }

  headers() {
    const headers = {
      "Content-Type": this.contentType,
    };

    if (this.bearer) {
      headers.Authorization = `Bearer ${this.bearer}`;
    }

    return headers;
  }
}

module.exports.subscribe = (event) => new Listener(event);
