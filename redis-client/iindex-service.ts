export interface IRedisClientService {

  get(key: any): Promise<any>;

  set(key: any, value: any): Promise<any>;
}
