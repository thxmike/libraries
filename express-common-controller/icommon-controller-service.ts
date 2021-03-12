export interface ICommonController {
  get_aggregate_request(req: any, res: any): void;

  post_aggregate_request(req: any, res: any): void;

  get_instance_request(req: any, res: any): void;

  patch_instance_request(req: any, res: any): void;

  delete_instance_request(req: any, res: any): void;
}
