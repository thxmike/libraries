const list_endpoints = require("express-list-endpoints");
const health = require("express-ping");
const express = require("express");
const swaggerUi = require("swagger-ui-express");

class RootController {
  constructor(app = express(), documentation_content = null) {
    this._app = app;
    this._health = health;

    this.setup_health_route();
    this.setup_list_endpoint_route();
    if (documentation_content) {
      this.setup_documentation_endpoint(documentation_content);
    }
  }

  setup_health_route() {
    this._app.use("/", this._health.ping("/health"));
  }

  setup_list_endpoint_route() {
    this._app.use("/list", (req, res) => {
      res.status(200).json(list_endpoints(this._app));
    });
  }

  setup_documentation_endpoint(documentation_content) {

    this._app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(documentation_content));
  }
}

module.exports = RootController;