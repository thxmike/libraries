export interface ICommonController {
  get_aggregate_request(req: any, res: any, next: any): void;

  post_aggregate_request(req: any, res: any, next: any): void;

  get_instance_request(req: any, res: any, next: any): void;

  patch_instance_request(req: any, res: any, next: any): void;

  delete_instance_request(req: any, res: any, next: any): void;

  determine_error_status(error: any): number

  setup_filter(headers: any, query?: any): any;
}
