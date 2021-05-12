import redis from 'redis';
import { promisify } from 'util';

import { IRedisClientService } from './iindex-service';


export class RedisClientService implements IRedisClientService {
  private base_uri: string;
  private _options: any;
  private _redis: any;

  private _get: any;
  private _set: any;


  constructor(host: string, database: string, port: 6379, options: any = { }) {

    this.base_uri = `redis://${host}}:${port}/${database}`;
    if(options){
      this._options = options;
    }

    this._redis = redis.createClient(options);
    this._get = promisify(this._redis.get).bind(this._redis);
    this._set = promisify(this._redis.set).bind(this._redis);
    
  }

  public set(key: any, value: any): Promise<any>{
    return this._set(key, value);
  }

  public get(key: any): Promise<any> {
    return this._get(key); 
  }
  
}
