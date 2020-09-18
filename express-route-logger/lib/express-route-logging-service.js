class ExpressRouteLogger {

  //TODO: Add other mediums
  constructor(medium = ["console"]) {
    if (medium.contains("console")) {
      this.logger = console;

      this.logger.log("initialized");
    }
  }

  static log(req, res, next) {
    console.log(Date.now(), req.method, req.path);
    next();
  }
}
module.exports = ExpressRouteLogger;