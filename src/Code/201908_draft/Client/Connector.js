const uuidv4 = require("uuid/v4");
const Dispatch = require("./Dispatch");
const Execute = require("../Decider/Execute");
const objectify = require("../Services/Objectify");
const { ExternalZenatonError } = require("../../../Errors");

const Connector = class Connector {
  constructor(service, serviceId, processor) {
    this._checkString(service, "First", "connector's name");
    this._checkString(serviceId, "Second", "connector's id");

    this._service = service;
    this._serviceId = serviceId;
    this._processor = processor;
  }

  get dispatch() {
    return objectify(Dispatch, this._processor, this._service, this._serviceId);
  }

  get execute() {
    return objectify(Execute, this._processor, this._service, this._serviceId);
  }

  _getJob(verb, url, body, headers) {
    this._checkString(url, "First", "url", `.${verb}`);

    return {
      name: `${verb} ${this._service}:${url}`,
      input: {
        service: this._service,
        serviceId: this._serviceId,
        verb,
        url,
        body,
        headers,
      },
      intentId: uuidv4(),
    };
  }

  _checkString(val, position, type, method = "") {
    if (typeof val !== "string") {
      throw new ExternalZenatonError(
        `${position} parameter of "connector${method}" must be a string (${type}) - not a "${typeof id}"`,
      );
    }
    if (typeof val !== "string" || val.length > 128) {
      throw new ExternalZenatonError(
        `${position} parameter of "connector${method}" (${type}) must have less than 128 characters"`,
      );
    }
  }
};

module.exports = Connector;
