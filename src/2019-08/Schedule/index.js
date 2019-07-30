const Schedule = require("./ScheduleDefinition");

module.exports = Schedule;

module.exports.Schedule = {
  task: (taskName) => Schedule().task(taskName),
  workflow: (workflowName) => Schedule().workflow(workflowName),
  in: (duration) => Schedule().in(duration),
  at: (time) => Schedule().at(time),
  repeat: (cron) => Schedule().repeat(cron),
  tag: (tag) => Schedule().tag(tag),
  options: (options) => Schedule().setOptions(options),
  setDefaultOptions: (defaultOptions) =>
    Schedule.setDefaultOptions(defaultOptions),
};
