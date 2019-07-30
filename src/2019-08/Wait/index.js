const Wait = require("./WaitDefinition");

module.exports = Wait;

module.exports.Wait = {
  forever: () => Wait().forever(),
  for: (duration) => Wait().for(duration),
  until: (date) => Wait().until(date),
  event: (event) => Wait().event(event),
};
