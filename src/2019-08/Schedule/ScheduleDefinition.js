// const axios = require("axios");
const TaskDefinition = require("../Tasks/TaskDefinition");
const WorkflowDefinition = require("../Workflows/WorkflowDefinition");
const { Wait } = require("../Wait");

let defaultOptions = {};

class ScheduleDefinition {
  constructor(job) {
    this.job = job;
    this.data = null;
    this.options = defaultOptions;

    return this;
  }

  in(duration) {
    this.duration = duration;

    return this;
  }

  at(timestamp) {
    this.timestamp = timestamp;

    return this;
  }

  repeat(cron) {
    this.cron = cron;

    return this;
  }

  tag(...tags) {
    this.tags = tags;

    return this;
  }

  async task(Task, ...taskData) {
    if (typeof Task === "string") {
      this.job = TaskDefinition(Task);
      this.type = "task";
      this.data = taskData;

      return this.apply();
    }

    if (this.duration) {
      await Wait.for(this.duration);
    }

    if (this.timestamp) {
      await Wait.until(this.timestamp);
    }

    return new Task(...taskData).dispatch();
  }

  async workflow(Workflow, ...workflowData) {
    if (typeof Task === "string") {
      this.job = WorkflowDefinition(Workflow);
      this.type = "workflow";
      this.data = workflowData;

      return this.apply();
    }

    return new Workflow(...workflowData).dispatch();
  }

  setOptions(options) {
    this.options = Object.assign({}, this.options, options);

    return this;
  }

  async apply() {
    // todo: implement
    // return (await axios.get("https://scheduler.zenaton.com")).data;
  }

  getJob() {
    return this.job;
  }

  getDuration() {
    return this.duration;
  }

  getTime() {
    return this.time;
  }

  getCron() {
    return this.cron;
  }

  getTags() {
    return this.tags;
  }

  getOptions() {
    return this.options;
  }

  static setDefaultOptions(options) {
    defaultOptions = options;
  }
}

module.exports = (name) => new ScheduleDefinition(name);
module.exports.setDefaultOptions = (name) =>
  ScheduleDefinition.setDefaultOptions(name);
