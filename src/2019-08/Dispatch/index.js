const GetTask = require("../External/Get");
const PostTask = require("../External/Post");
const AgentTask = require("../External/Agent");

module.exports.Dispatch = {
  task: (TaskOrServiceIntegration, data) => {
    if (typeof Task === "string") {
      if (TaskOrServiceIntegration.includes(":")) {
        AgentTask(TaskOrServiceIntegration, data);
      }
      // do something
      return null;
    }
    return new TaskOrServiceIntegration(data).dispatch();
  },
  workflow: (Workflow, data) => {
    if (typeof Workflow === "string") {
      // do something
      return null;
    }
    return new Workflow(data).dispatch();
  },
  post: (action, params, headers) =>
    new PostTask(action, params, headers).dispatch(),
  get: (action, params, headers) =>
    new GetTask(action, params, headers).dispatch(),
};
