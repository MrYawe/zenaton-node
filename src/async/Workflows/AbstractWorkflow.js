const CronParser = require("cron-parser");
const Sender = require("../Events/Sender");
const Listener = require("../Events/Listener");

const Engine = require("../Engine/Engine");
const { ZenatonError } = require("../../Errors");

module.exports = class AbstractWorkflow {
  constructor(name) {
    // class name
    this.name = name;
  }

  // asynchronous execution within a workflow
  async schedule() {
    const result = await new Engine().dispatch([this]);
    return result[0].then(() => undefined);
  }

  // asynchronous execution within a workflow
  async dispatch(...args) {
    return this.schedule(...args);
  }

  // synchronous execution within a workflow
  async execute() {
    const result = await new Engine().execute([this]);
    return result[0];
  }

  repeat(cron) {
    if (typeof cron !== "string") {
      throw new ZenatonError(
        "Param passed to 'repeat' function must be a string",
      );
    }

    try {
      CronParser.parseExpression(cron);
    } catch (err) {
      throw new ZenatonError(
        "Param passed to 'repeat' function is not a proper CRON expression",
      );
    }

    this.scheduling = this.scheduling || {};
    this.scheduling.cron = cron;

    return this;
  }

  id() {
    return new Engine().getInstanceId();
  }

  // todo: implement
  history() {
    return "to implement";
  }

  // todo: implement
  skip() {
    return "to implement";
  }

  // todo: implement
  pause() {
    return "to implement";
  }

  // todo: implement
  terminate() {
    return "to implement";
  }

  // todo: improve
  async send(eventName, eventData) {
    // eslint-disable-next-line no-return-await
    return Sender(this.id(), eventName, eventData);
  }

  // todo: improve
  async listen(service, filter) {
    return Listener.subscribe(service, filter).listen();
  }

  static methods() {
    return [
      "handle",
      "id",
      "onEvent",
      "onStart",
      "onSuccess",
      "onFailure",
      "onTimeout",
    ];
  }
};
