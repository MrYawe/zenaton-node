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
    this.query.customId = id;

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
    await this.client.killWorkflow(this.query);
  }

  /**
   * Pause a workflow instance
   */
  async pause() {
    await this.client.pauseWorkflow(this.query);
  }

  /**
   * Resume a workflow instance
   */
  async resume() {
    await this.client.resumeWorkflow(this.query);
  }
};
