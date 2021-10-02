import { mongoose } from '@thxmike/mongoose-custom';

import { IMongooseSetupService } from './iindex-service.js';

//Setup default with native ES6 Promise Library
(<any>mongoose).Promise = Promise;

export class MongooseSetupService implements IMongooseSetupService {

  private _mongoose: any;
  private _director: any;

  constructor(ModelDirector: any, uri = "mongodb://localhost:27017/test", debug = false, username = '', password = '', certificate = '', ca = '', app_name = "Custom Application", promise = null) {

    this._mongoose = mongoose;

    if (promise) { //Setup custom promise library of choice
      this._mongoose.Promise = promise;
    }

    const options = MongooseSetupService.define_options(app_name, username, password, certificate, ca);

    this._director = new ModelDirector(this._mongoose).director;

    this._mongoose.set("debug", debug);

    this.connect(uri, options);
  }

  static define_options(app_name: string, username?: string, password?: string, certificate?: string, ca?: string) {
    let options: any = {
      "keepAlive": 300000,
      "useCreateIndex": true,
      "connectTimeoutMS": 30000,
      "useNewUrlParser": true,
      "appname": app_name,
      "useUnifiedTopology": true
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

  connect(uri: string, options: any) {
    this._mongoose.connect(uri, options)
      .then(() => {
        this.listen();
        console.log("Mongoose is Ready");
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

  listen() {
    this._mongoose.connection.on("error", (error: any) => {
      console.error(`Mongoose connection error: ${error}`);
    });

    this._mongoose.connection.on("open", () => {
      console.log("Mongoose default connection is open");
    });

    this._mongoose.connection.on("close", () => {
      console.log("Mongoose default connection is open");
    });

    this._mongoose.connection.on("connected", () => {
      console.log("Mongoose default connection connected");
    });

    this._mongoose.connection.on("connecting", () => {
      console.log("Mongoose default connection connecting");
    });

    this._mongoose.connection.on("disconnected", () => {
      console.log("Mongoose default connection disconnected");
    });

    this._mongoose.connection.on("reconnect", () => {
      console.log("Mongoose default connection reconnected");
    });

    //If the Node process ends, close the Mongoose connection
    process.on("SIGINT", () => {
      this._mongoose.connection.close(() => {
        console.log("Mongoose default connection disconnected through app termination");
        process.exit(0);
      });
    });
  }
}