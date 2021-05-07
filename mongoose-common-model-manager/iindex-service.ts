export interface ICommonModelManager {
 
  default_filter(data: any): any;

  get_aggregate_operation(page: number, per_page: number, filter: any):  Promise<any>;

  get_count(filter: any):  Promise<any>;

  get_instance_operation_by_id(id: string):  Promise<any>;

  get_instance_operation_by_code(code: string): Promise<any>;

  post_operation(data: any) : Promise<any>;

  patch_operation(id: string, request_data: any): Promise<any>;

  delete_operation(id: string, data: any, is_soft: boolean):  Promise<any>

  soft_delete(id: string, data: any):  Promise<any>;

  hard_delete(id: string, data: any):  Promise<any>;
  
  check_patch_data(id: string, request_data: any, instance: any): Promise<any>;

  check_nonce(new_nonce: string, old_nonce: string): Promise<any>;

  set_data(ent: any, data: any): any;

  check_sub_documents(instance: any):  Promise<any>;

  check_if_exists(instance: any, data: any): any;

  save_instance(Model: any, data: any): any;
}