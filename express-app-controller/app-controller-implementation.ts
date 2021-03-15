import body_parser from 'body-parser';
import compression from 'compression';
import express from 'express';

import { IAppControllerService } from './iapp-controller-service';

export class AppControllerService implements IAppControllerService {

  private _app: any;
  private _whitelist: any;
  private _allowed_headers: any;
  private _allowed_methods: any;
  private _json_options: any;
  private _url_encoded_options: any;

  constructor(
    app = express(),
    allowed_domains = ["https://myclient.somedomain.com"],
    allowed_methods = ["GET"],
    allowed_headers = ["Content-Type"],
    logger: any = {},
    json_options: any = {},
    url_encoded_options: any = {}
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

    if (Object.getOwnPropertyNames(logger).length >= 1 ) {
      this._app.use(logger);
    }
    this.setup_app();
  }

  get app() {
    return this._app;
  }

  //private
  private setup_app() {

    this._app.use(compression());
    this._app.use(body_parser.urlencoded(this._url_encoded_options));
    this._app.use(body_parser.json(this._json_options));

    this._app.use((req: any, res: any, next: any) => {
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
      this._app.on("error", (error: any) => {
        return res.status(403).json({
          error: `Internal Server Error ${error}`,
        });
      });
      return next();
    });
  }

  private static set_default_security_headers(res: any) {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains; preload"
    );
    res.setHeader("X-Frame-Options", "deny");
    res.setHeader("X-Content-Type-Options", "nosniff");
  }

  private set_cors_headers(origin: any, verb: any, res: any) {
    if (verb === "OPTIONS") {
      AppControllerService.set_cors_origin(res, origin);
      this.set_cors_additional_headers(res);
    } else if (verb !== "OPTIONS") {
      AppControllerService.set_cors_origin(res, origin);
    }
  }

  private static set_cors_origin(res: any, domain: string) {
    res.setHeader("Access-Control-Allow-Origin", domain);
  }

  private set_cors_additional_headers(res: any) {
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

  private is_whitelisted(request_origin: any) {
    let test = false;
    let origin_index = this._whitelist.indexOf(request_origin);

    if (origin_index !== -1) {
      test = true;
    }
    return test;
  }
}