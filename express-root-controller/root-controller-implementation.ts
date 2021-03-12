import express from 'express';
import list_endpoints from 'express-list-endpoints';
import health from 'express-ping';
import swaggerUi from 'swagger-ui-express';

export class RootController {

  private _app: any;
  private _health: any;

  constructor(app = express(), documentation_content = null) {
    this._app = app;
    this._health = health;

    this.setup_health_route();
    this.setup_list_endpoint_route();
    if (documentation_content) {
      this.setup_documentation_endpoint(documentation_content);
    }
  }

  private setup_health_route() {
    this._app.use("/", this._health.ping("/health"));
  }

  private setup_list_endpoint_route() {
    this._app.use("/list", (req: any, res: any) => {
      res.status(200).json(list_endpoints(this._app));
    });
  }

  // Based on https://github.com/scottie1984/swagger-ui-express
  // uses a swagger-jsdoc: Allows you to markup routes with jsdoc comments. 
  // It then produces a full swagger yml config dynamically, which you can pass to this module to produce documentation.
  // See below under the usage section for more info.
  private setup_documentation_endpoint(documentation_content: any) {

    this._app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(documentation_content));
  }
}