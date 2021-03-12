export interface IRestClientService {
  source_id: string;

  get(uri: string, payload: any, headers: any): Promise<any>;

  post(uri: string, payload: any, headers: any): Promise<any>;

  put(uri: string, payload: any, headers: any): Promise<any>;

  //TODO
  post_file(uri: string, file_content: any, headers: any): void;

  delete(uri: string, payload: any, headers: any): Promise<any>;

  patch(uri: string, payload: any, headers: any): Promise<any>;
}
