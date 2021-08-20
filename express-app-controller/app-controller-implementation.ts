import compression from 'compression';
import cors from 'cors';
import express from 'express';

import { IAppControllerService } from './iapp-controller-service';

export class AppControllerService implements IAppControllerService {

  private _app: any;
  private _json_options: any;
  private _url_encoded_options: any;
  private _cors_options: any =  {
    origin: [],
    methods: [],
    allowedHeaders: [],
    credentials: true,
    preflightContinue: true
  }

  constructor(
    app = express(),
    allowed_domains = ["https://myclient.somedomain.com"],
    allowed_methods = ["GET"],
    allowed_headers = ["Content-Type"],
    exposed_headers = ["Content-Type"],
    logger: any = {},
    json_options: any = {},
    url_encoded_options: any = {}
  ) {
    this._app = app;
    this._cors_options.origin = allowed_domains;
    this._cors_options.methods = allowed_methods;
    this._cors_options.allowedHeaders = allowed_headers;
    this._cors_options.exposedHeaders = exposed_headers;
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
    this._app.use(express.urlencoded(this._url_encoded_options));
    this._app.use(express.json(this._json_options));
    this._app.use(cors(this._cors_options));
    this._app.use(this.set_default_security_headers);
  }

  private set_default_security_headers(req: any, res: any, next: any) {
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=15552000; includeSubDomains; preload"
    );
    res.setHeader("X-Frame-Options", "deny");
    res.setHeader("X-Content-Type-Options", "nosniff");
    next();
  }
}