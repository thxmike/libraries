import pluralize from 'pluralize';
export class BaseController {
    constructor(name, app, router, application_root, version, data_service, messaging_service, express_services = [], parent_controller = null) {
        this._name = name;
        this._alternate_name = name.replace(/-/g, "_");
        this._application_root = `${application_root}${version}`;
        this.check_express_app(app);
        this.check_express_router(router);
        this.check_services(data_service, messaging_service, express_services);
        this._parent = parent_controller;
        this.setup_router();
    }
    get router() {
        return this._router;
    }
    get name() {
        return this._name;
    }
    get alternate_name() {
        return this._alternate_name;
    }
    get aggregate_route() {
        return `/${pluralize(this.name)}`;
    }
    get instance_route() {
        return `/${this.aggregate_route.substr(1)}/:${this.alternate_name}_id`;
    }
    get has_parent() {
        return Boolean(this._parent);
    }
    setup_router() {
        this.setup_default_routes_on_router();
        if (this._parent) {
            this.nest_route();
        }
        else {
            this.set_router_to_application();
        }
    }
    setup_default_routes_on_router() {
        this.setup_all_requests();
        this.setup_aggregate_routes();
        this.setup_instance_routes();
    }
    setup_all_requests() {
        this._router.use((req, res, next) => {
            this.check_header(req.headers);
            next();
        });
    }
    //@virtual
    check_header(header) { }
    static has_required_fields(data) {
        let required_fields_available = true;
        if (!data.code || !data.name || !data.description) {
            required_fields_available = false;
        }
        return required_fields_available;
    }
    check_express_app(app) {
        if (app) {
            //injected Express App
            this._app = app;
        }
        else {
            throw new Error("Must inject an express app to this module");
        }
    }
    check_express_router(router) {
        if (router) {
            //injected Express Router
            this._router = router;
        }
        else {
            throw new Error("Must inject a new express router to this module");
        }
    }
    check_services(data_service, messaging_service, services = []) {
        if (data_service) {
            this._data_service = data_service;
        }
        if (messaging_service) {
            this._message_service = messaging_service;
        }
        if (services) {
            services.forEach((service) => {
                this[`${service.constructor.name}`] = service;
                this._router.use(service);
            });
        }
    }
    /*
     * Parses the args in a query string from a request
     * Used in a rest argument (i.e. ...arg)
     * Takes in a request object
     */
    static parse_query_string_to_args(req) {
        let args = [];
        let max = 100;
        if (req.query) {
            if (req.query.page) {
                args[0] = parseInt(req.query.page, 10);
            }
            else {
                args[0] = 1;
            }
            if (req.query.per_page) { // && parseInt(req.query.per_page, 10) <= max) {
                args[1] = parseInt(req.query.per_page, 10);
            }
            else {
                args[1] = 50;
            }
            if (req.query.filter) {
                let filter = req.query.filter;
                args[2] = filter;
            }
            else {
                args[2] = {};
            }
            if (req.query.sort) {
                let sort = req.query.sort;
                args[3] = sort;
            }
            if (req.query.last) {
                let last = req.query.last;
                args[4] = last;
            }
            else {
                args[3] = {};
            }
        }
        else {
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
    setup_aggregate_routes() {
        this._router
            .route(this.aggregate_route)
            .get(this.get_aggregate_request.bind(this))
            .post(this.post_aggregate_request.bind(this));
    }
    /*
     *Add instance Level Routes
     *route = {application_root}/{instance}s/{instance_id}/
     */
    setup_instance_routes() {
        this._router
            .route(this.instance_route)
            .get(this.get_instance_request.bind(this))
            .patch(this.patch_instance_request.bind(this))
            .put(this.put_instance_request.bind(this))
            .delete(this.delete_instance_request.bind(this));
    }
    default_request(req, res) {
        let message = "Not Implemented";
        if (this._message_service) {
            message = this._message_service.not_implemented;
        }
        res.status(400).json({
            message
        });
    }
    static parse_query_string(req) {
        return req.query;
    }
    get_aggregate_request(req, res) {
        return this.default_request(req, res);
    }
    post_aggregate_request(req, res) {
        return this.default_request(req, res);
    }
    get_instance_request(req, res) {
        return this.default_request(req, res);
    }
    patch_instance_request(req, res) {
        return this.default_request(req, res);
    }
    delete_instance_request(req, res) {
        return this.default_request(req, res);
    }
    put_instance_request(req, res) {
        this.default_request(req, res);
    }
    set_router_to_application() {
        this._app.use(this._application_root, this.router);
    }
    nest_route() {
        //you can nest routers by attaching them as middleware:
        if (this._parent) {
            let parent_controller_route = `${this._parent.aggregate_route}/:${this._parent.alternate_name}_id`;
            this._parent.router.use(parent_controller_route, this.router);
        }
    }
}
