module.exports = async (endpoint, params) => {
  const service = endpoint.split(":");

  // eslint-disable-next-line
  const ZenatonDynTask = require(`./Tasks/${service[0]}`);

  const response = await new ZenatonDynTask(service[1], params).execute();
  return response;
};
