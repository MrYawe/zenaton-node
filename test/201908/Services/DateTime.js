/* eslint-disable prettier/prettier */
const { expect } = require("chai");
const DateTime = require("../../../src/201908/Services/DateTime");

const baseDate = "2019-08-09T16:26:44.929Z";

describe("DateTime Definition methods", () => {
  it("set timestamp", () => {
    const time = DateTime.timestamp(1234567)._get();

    expect(time).to.be.equals(1234567);
  });

  it("set time", () => {
    const time = DateTime.at("12:00")._get(baseDate);
    expect(time).to.be.deep.equals(1565431200);
  });

  it("set dayOfMonth", () => {
    const time = DateTime.dayOfMonth(11)._get(baseDate);
    expect(time).to.be.deep.equals(1565540804);
  });

  it("set monday", () => {
    const time = DateTime.monday()._get(baseDate);
    expect(time).to.be.deep.equals(1565627204);
  });

  it("set tuesday", () => {
    const time = DateTime.tuesday()._get(baseDate);
    expect(time).to.be.deep.equals(1565713604);
  });

  it("set thursday", () => {
    const time = DateTime.wednesday()._get(baseDate);
    expect(time).to.be.deep.equals(1565800004);
  });

  it("set thursday", () => {
    const time = DateTime.thursday()._get(baseDate);
    expect(time).to.be.deep.equals(1565886404);
  });

  it("set friday", () => {
    const time = DateTime.friday()._get(baseDate);
    expect(time).to.be.deep.equals(1565368004);
  });

  it("set saturday", () => {
    const time = DateTime.saturday()._get(baseDate);
    expect(time).to.be.deep.equals(1565454404);
  });

  it("set sunday", () => {
    const time = DateTime.sunday()._get(baseDate);
    expect(time).to.be.deep.equals(1565540804);
  });

  it("set monday with count", () => {
    const time = DateTime.monday(3)._get(baseDate);
    expect(time).to.be.deep.equals(1566836804);
  });

  it("set a duration in seconds", () => {
    const time = DateTime.seconds(3)._get(baseDate);
    expect(time).to.be.deep.equals(1565368007);
  });

  it("set a complex duration", () => {
    const time = DateTime.seconds(3)
      .minutes(3)
      .hours(3)
      .days(3)
      .weeks(3)
      .months(3)
      .years(3)
      ._get(baseDate);
    expect(time).to.be.deep.equals(1670012987);
  });
});

describe("Duration Definition compute", () => {
  it("compute day of month at time", () => {
    // 1567951200 = Sunday 8 September 2019 14:00:00
    const time = DateTime.dayOfMonth(8)
      .at("16:00")
      ._get(baseDate);
    expect(time).to.be.equals(1567951200);
  });

  it("compute day of week", () => {
    // 1565627204 = Monday 12 August 2019 16:26:44
    const time = DateTime.monday()._get(baseDate);
    expect(time).to.be.equals(1565627204);
  });

  it("compute day of week at time", () => {
    // 1565589600 = Monday 12 August 2019 06:00:00
    const time = DateTime.monday()
      .at("08:00")
      ._get(baseDate);
    expect(time).to.be.equals(1565589600);
  });
});
