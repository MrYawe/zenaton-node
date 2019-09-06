/* eslint prefer-object-spread: 0 */

const uuidv4 = require("uuid/v4");
const graphQL = require("./Services/GraphQL");
const serializer = require("./Services/Serializer");
const { version } = require("../infos");
const { init, credentials } = require("../client");

const ZENATON_API_URL = "https://api.zenaton.com/v1";
const ZENATON_WORKER_URL = "http://localhost";
const DEFAULT_WORKER_PORT = 4001;
const WORKER_API_VERSION = "v_newton";

const ZENATON_GATEWAY_URL = "https://gateway.zenaton.com/api";

const APP_ENV = "app_env";
const APP_ID = "app_id";

const ATTR_INTENT_ID = "intent_id";
const ATTR_ID = "custom_id";
const ATTR_NAME = "name";
const ATTR_CANONICAL = "canonical_name";
const ATTR_DATA = "data";
const ATTR_PROG = "programming_language";
const ATTR_INITIAL_LIB_VERSION = "initial_library_version";
const ATTR_CODE_PATH_VERSION = "code_path_version";
const ATTR_MAX_PROCESSING_TIME = "maxProcessingTime";

const PROG = "Javascript";
const INITIAL_LIB_VERSION = version;
const CODE_PATH_VERSION = "async";

let instance;

