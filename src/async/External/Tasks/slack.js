const Task = require("../../Tasks/Task");

module.exports = Task("Zenaton#SlackTask", {
  init(action, params) {
    this.action = action;
    this.params = params;
    this.token = process.env.SLACK_TOKEN;
  },
  handle() {},
});
