import { BaseController } from '@thxmike/express-base-controller';
import { TypeConversionService } from '@thxmike/type-conversion';

import { ICommonController } from './icommon-controller-service';

export class CommonController extends BaseController implements ICommonController{

  public get_aggregate_request(req: any, res: any) {

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

    this._data_service.get_count(args[2]).then((cnt: number) => {
      count = cnt;
      if((((args[0] - 1) * args[1]) > count) && args[0] !== 1){
        return Promise.reject({ "code": 404, "error": 'page not found' });
      }
      return this._data_service.get_aggregate_operation(...args);

    }).then((response: any) => {
      res.header("count", count);
      this._setup_header(args, res, response);
      res.status(response.status).json(response.message);
    }).catch((err: any) => {
      return this._send_error(res, req, err, this.constructor.name, "get_aggregate_request");
    });
  }


  _check_filter(req: any){
    let filter = {};
    if(req.query.filter) {
      filter = req.query.filter;
    }

    if (typeof filter === "string") {
      filter = JSON.parse(filter);
    }
    return filter;
  }


  public post_aggregate_request(req: any, res: any) {

    if (this.has_parent) {
      let parts = req.baseUrl.split("/");

      req.body[`${this._parent.alternate_name}_id`] = parts[parts.length - 1];
    }

    this._data_service.post_operation(req.body).then((response: any) => {
      res.status(response.status).json(response.message);
    }).catch((err: any) => {
      return  this._send_error(res, req, err, this.constructor.name, "post_aggregate_request");
    });
  }

  public get_instance_request(req: any, res: any) {

    let id = req.params[`${this.alternate_name}_id`];

    this._data_service.get_instance_operation_by_id(id).then((response: any) => {
      res.status(response.status).json(response.message);
    }).catch((err: any) => {
      return this._send_error(res, req, err, this.constructor.name, "get_instance_request");
    });
  }

  public patch_instance_request(req: any, res: any) {

    let id = req.params[`${this.alternate_name}_id`];

    this._data_service.patch_operation(id, req.body).then((response: any) => {
      res.status(response.status).json(response.message);
    }).catch((err: any) => {
      return this._send_error(res, req, err, this.constructor.name, "patch_instance_request");
    });
  }

  public delete_instance_request(req: any, res: any) {

    let id = req.params[`${this.alternate_name}_id`];

    this._data_service.delete_operation(id, req.body).then((response: any) => {
      res.status(response.status).json(response.message);
    }).catch((err: any) => {
      return this._send_error(res, req, err, this.constructor.name, "delete_instance_request");
    });
  }

  private _send_error(res: any, req: any, err: any, class_name: string, method: string) {

    let code = 400;
    if(err.code){
      code = err.code;
    }
    err.path = req.path;
    res.status(code).send(err);
    console.log(`${class_name}.${method}: ${TypeConversionService.convert_object_to_string(err)}`);
    return Promise.resolve();
  }

  private _setup_header(args: any, res: any, response: any){
    
    if(args[0] !== null){
      res.header("page", args[0]);
    }
    if(args[1]){
      res.header("per_page", args[1]);
    }
  }
}