const GetTask = require("../External/Get");
const PostTask = require("../External/Post");
const AgentTask = require("../External/Agent");

module.exports.Execute = {
  task: (TaskOrServiceIntegration, data) => {
    if (typeof Task === "string") {
      if (TaskOrServiceIntegration.includes(":")) {
        AgentTask(TaskOrServiceIntegration, data);
      }
      // do something
      return null;
    }
    return new TaskOrServiceIntegration(data).execute();
  },
  post: (action, params, headers) =>
    new PostTask(action, params, headers).execute(),
  get: (action, params, headers) =>
    new GetTask(action, params, headers).execute(),
};
