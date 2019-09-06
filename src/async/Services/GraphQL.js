const { GraphQLClient } = require("graphql-request");
const {
  ExternalZenatonError,
  InternalZenatonError,
  ZenatonError,
} = require("../../Errors");
const { credentials } = require("../../client");

function getError(err) {
  // Validation errors
  if (err.response && err.response.errors && err.response.errors.length > 0) {
    const message = err.response.errors
      .map((graphqlError) => {
        const path = graphqlError.path ? `(${graphqlError.path}) ` : "";
        const errorMessage = graphqlError.message || "Unknown error";
        return `${path}${errorMessage}`;
      })
      .join("\n");

    return ["ExternalZenatonError", message];
  }

  // Internal Server Error
  if (err.response && err.response.status >= 500) {
    return [
      "InternalZenatonError",
      `Please contact Zenaton support - ${err.message}`,
    ];
  }

  return ["ZenatonError", err.message];
}

async function request(endpoint, query, variables) {
  try {
    const graphQLClient = new GraphQLClient(endpoint, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "app-id": credentials.appId,
        "api-token": credentials.apiToken,
      },
    });
    const res = await graphQLClient.request(query, variables);
    return res;
  } catch (err) {
    const [exception, message] = getError(err);

    switch (exception) {
      case "ExternalZenatonError":
        throw new ExternalZenatonError(message);
      case "InternalZenatonError":
        throw new InternalZenatonError(message);
      default:
        throw new ZenatonError(message);
    }
  }
}

const mutations = {
  dispatchTask: `
    mutation ($dispatchTaskInput: DispatchTaskInput!) {
      dispatchTask(input: $dispatchTaskInput) {
        task {
          intentId
        }
      }
  }`,
  dispatchWorkflow: `
    mutation ($dispatchWorkflowInput: DispatchWorkflowInput!) {
      dispatchWorkflow(input: $dispatchWorkflowInput) {
        workflow {
          id
          canonicalName
          name
          programmingLanguage
          properties
        }
      }
  }`,
  killWorkflow: `
    mutation ($killWorkflowInput: KillWorkflowInput!) {
      killWorkflow(input: $killWorkflowInput) {
        id
      }
  }`,
  pauseWorkflow: `
    mutation ($pauseWorkflowInput: PauseWorkflowInput!) {
      pauseWorkflow(input: $pauseWorkflowInput) {
        id
      }
  }`,
  resumeWorkflow: `
    mutation ($resumeWorkflowInput: ResumeWorkflowInput!) {
      resumeWorkflow(input: $resumeWorkflowInput) {
        id
      }
  }`,
  sendEventToWorkflowByNameAndCustomId: `
    mutation ($sendEventToWorkflowByNameAndCustomIdInput: SendEventToWorkflowByNameAndCustomIdInput!) {
      sendEventToWorkflowByNameAndCustomId(input: $sendEventToWorkflowByNameAndCustomIdInput) {
        event {
          intentId
        }
      }
  }`,
  sendEventToWorkflowById: `
    mutation ($sendEventToWorkflowByIdInput: SendEventToWorkflowByIdInput!) {
      sendEventToWorkflowById(input: $sendEventToWorkflowByIdInput) {
        event {
          intentId
        }
      }
  }`,
  createWorkflowSchedule: `
    mutation ($createWorkflowScheduleInput: CreateWorkflowScheduleInput!) {
      createWorkflowSchedule(input: $createWorkflowScheduleInput) {
        schedule {
          id
          name
          cron
          insertedAt
          updatedAt
          target {
            ... on WorkflowTarget {
              name
              type
              canonicalName
              programmingLanguage
              properties
              codePathVersion
              initialLibraryVersion
            }
          }
        }
      }
    }`,
  createTaskSchedule: `
    mutation ($createTaskScheduleInput: CreateTaskScheduleInput!) {
      createTaskSchedule(input: $createTaskScheduleInput) {
        schedule {
          id
          name
          cron
          insertedAt
          updatedAt
          target {
            ... on TaskTarget {
              name
              type
              programmingLanguage
              properties
              codePathVersion
              initialLibraryVersion
            }
          }
        }
      }
    }`,
};

const queries = {
  findWorkflow: `
    query findWorkflow($workflowName: String, $customId: ID, $environmentName: String, $programmingLanguage: String) {
      findWorkflow(environmentName: $environmentName, programmingLanguage: $programmingLanguage, customId: $customId, name: $workflowName) {
        name
        properties
      }
    }`,
};

module.exports.request = request;
module.exports.mutations = mutations;
module.exports.queries = queries;
