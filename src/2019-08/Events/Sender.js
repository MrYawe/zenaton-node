const { Task } = require("../Tasks");
const Client = require("../Client");

const SendEventTask = Task("zenaton:sendEventTask", {
  init(id, name, data) {
    this.id = id;
    this.name = name;
    this.data = data;
  },

  async handle() {
    await new Client().sendEventByInstanceId(this.id, this.name, this.data);
  },
});

class Sender {
  constructor(id, name, data) {
    this.id = id;
    this.name = name;
    this.data = data;

    return this;
  }

  async send() {
    await new SendEventTask(this.id, this.name, this.data).execute();
  }
}

module.exports = (id, name, data) => new Sender(id, name, data).send();
