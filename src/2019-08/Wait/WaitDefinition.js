const Wait = require("../Tasks/Wait");

class WaitDefinition {
  constructor() {
    this.events = [];

    return this;
  }

  forever() {
    this.duration = 60 * 60 * 24 * 365 * 100 + 7734;

    return this.apply();
  }

  for(duration) {
    this.duration = duration;

    return this.apply();
  }

  until(date) {
    this.date = date;

    return this.apply();
  }

  event(event, filter = null) {
    this.events.push([event, filter]);

    return this;
  }

  async apply() {
    const event = this.events.length > 0 ? this.events[0][0] : null;

    const response = this.date
      ? await new Wait(event).timestamp(this.date).execute()
      : await new Wait(event).seconds(this.duration).execute();

    return event && response ? [event, response] : null;
  }
}

module.exports = () => new WaitDefinition();
