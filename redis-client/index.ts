import redis from 'redis';
import { promisify } from 'util';

import { IRedisClientService } from './iindex-service';


export class RedisClientService implements IRedisClientService {
  private _uri: string;
  private _options: any;
  private _redis: any;

  private _get: any;
  private _set: any;
  private _delete: any;


  constructor(host: string, database: Number, port: 6379, options: any = { }, debug = false) {

    this._uri = `redis://${host}:${port}/?db=${database}`;
    if(options){
      this._options = options;
    }

    this._redis = redis.createClient(this._uri, options);
    this._redis.debug_mode = debug;
    this._get = promisify(this._redis.get).bind(this._redis);
    this._set = promisify(this._redis.set).bind(this._redis);
    this._delete = promisify(this._redis.del).bind(this._redis)
  }

  public set(key: any, value: any): Promise<any>{
    return this._set(key, value);
  }

  public get(key: any): Promise<any> {
    return this._get(key); 
  }
  
  public delete(key: any): Promise<any> {
    return this._delete(key);
  }

}
