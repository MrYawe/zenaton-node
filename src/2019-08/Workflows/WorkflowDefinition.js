class WorkflowDefinition {
  constructor(name) {
    this.name = name;

    return this;
  }

  with(...args) {
    this.arguments = args;

    return this;
  }

  tag(...tags) {
    this.tags = tags;

    return this;
  }

  getName() {
    return this.name;
  }

  getArguments() {
    return this.arguments;
  }

  getTags() {
    return this.tags;
  }
}

module.exports = (name) => new WorkflowDefinition(name);
