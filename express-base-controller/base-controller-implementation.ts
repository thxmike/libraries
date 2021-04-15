import pluralize from 'pluralize';

import { IBaseController } from './ibase-controller-service';

export class BaseController implements IBaseController {

  private _name: string;

  protected _alternate_name: string;

  private _application_root: string;

  protected _parent: any;

  protected _router: any;

  private _app: any;

  private _data_service: any;

  protected _message_service: any;

  protected get data_service(): any {
    return this._data_service;
  }

  protected get message_service(): any {
    return this._message_service;
  }

  public get router() {
    return this._router;
  }

  public get name(): string {
    return this._name;
  }

  public get alternate_name(): string {
    return this._alternate_name;
  }

  public get aggregate_route() {
    return `/${pluralize(this.name)}`;
  }

  public get instance_route() {
    return `/${this.aggregate_route.substr(1)}/:${this.alternate_name}_id`;
  }

  public get has_parent() {
    return Boolean(this._parent);
  }

  constructor(
    name: string,
    app: any,
    router: any,
    application_root: string,
    version: string,
    data_service: any,
    messaging_service: any,
    express_services: any[] = [],
    parent_controller: any = null
  ) {

    this._name = name;
    this._alternate_name = name.replace(/-/g, "_");
    this._application_root = `${application_root}${version}`;

    this.check_express_app(app);
    this.check_express_router(router);
    this.check_services(data_service, messaging_service, express_services);

    this._parent = parent_controller;

    this.setup_router();
  }

  private setup_router() {
    this.setup_default_routes_on_router();

    if (this._parent) {
      this.nest_route();
    } else {
      this.set_router_to_application();
    }
  }

  private setup_default_routes_on_router() {
    this.setup_express_all_requests();
    this.setup_aggregate_routes();
    this.setup_instance_routes();
  }

  public setup_express_all_requests() {
    this._router.use((req: any, res: any, next: any) => {
      this.check_header(req.headers);
      next();
    });
  }

  //@virtual
  public check_header(header: any): any {}

  public static has_required_fields(data: any) {
    let required_fields_available = true;

    if (!data.code || !data.name || !data.description) {
      required_fields_available = false;
    }
    return required_fields_available;
  }

  private check_express_app(app: any) {
    if (app) {
      //injected Express App
      this._app = app;
    } else {
      throw new Error("Must inject an express app to this module");
    }
  }

  private check_express_router(router: any) {
    if (router) {
      //injected Express Router
      this._router = router;
    } else {
      throw new Error("Must inject a new express router to this module");
    }
  }

  private check_services(data_service: any, messaging_service: any, services: BaseController[] = []) {
    //this._services_collection = services;
    if (data_service) {
      this._data_service = data_service;
    }
    if (messaging_service) {
      this._message_service = messaging_service;
    }
    if (services) {
      services.forEach((service) => {
        //let service_name = `${service.constructor.name}`;
        //this[service_name] = service;
        this._router.use(service);
      });
    }
  }

  /*
   * Parses the args in a query string from a request
   * Used in a rest argument (i.e. ...arg)
   * Takes in a request object
   */
  protected static parse_query_string_to_args(req: any) {
    let args = [];
    let max = 100;

    if (req.query) {
      if (req.query.page) {
        args[0] = parseInt(req.query.page, 10);
      } else {
        args[0] = 1;
      }
      if (req.query.per_page){// && parseInt(req.query.per_page, 10) <= max) {
        args[1] = parseInt(req.query.per_page, 10);
      } else {
        args[1] = 50;
      }
      if (req.query.filter) {
        let filter = req.query.filter;

        args[2] = filter;
      } else {
        args[2] = {};
      }
      if (req.query.sort) {
        let sort = req.query.sort;

        args[3] = sort;
      } if (req.query.last) {
        let last = req.query.last;

        args[4] = last;
      } else {
        args[3] = {};
      }
    } else {
      args[0] = 0; //page
      args[1] = 50; //per_page
      args[2] = {}; //filter
      args[3] = {}; //sort
      args[4] = false; //last
    }

    return args;
  }


  /*
   * Add Top Level Routes (All Entities)
   * route = {application_root}/{instance}s/
   */
  public setup_aggregate_routes() {
    this._router
      .route(this.aggregate_route)
      .get(this.get_aggregate_request.bind(this))
      .post(this.post_aggregate_request.bind(this));
  }

  /*
   *Add instance Level Routes
   *route = {application_root}/{instance}s/{instance_id}/
   */
  public setup_instance_routes() {

    this._router
      .route(this.instance_route)
      .get(this.get_instance_request.bind(this))
      .patch(this.patch_instance_request.bind(this))
      .put(this.put_instance_request.bind(this))
      .delete(this.delete_instance_request.bind(this));
  }

  public default_request(req: any, res: any): void {

    let message = "Not Implemented";

    if (this._message_service) {
      message = this._message_service.not_implemented;
    }

    res.status(400).json({
      message
    });
  }

  public static parse_query_string(req: any) {
    return req.query;
  }

  public get_aggregate_request(req: any, res: any, next: any): void {
    this.default_request(req, res);
  }

  public post_aggregate_request(req: any, res: any, next: any): void {
    this.default_request(req, res);
  }

  public get_instance_request(req: any, res: any, next: any): void {
    this.default_request(req, res);
  }

  public patch_instance_request(req: any, res: any, next: any): void {
    this.default_request(req, res);
  }

  public delete_instance_request(req: any, res: any, next: any): void {
    this.default_request(req, res);
  }

  public put_instance_request(req: any, res: any, next: any): void {
    this.default_request(req, res);
  }

  private set_router_to_application() {
    this._app.use(this._application_root, this.router);
  }

  private nest_route() {
    //you can nest routers by attaching them as middleware:
    if (this._parent) {
      let parent_controller_route = `${this._parent.aggregate_route}/:${
        this._parent.alternate_name
      }_id`;

      this._parent.router.use(parent_controller_route, this.router);
    }
  }
}
