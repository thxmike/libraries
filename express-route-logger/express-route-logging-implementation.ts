import { IExpressRouteLogger } from './iexpress-route-logging-service';

export class ExpressRouteLogger implements IExpressRouteLogger {

  private _logger: any;

  //TODO: Add other mediums
  constructor(medium: Array<string> = ["console"]) {

    if (medium.find(element => element === "console")) {
      this._logger = console;

      this._logger.log("Logger Initialized");
    }
  }

  static log(req: any, res: any, next: any) {
    console.log(Date.now(), req.method, req.path);
    next();
  }
}