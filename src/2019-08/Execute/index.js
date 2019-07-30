const GetTask = require("../External/Get");
const PostTask = require("../External/Post");
const AgentTask = require("../External/Agent");

module.exports.Execute = {
  job: (Job, data) => {
    if (typeof Job === "string") {
      // do something
      return null;
    }
    return new Job(data).execute();
  },
  post: (action, params, headers) =>
    new PostTask(action, params, headers).execute(),
  get: (action, params, headers) =>
    new GetTask(action, params, headers).execute(),
  task: (endpoint, params) => AgentTask(endpoint, params),
};
