const GetTask = require("./Get");
const PostTask = require("./Post");
const AgentTask = require("./Agent");
// const TokensTask = require("./Tokens");

module.exports.post = (action, params, headers) =>
  new PostTask(action, params, headers).execute();
module.exports.get = (action, params, headers) =>
  new GetTask(action, params, headers).execute();
// module.exports.tokens = (action, params) => new TokensTask(action, params);
module.exports.task = (endpoint, params) => AgentTask(endpoint, params);
// module.exports.getTokens = params => new SlackGetTokensAction(params)
// module.exports.getToken = email => new SlackGetTokenAction(email)
