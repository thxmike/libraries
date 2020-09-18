const SafeService = require("ulti-safe-client");

class ConfigurationService {

  //Initialize with a default configuration
  constructor(configuration) {
    if (configuration) {
      this._configuration = configuration;
    }
    this.environment_variables = process.env;
  }

  check_safe() {

    let my_promise = null;

    let good_state = { "state": true,
      "message": "Safe Overrides Applied" };

    if (this.environment_variables.SAFE_URI &&
        this.environment_variables.SAFE_APPID &&
        this.environment_variables.SAFE_USERID &&
        this.environment_variables.SAFE_PATH) {
      my_promise = new Promise((resolve) => {
        this.safe_service = new SafeService(
          this.environment_variables.SAFE_URI,
          "v1",
          this.environment_variables.SAFE_APPID,
          this.environment_variables.SAFE_USERID
        );
        resolve(good_state);
      });
    } else if (
      this.environment_variables["_safe.uri"] &&
        this.environment_variables["_safe.appid"] &&
        this.environment_variables["_safe.userid"] &&
        this.environment_variables["_safe.path"]) {
      my_promise = new Promise((resolve) => {
        this.safe_service = new SafeService(
          this.environment_variables["_safe.uri"],
          "v1",
          this.environment_variables["_safe.appid"],
          this.environment_variables["_safe.userid"]
        );
        resolve(good_state);
      });
    } else if (this.environment_variables.SAFE_URI &&
    this.environment_variables.SAFE_CERT &&
    this.environment_variables.SAFE_KEY &&
    this.environment_variables.SAFE_CA &&
    this.environment_variables.SAFE_PATH) {

      my_promise = new Promise((resolve, reject) => {
        let buff = Buffer.from(this.environment_variables.SAFE_CERT, "base64");
        let cert = buff.toString("ascii");

        buff = Buffer.from(this.environment_variables.SAFE_KEY, "base64");
        let key = buff.toString("ascii");

        buff = Buffer.from(this.environment_variables.SAFE_CA, "base64");
        let ca = buff.toString("ascii");

        this.safe_service = new SafeService(
          this.environment_variables.SAFE_URI,
          "v1",
          null,
          null,
          cert,
          key,
          ca
        );
        return resolve(good_state);
      });
    } else if (
      this.environment_variables["_safe.uri"] &&
    this.environment_variables["_safe.cert"] &&
    this.environment_variables["_safe.key"] &&
    this.environment_variables["_safe.ca"] &&
    this.environment_variables["_safe.path"]) {

      my_promise = new Promise((resolve, reject) => {
        let buff = Buffer.from(this.environment_variables["_safe.cert"], "base64");
        let cert = buff.toString("ascii");

        buff = Buffer.from(this.environment_variables["_safe.key"], "base64");
        let key = buff.toString("ascii");

        buff = Buffer.from(this.environment_variables["_safe.ca"], "base64");
        let ca = buff.toString("ascii");

        this.safe_service = new SafeService(
          this.environment_variables["_safe.uri"],
          "v1",
          null,
          null,
          cert,
          key,
          ca
        );
        return resolve(good_state);
      });
    } else {
      my_promise = Promise.resolve({
        "state": false,
        "message": "Environment variables SAFE_URI, SAFE_APPID SAFE_USERID, SAFE_PATH or SAFE_URI, SAFE_CERT, SAFE_KEY, SAFE_CA, SAFE_PATH are not setup. Unable to use Safe. Continuing"
      });
    }
    return my_promise;
  }

  //This will extend or add on to an existing configuration
  extend(config) {
    let configuration = this._configuration;

    this._configuration = this.merge(configuration, config);
    return this.configuration;
  }

  /*
   * Any conflicts by name or name-dot notation combination in environment variables, it will override
   * configuration
   */
  apply_environment_override(object = this._configuration, parent = "") {

    for (let property in object) {
      if (Object.prototype.hasOwnProperty.call(object, property)) {
        let full_prop_name = null;

        if (parent) {
          full_prop_name = `${parent}.${property}`;
        } else {
          full_prop_name = property;
        }

        if (typeof object[property] === "object") {
          this.apply_environment_override(object[property], full_prop_name);
        }

        if (this.environment_variables[full_prop_name]) {
          if (typeof object[property] === "boolean") {
            object[property] = this.environment_variables[full_prop_name] == "true";
          } else if (isNaN(object[property]) === false) {
            object[property] = parseInt(this.environment_variables[full_prop_name], 10);
          } else {
            object[property] = this.environment_variables[full_prop_name];
          }
        }
      }
    }
  }

  apply_safe_overrides(object = this._configuration, parent = "") {

    return this.check_safe().then((resp) => {
      if (resp.state) {
        if (this.safe_service) {
          return this.safe_service.list(this.environment_variables.SAFE_PATH || this.environment_variables["_safe.path"])
            .then((result) => {
              this.safe_variables = result;
              this.apply_safe_override(object, parent);
              return Promise.resolve(resp);
            }).then(() => {
              return this.safe_service.revoke_token();
            });
        }
      }
      return Promise.resolve(resp);
    });
  }

  apply_safe_override(object = this._configuration, parent = "") {
    for (let property in object) {
      if (Object.prototype.hasOwnProperty.call(object, property)) {
        let full_prop_name = null;

        if (parent) {
          full_prop_name = `${parent}.${property}`;
        } else {
          full_prop_name = property;
        }

        if (typeof object[property] === "object") {
          this.apply_safe_override(object[property], full_prop_name);
        }

        if (this.safe_variables[full_prop_name]) {
          if (typeof object[property] === "boolean") {
            object[property] = this.safe_variables[full_prop_name] == "true";
          } else if (isNaN(object[property]) === false) {
            object[property] = parseInt(this.safe_variables[full_prop_name], 10);
          } else {
            object[property] = this.safe_variables[full_prop_name];
          }
        }
      }
    }
  }

  /*
   * Merges two (or more) objects,
   * giving the last one precedence
   */
  merge(target, source) {
    if (typeof target !== "object") {
      target = {};
    }
    for (let property in source) {
      if (source.hasOwnProperty(property)) {
        let sourceProperty = source[property];

        if (typeof sourceProperty === "object") {
          target[property] = this.merge(target[property], sourceProperty);
          continue;
        }
        target[property] = sourceProperty;
      }
    }
    for (let a = 2, l = arguments.length; a < l; a++) {
      this.merge(target, arguments[a]);
    }
    return target;
  }

  //Returns the current configuration
  get configuration() {
    return this._configuration;
  }
}
module.exports = ConfigurationService;