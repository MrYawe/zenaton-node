module.exports = {
  listeners: "http://listeners.zenaton.tech",
  alfred: {
    endpoint: process.env.ALFRED_ENDPOINT || "https://gateway.barbouze.fr/api",
    token: process.env.ALFRED_BEARER_TOKEN || "SECRET_INFORMATION",
  },
};
