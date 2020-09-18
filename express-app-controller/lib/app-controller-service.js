const body_parser = require("body-parser");
const compression = require("compression");
const express = require("express");

class AppControllerService {
  constructor(
    app = express(),
    allowed_domains = ["https://myclient.us.corp"],
    allowed_methods = ["GET"],
    allowed_headers = ["Content-Type"],
    logger = null,
    json_options = {},
    url_encoded_options = {}
  ) {
    this._app = app;
    this._whitelist = allowed_domains;
    this._allowed_methods = allowed_methods;
    this._allowed_headers = allowed_headers;
    json_options.limit = "5mb";
    this._json_options = json_options;
    url_encoded_options.extended = true;
    url_encoded_options.limit = "5mb";
    this._url_encoded_options = url_encoded_options;

    if (logger) {
      this._app.use(logger);
    }
    this.setup_app();
  }

  get app() {
    return this._app;
  }

  //private
  setup_app() {
    this._app.use(compression());
    this._app.use(body_parser.urlencoded(this._url_encoded_options));
    this._app.use(body_parser.json(this._json_options));

    this._app.on("error", (error) => {
      return res.status(403).json({
        error: "Internal Server Error",
      });
    });

    this._app.use((req, res, next) => {
      let origin = req.get("origin");

      if (origin) {
        if (this.is_whitelisted(origin)) {
          this.set_cors_headers(origin, req.method, res);
        } else {
          return res.status(403).json({
            error: "Not a valid requestor",
          });
        }
      }

      AppControllerService.set_default_security_headers(res);
      return next();
    });
  }

  static set_default_security_headers(res) {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains; preload"
    );
    res.setHeader("X-Frame-Options", "deny");
    res.setHeader("X-Content-Type-Options", "nosniff");
  }

  set_cors_headers(origin, verb, res) {
    if (verb === "OPTIONS") {
      AppControllerService.set_cors_origin(res, origin);
      this.set_cors_additional_headers(res);
    } else if (verb !== "OPTIONS") {
      AppControllerService.set_cors_origin(res, origin);
    }
  }

  static set_cors_origin(res, domain) {
    res.setHeader("Access-Control-Allow-Origin", domain);
  }

  set_cors_additional_headers(res) {
    res.setHeader(
      "Access-Control-Allow-Headers",
      this._allowed_headers.join(", ")
    );
    res.setHeader(
      "Access-Control-Allow-Methods",
      this._allowed_methods.join(", ")
    );
    res.setHeader("Access-Control-Allow-Credentials", true);
  }

  is_whitelisted(request_origin) {
    let test = false;
    let origin_index = this._whitelist.indexOf(request_origin);

    if (origin_index !== -1) {
      test = true;
    }
    return test;
  }
}
module.exports = AppControllerService;
