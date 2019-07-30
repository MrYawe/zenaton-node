module.exports.Execute = {
  task: (Task, data) => {
    if (typeof Task === "string") {
      // do something
      return null;
    }
    return new Task(data).execute();
  },
  workflow: (Workflow, data) => {
    if (typeof Workflow === "string") {
      // do something
      return null;
    }
    return new Workflow(data).dispatch();
  },
};
