export interface IBaseController {
  
  router: string;

  name: string;

  alternate_name: string;

  aggregate_route: string;

  data_service: any;

  instance_route: string;

  has_parent: boolean;

  setup_express_all_requests(): void;

  check_header(header: any): any;

  setup_aggregate_routes(): void;

  setup_instance_routes(): void;

  default_request(req: any, res: any): void;

  get_aggregate_request(req: any, res: any, next: any): void;

  post_aggregate_request(req: any, res: any, next: any): void;

  get_instance_request(req: any, res: any, next: any): void;

  patch_instance_request(req: any, res: any, next: any): void;

  delete_instance_request(req: any, res: any, next: any): void;

  put_instance_request(req: any, res: any, next: any): void;
}
