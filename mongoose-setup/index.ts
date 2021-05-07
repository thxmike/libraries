import { MongooseUrl } from '@thxmike/mongoose-url-type';
import * as MongooseUUID2 from '@thxmike/mongoose-uuid-type';
import mongoose from 'mongoose';

import { IMongooseSetupService } from './iindex-service.js';

// Will add Url type mongoose.SchemaTypes.Url
MongooseUrl(mongoose);

// Will add the UUID type to the Mongoose Schema types
MongooseUUID2(mongoose);

//Setup default with native ES6 Promise Library
(<any>mongoose).Promise = Promise;

export class MongooseSetupService implements IMongooseSetupService {

  private _mongoose: any;
  private _director: any;

  constructor(ModelDirector: any, uri = "mongodb://localhost:27017/test", debug = false, username = '', password = '', certificate = '', ca = '', app_name = "Custom Application", promise = null) {

    this._mongoose = mongoose;

    const db = this._mongoose.connection;

    if (promise) { //Setup custom promise library of choice
      this._mongoose.Promise = promise;
    }

    const options = MongooseSetupService.define_options(app_name, username, password, certificate, ca);

    this._director = new ModelDirector(this._mongoose).director;

    this.connect(uri, options, db, debug);
  }

  static define_options(app_name: string, username?: string, password?: string, certificate?: string, ca?: string) {
    let options: any = {
      "keepAlive": 300000,
      "useCreateIndex": true,
      "connectTimeoutMS": 30000,
      "reconnectTries": Number.MAX_VALUE, //Never stop trying to reconnect
      "reconnectInterval": 500, //Reconnect every 500ms
      "useNewUrlParser": true,
      "appname": app_name
    };

    if(username && password){
      options.user = username,
      options.password = password
    }

    if (certificate && ca) {

      options.auth = {};
      options.auth.authMechanism = "MONGODB-X509";
      options.auth.authSource = "$external";
      options.ssl = true;
      options.sslValidate = true;
      options.sslCA = ca;
      options.sslCert = certificate;
      options.sslKey = certificate;
    }
    return options;
  }

  connect(uri: string, options: any, db: any, debug: any) {

    this._mongoose.set("debug", debug);
    this._mongoose.connect(uri, options)
      .then(() => {
        console.log("Mongoose is Ready");
        this.listen(db);
      })
      .catch((error: any) => {
        throw new Error(error);
      });
  }

  get mongoose() {
    return this._mongoose;
  }

  get director() {
    return this._director;
  }

  listen(db: any) {
    db.on("error", (error: any) => {
      console.error(`Mongoose connection error: ${error}`);
      db.close();
      this._mongoose.connection.close();
    });

    db.on("open", () => {
      console.log("Mongoose default connection is open");
    });

    db.on("close", () => {
      console.log("Mongoose default connection is open");
      db.close();
      this._mongoose.connection.close();
    });

    db.on("connected", () => {
      console.log("Mongoose default connection connected");
    });

    db.on("connecting", () => {
      console.log("Mongoose default connection connecting");
    });

    db.on("disconnected", () => {
      console.log("Mongoose default connection disconnected");
      db.close();
      this._mongoose.connection.close();
    });

    db.on("reconnect", () => {
      console.log("Mongoose default connection reconnected");
    });

    //If the Node process ends, close the Mongoose connection
    process.on("SIGINT", () => {
      db.close(() => {
        console.log("Mongoose default connection disconnected through app termination");
        this._mongoose.connection.close();
        process.exit(0);
      });
    });
  }
}