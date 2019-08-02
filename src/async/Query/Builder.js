const Client = require("../Client");
const Engine = require("../Engine/Engine");

module.exports = class QueryBuilder {
  constructor(workflowClass) {
    this.client = new Client();
    this.query = {
      whereName: workflowClass,
    };
  }

  /**
   * Create a new pending job dispatch.
   */
  whereId(id) {
    this.query.whereCustomId = id;

    return this;
  }

  /**
   * Retrieve an instance
   */
  async find() {
    return this.client.findWorkflow(this.query);
  }

  /**
   * Send an event
   */
  async send(eventName, eventData = {}) {
    return new Engine().sendEvent(this.query, eventName, eventData);
  }

  /**
   * Kill a workflow instance
   */
  async kill() {
    return new Engine().killWorkflow(this.query);
  }

  /**
   * Pause a workflow instance
   */
  async pause() {
    return new Engine().pauseWorkflow(this.query);
  }

  /**
   * Resume a workflow instance
   */
  async resume() {
    return new Engine().resumeWorkflow(this.query);
  }
};
