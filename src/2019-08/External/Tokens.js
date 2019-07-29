/*
const axios = require('axios')
const { Task } = require('zenaton')

module.exports = Task('SlackTokensAction', {
  init () {},

  async handle () {
    const contentType = 'application/json;charset=utf-8'

    const response = await axios.get(
      'https://store.zenaton.dev/oauth?' +
        'where[service]=slack&where[client]=the-family',
      {
        headers: {
          'Content-Type': contentType
        }
      }
    )

    if (Array.isArray(response.data)) {
      // return response.data.map(el => el.token)
      const tokens = {}
      for (let o of response.data) {
        tokens[o.email] = o.token
      }
      return tokens
    } else {
      return null
    }
  }
})

*/
const axios = require("axios");
const Task = require("../Tasks/Task");

module.exports = Task("SlackTokenAction", {
  init(email) {
    this.email = email;
  },

  async handle() {
    const contentType = "application/json;charset=utf-8";

    const response = await axios.get(
      `https://store.zenaton.dev/oauth?where[email]=${
        this.email
      }&where[service]=slack&where[client]=the-family`,
      {
        headers: {
          "Content-Type": contentType,
        },
      },
    );

    if (Array.isArray(response.data) && response.data[0].token) {
      return response.data[0].token;
    }
    return null;
  },
});