module.exports = class Client {
  constructor(worker = false) {
    if (instance) {
      if (
        !worker &&
        (!credentials.appId || !credentials.apiToken || !credentials.appEnv)
      ) {
        console.log(
          "Please initialize your Zenaton client with your credentials",
        );
        // throw new ExternalZenatonError('Please initialize your Zenaton client with your credentials')
      }
      return instance;
    }
    instance = this;
  }

  static init(appId, apiToken, appEnv) {
    /* This was moved in a singleton module because whatever client is used to
     * init the credentials, they need to be shared between all code paths
     * clients */
    init(appId, apiToken, appEnv);
  }

  /**
   * Returns the worker url
   * This is for legacy purposes
   * @param {String} ressources REST Resources
   * @param {String} params Query string
   * @returns {String} Url
   */
  getWorkerUrl(ressources = "", params = "") {
    const paramsAsObject = params.split("&").reduce((acc, param) => {
      const [key, value] = param.split("=");
      acc[key] = value;
      return acc;
    }, {});

    const fullParams = Object.assign(paramsAsObject, this.getAppEnv());

    const queryString = Object.keys(fullParams)
      .map(
        (key) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(fullParams[key])}`,
      )
      .join("&");

    const url = this.getWorkerUrlNew(ressources);
    return `${url}?${queryString}`;
  }

  getWorkerUrlNew(ressources = "") {
    const host = process.env.ZENATON_WORKER_URL
      ? process.env.ZENATON_WORKER_URL
      : ZENATON_WORKER_URL;
    const port = process.env.ZENATON_WORKER_PORT
      ? process.env.ZENATON_WORKER_PORT
      : DEFAULT_WORKER_PORT;
    const path = `/api/${WORKER_API_VERSION}/${ressources}`;

    return `${host}:${port}${path}`;
  }

  getWebsiteUrl(ressources = "") {
    const host = process.env.ZENATON_API_URL
      ? process.env.ZENATON_API_URL
      : ZENATON_API_URL;
    const path = `/${ressources}`;

    return `${host}${path}`;
  }

  getGatewayUrl() {
    const host = process.env.ZENATON_GATEWAY_URL
      ? process.env.ZENATON_GATEWAY_URL
      : ZENATON_GATEWAY_URL;

    return host;
  }

  /**
   * Start a task instance
   */
  async startTask(task) {
    if (this.mustBeScheduled(task)) {
      return this.startScheduledTask(task);
    }

    return this.startInstantTask(task);
  }

  async startInstantTask(task) {
    const endpoint = this.getGatewayUrl();
    const body = this.getBodyForTask(task);
    const mutation = graphQL.mutations.dispatchTask;

    const variables = {
      dispatchTaskInput: {
        intentId: body[ATTR_INTENT_ID],
        environmentName: credentials.appEnv,
        name: body[ATTR_NAME],
        programmingLanguage: body[ATTR_PROG].toUpperCase(),
        maxProcessingTime: body[ATTR_MAX_PROCESSING_TIME],
        data: body[ATTR_DATA],
        codePathVersion: body[ATTR_CODE_PATH_VERSION],
        initialLibraryVersion: body[ATTR_INITIAL_LIB_VERSION],
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    return res.dispatchTask;
  }

  async startScheduledTask(task) {
    const endpoint = this.getGatewayUrl();
    const taskBody = this.getBodyForTask(task);
    const mutation = graphQL.mutations.createTaskSchedule;
    const variables = {
      createTaskScheduleInput: {
        intentId: taskBody[ATTR_INTENT_ID],
        environmentName: credentials.appEnv,
        cron: task.scheduling.cron,
        taskName: taskBody[ATTR_NAME],
        programmingLanguage: taskBody[ATTR_PROG].toUpperCase(),
        properties: taskBody[ATTR_DATA],
        codePathVersion: taskBody[ATTR_CODE_PATH_VERSION],
        initialLibraryVersion: taskBody[ATTR_INITIAL_LIB_VERSION],
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    return res.createTaskSchedule;
  }

  /**
   * Start a workflow instance
   */
  async startWorkflow(flow) {
    if (this.mustBeScheduled(flow)) {
      return this.startScheduledWorkflow(flow);
    }

    return this.startInstantWorkflow(flow);
  }

  async startInstantWorkflow(flow) {
    const endpoint = this.getGatewayUrl();
    const body = this.getBodyForWorkflow(flow);
    const mutation = graphQL.mutations.dispatchWorkflow;
    const variables = {
      dispatchWorkflowInput: {
        intentId: body[ATTR_INTENT_ID],
        environmentName: credentials.appEnv,
        name: body[ATTR_NAME],
        customId: body[ATTR_ID],
        canonicalName: body[ATTR_CANONICAL] || body[ATTR_NAME],
        programmingLanguage: body[ATTR_PROG].toUpperCase(),
        data: body[ATTR_DATA],
        codePathVersion: body[ATTR_CODE_PATH_VERSION],
        initialLibraryVersion: body[ATTR_INITIAL_LIB_VERSION],
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    console.log("DISPATCH", res.dispatchWorkflow);
    return res.dispatchWorkflow;
  }

  async startScheduledWorkflow(flow) {
    const endpoint = this.getGatewayUrl();
    const workflowBody = this.getBodyForWorkflow(flow);
    const mutation = graphQL.mutations.createWorkflowSchedule;
    const variables = {
      createWorkflowScheduleInput: {
        intentId: workflowBody[ATTR_INTENT_ID],
        environmentName: credentials.appEnv,
        cron: flow.scheduling.cron,
        workflowName: workflowBody[ATTR_NAME],
        canonicalName: workflowBody[ATTR_CANONICAL] || workflowBody[ATTR_NAME],
        programmingLanguage: workflowBody[ATTR_PROG].toUpperCase(),
        properties: workflowBody[ATTR_DATA],
        codePathVersion: workflowBody[ATTR_CODE_PATH_VERSION],
        initialLibraryVersion: workflowBody[ATTR_INITIAL_LIB_VERSION],
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    return res.createWorkflowSchedule;
  }

  /**
   * Kill a workflow instance
   */
  async killWorkflow(workflowName, customId) {
    const endpoint = this.getGatewayUrl();
    const body = this.getBodyForUpdateWorkflow(workflowName);
    const mutation = graphQL.mutations.killWorkflow;
    const variables = {
      killWorkflowInput: {
        customId,
        environmentName: credentials.appEnv,
        intentId: body[ATTR_INTENT_ID],
        name: body[ATTR_NAME],
        programmingLanguage: body[ATTR_PROG].toUpperCase(),
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    return res.killWorkflow;
  }

  /**
   * Pause a workflow instance
   */
  async pauseWorkflow(workflowName, customId) {
    const endpoint = this.getGatewayUrl();
    const body = this.getBodyForUpdateWorkflow(workflowName);
    const mutation = graphQL.mutations.pauseWorkflow;
    const variables = {
      pauseWorkflowInput: {
        customId,
        environmentName: credentials.appEnv,
        intentId: body[ATTR_INTENT_ID],
        name: body[ATTR_NAME],
        programmingLanguage: body[ATTR_PROG].toUpperCase(),
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    return res.pauseWorkflow;
  }

  /**
   * Resume a workflow instance
   */
  async resumeWorkflow(workflowName, customId) {
    const endpoint = this.getGatewayUrl();
    const body = this.getBodyForUpdateWorkflow(workflowName);
    const mutation = graphQL.mutations.resumeWorkflow;
    const variables = {
      resumeWorkflowInput: {
        customId,
        environmentName: credentials.appEnv,
        intentId: body[ATTR_INTENT_ID],
        name: body[ATTR_NAME],
        programmingLanguage: body[ATTR_PROG].toUpperCase(),
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    return res.resumeWorkflow;
  }

  /**
   * Find a workflow instance
   */
  async findWorkflow(workflowName, customId) {
    const endpoint = this.getGatewayUrl();
    const query = graphQL.queries.findWorkflow;
    const variables = {
      customId,
      environmentName: credentials.appEnv,
      workflowName,
      programmingLanguage: PROG.toUpperCase(),
    };

    try {
      const res = await graphQL.request(endpoint, query, variables);
      return serializer.decode(res.findWorkflow.properties);
    } catch (e) {
      if (e.response && e.response.errors) {
        // eslint-disable-next-line no-restricted-syntax
        for (const el of e.response.errors) {
          if (el.type === "NOT_FOUND") return null;
        }
      }

      throw e;
    }
  }

  /**
   * Send an event to a workflow instance
   */
  async sendEvent(workflowName, customId, eventName, eventData) {
    const endpoint = this.getGatewayUrl();

    const mutation = graphQL.mutations.sendEventToWorkflowByNameAndCustomId;
    const variables = {
      sendEventToWorkflowByNameAndCustomIdInput: {
        codePathVersion: CODE_PATH_VERSION,
        customId,
        data: serializer.encode({
          name: eventName,
          data: eventData,
        }),
        environmentName: credentials.appEnv,
        initialLibraryVersion: INITIAL_LIB_VERSION,
        input: serializer.encode(eventData),
        intentId: uuidv4(),
        name: eventName,
        programmingLanguage: PROG.toUpperCase(),
        workflowName,
      },
    };
    const res = await graphQL.request(endpoint, mutation, variables);
    console.log("SEND EVENT", res.sendEventToWorkflowByNameAndCustomId);
    return res.sendEventToWorkflowByNameAndCustomId;
  }

  /**
   * * Send an event to a workflow by instance_id
   */
  async sendEventByInstanceId(id, eventName, eventData) {
    const endpoint = this.getGatewayUrl();

    const mutation = graphQL.mutations.sendEventToWorkflowById;
    const variables = {
      sendEventToWorkflowByIdInput: {
        id,
        eventName,
        eventInput: serializer.encode(eventData),
        eventData: serializer.encode({
          name: eventName,
          data: eventData,
        }),
      },
    };

    const res = await graphQL.request(endpoint, mutation, variables);
    return res.sendEventToWorkflowById;
  }

  getBodyForUpdateWorkflow(workflowName) {
    return {
      [ATTR_INTENT_ID]: uuidv4(),
      [ATTR_PROG]: PROG,
      [ATTR_INITIAL_LIB_VERSION]: INITIAL_LIB_VERSION,
      [ATTR_CODE_PATH_VERSION]: CODE_PATH_VERSION,
      [ATTR_NAME]: workflowName,
    };
  }

  mustBeScheduled(job) {
    return job.scheduling && job.scheduling.cron;
  }

  getBodyForTask(task) {
    return {
      [ATTR_INTENT_ID]: uuidv4(),
      [ATTR_PROG]: PROG,
      [ATTR_INITIAL_LIB_VERSION]: INITIAL_LIB_VERSION,
      [ATTR_CODE_PATH_VERSION]: CODE_PATH_VERSION,
      [ATTR_NAME]: task.name,
      [ATTR_DATA]: serializer.encode(task.data),
      [ATTR_MAX_PROCESSING_TIME]:
        typeof task.maxProcessingTime === "function"
          ? task.maxProcessingTime()
          : null,
    };
  }

  getBodyForWorkflow(flow) {
    return {
      [ATTR_INTENT_ID]: uuidv4(),
      [ATTR_PROG]: PROG,
      [ATTR_INITIAL_LIB_VERSION]: INITIAL_LIB_VERSION,
      [ATTR_CODE_PATH_VERSION]: CODE_PATH_VERSION,
      [ATTR_CANONICAL]: flow._getCanonical(),
      [ATTR_NAME]: flow.name,
      [ATTR_DATA]: serializer.encode(flow.data),
      [ATTR_ID]: flow._getCustomId(),
    };
  }

  getAppEnv() {
    // when called from worker, APP_ENV and APP_ID is not defined
    const params = {};

    if (credentials.appEnv) {
      params[APP_ENV] = credentials.appEnv;
    }

    if (credentials.appId) {
      params[APP_ID] = credentials.appId;
    }

    return params;
  }
};
