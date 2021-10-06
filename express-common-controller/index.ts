import { BaseController } from '@thxmike/express-base-controller';
import { TypeConversionService } from '@thxmike/type-conversion';

import { ICommonController } from './iindex-service';

export class CommonController
  extends BaseController
  implements ICommonController
{
  public get_aggregate_request(req: any, res: any, next: any) {
    let filter = this.setup_filter(req.headers, req.query);

    if (this.has_parent) {
      let parts = req.baseUrl.split("/");
      let parent_id = `${this._parent.alternate_name}_id`;
      let val = parts[parts.length - 1].replace(/-/g, '').slice(8);
      let item = { [parent_id]: `${val}` };
      filter = {
          ...filter,
          ...item,
      };
  }
    let count = 0;

    req.query.filter = filter;

    let args = BaseController.parse_query_string_to_args(req);

    if ((args[0] - 1) * args[1] > count && args[0] !== 1) {
      return Promise.reject({ code: 404, error: "page not found" });
    }

    Promise.all([
      this.data_service.get_aggregate_operation(args[0], args[1], filter),
      this.data_service.get_count(filter),
    ])
      .then((response: any) => {
        let cnt = response[1];
        let code = response[0].status;
        let message = response[0].message;

        res.header("count", cnt);
        this._setup_header(args, res, response);
        res.status(code).json(message);
      })
      .catch((err: any) => {
        return this._send_error(
          res,
          req,
          err,
          this.constructor.name,
          "get_aggregate_request"
        );
      });
  }

  public setup_filter(headers: any, query?: any): any {
    let filter = {};
    if (headers && headers.context_id) {
      let context_id = headers.context_id;
      filter = { context_id: context_id };
    }

    if (query && query.filter) {
      filter = { ...filter, ...JSON.parse(query.filter) };
    }

    return filter;
  }

  public post_aggregate_request(req: any, res: any, next: any) {
    let filter = this.setup_filter(req.headers, req.query);
    if (this.has_parent) {
      let parts = req.baseUrl.split("/");

      req.body[`${this._parent.alternate_name}_id`] = parts[parts.length - 1];
    }

    this.check_payload(res, req.body)
      .then(() => {
        return this.data_service.post_operation(req.body, filter);
      })
      .then((response: any) => {
        res.status(response.status).json(response.message);
      })
      .catch((err: any) => {
        return this._send_error(
          res,
          req,
          err,
          this.constructor.name,
          "post_aggregate_request"
        );
      });
  }

  public get_instance_request(req: any, res: any, next: any) {
    let filter = this.setup_filter(req.headers, req.query);
    let id = req.params[`${this.alternate_name}_id`];

    this.data_service
      .get_instance_operation_by_id(id, filter)
      .then((response: any) => {
        res.status(response.status).json(response.message);
      })
      .catch((err: any) => {
        return this._send_error(
          res,
          req,
          err,
          this.constructor.name,
          "get_instance_request"
        );
      });
  }

  public patch_instance_request(req: any, res: any, next: any) {
    let id = req.params[`${this.alternate_name}_id`];

    this.check_payload(res, req.body)
      .then(() => {
        return this.data_service.patch_operation(id, req.body);
      })
      .then((response: any) => {
        res.status(response.status).json(response.message);
      })
      .catch((err: any) => {
        return this._send_error(
          res,
          req,
          err,
          this.constructor.name,
          "patch_instance_request"
        );
      });
  }

  public delete_instance_request(req: any, res: any, next: any) {
    let id = req.params[`${this.alternate_name}_id`];
    this.check_payload(res, req.body)
      .then(() => {
        return this.data_service.delete_operation(id, req.body);
      })
      .then((response: any) => {
        res.status(response.status).json(response.message);
      })
      .catch((err: any) => {
        return this._send_error(
          res,
          req,
          err,
          this.constructor.name,
          "delete_instance_request"
        );
      });
  }

  public _send_error(
    res: any,
    req: any,
    err: any,
    class_name: string,
    method: string
  ) {
    let code = 400;
    if (err.code) {
      code = err.code;
    }
    err.path = req.path;
    res.status(code).send(err);
    console.log(
      `${class_name}.${method}: ${TypeConversionService.convert_object_to_string(
        err
      )}`
    );
    return Promise.resolve();
  }

  public _setup_header(args: any, res: any, response: any) {
    if (args[0] !== null) {
      res.header("page", args[0]);
    }
    if (args[1]) {
      res.header("per_page", args[1]);
    }
  }

  public async check_payload(res: any, body: any) {
    if (!body || this.is_empty(body)) {
      return Promise.reject("This requires a payload");
    }
    if (!this.is_JSON(JSON.stringify(body))) {
      return Promise.reject("This request requires a valid JSON payload");
    }
    
    return Promise.resolve();
  }

  private is_empty(object: any) {
    return !Object.keys(object).length;
  }

  private is_JSON(text: any) {
    if (typeof text !== "string") {
      return false;
    }
    try {
      JSON.parse(text);
      return true;
    } catch (error) {
      return false;
    }
  }

  public determine_error_status(error: any): number {
    let status_code = 400;
    if (error) {
      if (error.message === "This order has already been requested") {
        status_code = 409;
      } else if (error.message === "Request is malformed") {
        status_code = 400;
      } else if (
        error.message === "This request requires a valid JSON payload"
      ) {
        status_code = 400;
      } else if (error.message === "This requires a payload") {
        status_code = 400;
      }
      // TODO to add logic for error status
    }
    return status_code;
  }
}
