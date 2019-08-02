const Client = require("../Client");
const InvalidArgumentError = require("../../Errors/InvalidArgumentError");
const workflowManager = require("../Workflows/WorkflowManager");
const taskManager = require("../Tasks/TaskManager");
const { ExternalZenatonError } = require("../../Errors");

let instance = null;

module.exports = class Engine {
  constructor() {
    // singleton
    if (instance) {
      return instance;
    }
    instance = this;

    this.client = new Client();

    // No processor
    this.processor = null;
  }

  getInstanceId() {
    return this.processor &&
      typeof this.processor.microserver.getInstanceId === "function"
      ? this.processor.microserver.getInstanceId()
      : undefined;
  }

  setProcessor(processor) {
    this.processor = processor;
  }

  async sendEvent(query, eventName, eventData) {
    // Outside an Agent or Inside an Agent but not in a Decision
    if (!this.processor || !this.processor.microserver.isDeciding) {
      return this.client.sendEvent(query, eventName, eventData);
    }
    // In a decision
    if (!this.processor.sendEvent) {
      throw new ExternalZenatonError(
        "Please update your Agent to be able to send an event from a workflow",
      );
    }
    return this.processor.sendEvent(query, eventName, eventData);
  }

  async killWorkflow(query) {
    // Outside an Agent or Inside an Agent but not in a Decision
    if (!this.processor || !this.processor.microserver.isDeciding) {
      return this.client.killWorkflow(query);
    }
    // In a decision
    if (!this.processor.killWorkflow) {
      throw new ExternalZenatonError(
        "Please update your Agent to be able to kill a workflow from a workflow",
      );
    }
    return this.processor.killWorkflow(query);
  }

  async pauseWorkflow(query) {
    // Outside an Agent or Inside an Agent but not in a Decision
    if (!this.processor || !this.processor.microserver.isDeciding) {
      return this.client.pauseWorkflow(query);
    }
    // In a decision
    if (!this.processor.pauseWorkflow) {
      throw new ExternalZenatonError(
        "Please update your Agent to be able to pause a workflow from a workflow",
      );
    }
    return this.processor.pauseWorkflow(query);
  }

  async resumeWorkflow(query) {
    // Outside an Agent or Inside an Agent but not in a Decision
    if (!this.processor || !this.processor.microserver.isDeciding) {
      return this.client.resumeWorkflow(query);
    }
    // In a decision
    if (!this.processor.resumeWorkflow) {
      throw new ExternalZenatonError(
        "Please update your Agent to be able to resume a workflow from a workflow",
      );
    }
    return this.processor.resumeWorkflow(query);
  }

  async execute(jobs) {
    if (!jobs.length) {
      return [];
    }

    // check arguments'type
    this.checkArguments(jobs);

    // local execution
    if (this.processor == null) {
      // simply apply handle method
      const outputs = jobs.map(async (job) => {
        const handler = this.isWorkflow(job)
          ? job.handle()
          : job._promiseHandle();

        return handler;
      });

      // return results
      return outputs;
    }

    // executed by Zenaton processor
    return this.processor.process(jobs, true);
  }

  async dispatch(jobs) {
    if (!jobs.length) {
      return [];
    }

    // check arguments'type
    this.checkArguments(jobs);

    // local execution
    if (this.processor == null) {
      // dispatch works to Zenaton
      const outputs = jobs.map(async (job) => {
        const handler = this.isWorkflow(job)
          ? this.client.startWorkflow(job)
          : this.client.startTask(job);

        await handler;

        return undefined;
      });

      // return results
      return outputs;
    }

    // executed by Zenaton processor
    return this.processor.process(jobs, false);
  }

  checkArguments(jobs) {
    const allWorkflowOrTask = jobs.every(
      (job) => this.isWorkflow(job) || this.isTask(job),
    );

    if (!allWorkflowOrTask) {
      throw new InvalidArgumentError(
        "You can only execute or dispatch Zenaton Task or Workflow",
      );
    }
  }

  isWorkflow(job) {
    return (
      typeof job === "object" &&
      typeof job.name === "string" &&
      workflowManager.getClass(job.name) != null
    );
  }

  isTask(job) {
    return (
      typeof job === "object" &&
      typeof job.name === "string" &&
      taskManager.getClass(job.name) != null
    );
  }
};
