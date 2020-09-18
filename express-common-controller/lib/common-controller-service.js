const BaseController = require("express-base-controller");
const TypeConversionClient = require("type-conversion");

const util = require("util");

class CommonController extends BaseController {

  get_aggregate_request(req, res) {

    let filter = this._check_filter(req);

    if (this.has_parent) {
      let parts = req.baseUrl.split("/");
      let parent_id = `${this._parent.alternate_name}_id`;

      let item = { [parent_id]: `${parts[parts.length - 1]}` };

      filter = {
        ...filter,
        ...item
      };
    }
    let count = 0;

    req.query.filter = filter;

    let args = BaseController.parse_query_string_to_args(req);

    this._data_service.get_count(args[2]).then((cnt) => {
      count = cnt;
      if((((args[0] - 1) * args[1]) > count) && args[0] !== 1){
        return Promise.reject({ "code": 404, "error": 'page not found' });
      }
      return this._data_service.get_aggregate_operation(...args);

    }).then((response) => {
      res.header("count", count);
      this._setup_header(args, res, response);
      res.status(response.status).json(response.message);
    }).catch((err) => {
      return this.send_error(res, req, err, this.constructor.name, "get_aggregate_request");
    });
  }


  _check_filter(req){
    let filter = {};
    if(req.query.filter) {
      filter = req.query.filter;
    }

    if (typeof filter === "string") {
      filter = JSON.parse(filter);
    }
    return filter;
  }


  post_aggregate_request(req, res) {

    if (this.has_parent) {
      let parts = req.baseUrl.split("/");

      req.body[`${this._parent.alternate_name}_id`] = parts[parts.length - 1];
    }

    this._data_service.post_operation(req.body).then((response) => {
      res.status(response.status).json(response.message);
    }).catch((err) => {
      return  this.send_error(res, req, err, this.constructor.name, "post_aggregate_request");
    });
  }

  get_instance_request(req, res) {

    let id = req.params[`${this.alternate_name}_id`];

    this._data_service.get_instance_operation_by_id(id).then((response) => {
      res.status(response.status).json(response.message);
    }).catch((err) => {
      return this.send_error(res, req, err, this.constructor.name, "get_instance_request");
    });
  }

  patch_instance_request(req, res) {

    let id = req.params[`${this.alternate_name}_id`];

    this._data_service.patch_operation(id, req.body).then((response) => {
      res.status(response.status).json(response.message);
    }).catch((err) => {
      return this.send_error(res, req, err, this.constructor.name, "patch_instance_request");
    });
  }

  delete_instance_request(req, res) {

    let id = req.params[`${this.alternate_name}_id`];

    this._data_service.delete_operation(id, req.body).then((response) => {
      res.status(response.status).json(response.message);
    }).catch((err) => {
      return this.send_error(res, req, err, this.constructor.name, "delete_instance_request");
    });
  }

  send_error(res, req, err, class_name, method) {

    let code = 400;
    if(err.code){
      code = err.code;
    }
    err.path = req.path;
    res.status(code).send(err);
    console.log(`${class_name}.${method}: ${TypeConversionClient.convert_object_to_string(err)}`);
    return Promise.resolve();
  }

  _setup_header(args, res, response){
    
    if(args[0] !== null){
      res.header("page", args[0]);
    }
    if(args[1]){
      res.header("per_page", args[1]);
    }
  }
}

module.exports = CommonController;