import { Connection, createConnection, getConnection } from 'typeorm';

import { ITypeOrmMssqlSetupService } from './index.service.js';

export class TypeOrmMssqlSetupService implements ITypeOrmMssqlSetupService {

  _server: string;
  _user_name: string;
  _password: string;
  _database: string;
  _models: Array<any>;

  _service!: Connection;

  constructor(server: string, database: string, user_name: string, password: string,  models: Array<any>) {
    this._server = server;
    this._database = database;
    this._user_name = user_name;
    this._password = password;
    this._models = models;
  }

  public async initialize(): Promise<void> {
    return createConnection({
      name: "default",
      type: "mssql",
      host: this._server,
      username: this._user_name,
      password: this._password,
      database: this._database,
      extra: true,
      options: {
          isolation: "READ_UNCOMMITTED"
      },
      entities: this._models
    }).then(() =>
    {
        let con = getConnection();
        con.entityMetadatas.forEach((entity) =>{
            console.log(`Table Mapped: ${entity.name}`);
        })
        return Promise.resolve();
    });
  }

  public close(): Promise<void>{
    return this._service.close();
  }
}
