const proxyquire = require("proxyquire");
const { expect } = require("chai");
const sinon = require("sinon");

const globalClient = require("../../src/client");
const { http, serializer, graphQL } = require("../../src/async/Services");
const { workflowManager } = require("../../src/async/Workflows");

proxyquire.noPreserveCache();

const FAKE_APP_ID = "JZMHGKYEBX";
const FAKE_API_TOKEN =
  "N1HGV83asfRuH8RXAvFXr3CrDBzljPSuqdllCTxVkOkU014g1bIH7OOCfn7O";
const FAKE_APP_ENV = "prod";

const FAKE_ENCODED_DATA = "[ENCODED DATA]";
const FAKE_APP_VERSION = "0.0.0";

describe("Client", () => {
  const initSpy = sinon.spy(globalClient, "init");

  let Client;

  beforeEach(() => {
    Client = proxyquire("../../src/async/Client", {
      "uuid/v4": () => "statically-generated-intent-id",
      "../infos": { version: FAKE_APP_VERSION },
    });

    sinon.stub(http, "post").resolves();
    sinon.stub(http, "put").resolves();

    sinon.stub(serializer, "encode").returns(FAKE_ENCODED_DATA);
  });

  it("should expose a static 'init' method", () => {
    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);

    // Assert
    expect(initSpy).to.have.been.calledWithExactly(
      FAKE_APP_ID,
      FAKE_API_TOKEN,
      FAKE_APP_ENV,
    );

    expect(globalClient.credentials.appId).to.equal(FAKE_APP_ID);
    expect(globalClient.credentials.apiToken).to.equal(FAKE_API_TOKEN);
    expect(globalClient.credentials.appEnv).to.equal(FAKE_APP_ENV);
  });

  it("should call the agent to start a workflow", async () => {
    // Arranges
    sinon.stub(graphQL, "request").resolves({});

    const workflow = {
      id: () => "FAKE CUSTOM ID",
      name: "WorkflowVersionName",
      data: "WHATEVER",
      _getCanonical: () => "CanonicalWorkflowName",
      _getCustomId: () => "FAKE CUSTOM ID",
    };

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.startWorkflow(workflow);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(serializer.encode).to.have.been.calledWithExactly("WHATEVER");

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.dispatchWorkflow,
      {
        dispatchWorkflowInput: {
          intentId: "statically-generated-intent-id",
          environmentName: "prod",
          name: "WorkflowVersionName",
          customId: "FAKE CUSTOM ID",
          canonicalName: "CanonicalWorkflowName",
          programmingLanguage: "JAVASCRIPT",
          data: FAKE_ENCODED_DATA,
          codePathVersion: "async",
          initialLibraryVersion: FAKE_APP_VERSION,
        },
      },
    );
  });

  it("should call the agent to schedule a workflow", async () => {
    sinon.stub(graphQL, "request").resolves({});

    // Arrange
    const workflow = {
      id: () => "FAKE CUSTOM ID",
      name: "WorkflowVersionName",
      data: "WHATEVER",
      scheduling: {
        cron: "* * * * *",
      },
      _getCanonical: () => "CanonicalWorkflowName",
      _getCustomId: () => "FAKE CUSTOM ID",
    };

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.startWorkflow(workflow);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(serializer.encode).to.have.been.calledWithExactly("WHATEVER");

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.createWorkflowSchedule,
      {
        createWorkflowScheduleInput: {
          codePathVersion: "async",
          cron: "* * * * *",
          environmentName: "prod",
          initialLibraryVersion: FAKE_APP_VERSION,
          intentId: "statically-generated-intent-id",
          programmingLanguage: "JAVASCRIPT",
          properties: FAKE_ENCODED_DATA,
          workflowName: "WorkflowVersionName",
          canonicalName: "CanonicalWorkflowName",
        },
      },
    );
  });

  it("should call the agent to start a task", async () => {
    sinon.stub(graphQL, "request").resolves({});
    // Arrange
    const task = {
      name: "TaskName",
      data: "WHATEVER",
      maxProcessingTime: () => 1000,
    };

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.startTask(task);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(serializer.encode).to.have.been.calledWithExactly("WHATEVER");

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.dispatchTask,
      {
        dispatchTaskInput: {
          intentId: "statically-generated-intent-id",
          environmentName: "prod",
          name: "TaskName",
          programmingLanguage: "JAVASCRIPT",
          maxProcessingTime: 1000,
          data: FAKE_ENCODED_DATA,
          codePathVersion: "async",
          initialLibraryVersion: FAKE_APP_VERSION,
        },
      },
    );
  });

  it("should call the agent to schedule a task", async () => {
    sinon.stub(graphQL, "request").resolves({});

    // Arrange
    const task = {
      name: "TaskName",
      data: "WHATEVER",
      scheduling: {
        cron: "* * * * *",
      },
      maxProcessingTime: () => 1000,
    };

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.startTask(task);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(serializer.encode).to.have.been.calledWithExactly("WHATEVER");

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.createTaskSchedule,
      {
        createTaskScheduleInput: {
          codePathVersion: "async",
          cron: "* * * * *",
          environmentName: "prod",
          initialLibraryVersion: FAKE_APP_VERSION,
          intentId: "statically-generated-intent-id",
          programmingLanguage: "JAVASCRIPT",
          properties: FAKE_ENCODED_DATA,
          taskName: "TaskName",
        },
      },
    );
  });

  it("should kill a workflow", async () => {
    sinon.stub(graphQL, "request").resolves({});

    // Arrange
    const workflowName = "CanonicalWorkflowName";
    const customId = "45745c60";

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.killWorkflow(workflowName, customId);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.killWorkflow,
      {
        killWorkflowInput: {
          customId,
          environmentName: "prod",
          intentId: "statically-generated-intent-id",
          name: "CanonicalWorkflowName",
          programmingLanguage: "JAVASCRIPT",
        },
      },
    );
  });

  it("should pause a workflow", async () => {
    sinon.stub(graphQL, "request").resolves({});

    // Arrange
    const workflowName = "CanonicalWorkflowName";
    const customId = "45745c60";

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.pauseWorkflow(workflowName, customId);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.pauseWorkflow,
      {
        pauseWorkflowInput: {
          customId,
          environmentName: "prod",
          intentId: "statically-generated-intent-id",
          name: "CanonicalWorkflowName",
          programmingLanguage: "JAVASCRIPT",
        },
      },
    );
  });

  it("should resume a workflow", async () => {
    sinon.stub(graphQL, "request").resolves({});

    // Arrange
    const workflowName = "CanonicalWorkflowName";
    const customId = "45745c60";

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.resumeWorkflow(workflowName, customId);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.resumeWorkflow,
      {
        resumeWorkflowInput: {
          customId,
          environmentName: "prod",
          intentId: "statically-generated-intent-id",
          name: "CanonicalWorkflowName",
          programmingLanguage: "JAVASCRIPT",
        },
      },
    );
  });

  it("should find a workflow", async () => {
    // Arrange
    const workflowName = "CanonicalWorkflowName";
    const customId = "45745c60";
    const fakeFoundWorkflow = {};
    sinon.stub(workflowManager, "getWorkflow").returns(fakeFoundWorkflow);
    sinon.stub(graphQL, "request").resolves({
      findWorkflow: {
        properties: '{"v":"1.0.0","s":[],"d":null}',
      },
    });

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.findWorkflow(workflowName, customId);

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.queries.findWorkflow,
      {
        customId: "45745c60",
        environmentName: "prod",
        workflowName: "CanonicalWorkflowName",
        programmingLanguage: "JAVASCRIPT",
      },
    );
  });

  it("should send an event to a workflow", async () => {
    sinon.stub(graphQL, "request").resolves({});

    // Arrange
    const workflowName = "CanonicalWorkflowName";
    const customId = "45745c60";
    const eventName = "MyEvent";
    const eventData = "WHATEVER";

    sinon.stub(http, "get").resolves({
      data: {
        properties: "FAKE PROPERTIES",
      },
    });

    const fakeFoundWorkflow = {};
    sinon.stub(workflowManager, "getWorkflow").returns(fakeFoundWorkflow);

    // Act
    Client.init(FAKE_APP_ID, FAKE_API_TOKEN, FAKE_APP_ENV);
    const client = new Client();
    const result = client.sendEvent(
      workflowName,
      customId,
      eventName,
      eventData,
    );

    // Assert
    await expect(result).to.eventually.be.fulfilled();

    expect(serializer.encode)
      .to.have.been.calledTwice()
      .and.to.have.been.calledWithExactly({
        name: "MyEvent",
        data: "WHATEVER",
      })
      .and.to.have.been.calledWithExactly("WHATEVER");

    expect(graphQL.request).to.have.been.calledWithExactly(
      "https://gateway.zenaton.com/api",
      graphQL.mutations.sendEventToWorkflowByNameAndCustomId,
      {
        sendEventToWorkflowByNameAndCustomIdInput: {
          codePathVersion: "async",
          customId,
          data: FAKE_ENCODED_DATA,
          environmentName: "prod",
          initialLibraryVersion: "0.0.0",
          input: FAKE_ENCODED_DATA,
          intentId: "statically-generated-intent-id",
          name: "MyEvent",
          programmingLanguage: "JAVASCRIPT",
          workflowName: "CanonicalWorkflowName",
        },
      },
    );
  });
});
