import { mongoose } from '@thxmike/mongoose-custom';

import multer from "multer";
import * as crypto from "crypto";
import { GridFsStorage } from "multer-gridfs-storage";

import { IMongooseSetupService } from './iindex-service.js';

//Setup default with native ES6 Promise Library
(<any>mongoose).Promise = Promise;

export class MongooseSetupService implements IMongooseSetupService {

  private _mongoose: any;
  private _director: any;
  private multi_part: any;
  private gfs: any;
  private uri: string;

  constructor(ModelDirector: any, uri = "mongodb://localhost:27017/test", debug = false, username = '', password = '', certificate = '', ca = '', app_name = "Custom Application", promise = null) {

    this._mongoose = mongoose;

    if (promise) { //Setup custom promise library of choice
      this._mongoose.Promise = promise;
    }

    this.uri = uri;

    const options = MongooseSetupService.define_options(app_name, username, password, certificate, ca);

    const storage = this.setup_grid_fs_storage();

    this.multi_part = multer({
      storage
    });

    this._director = new ModelDirector(this._mongoose).director;

    this._mongoose.set("debug", debug);

    this.connect(options);
  }

  get multi_part_uploader() {
    return this.multi_part;
  }

  get grid_fs_bucket() {
    return this.gfs;
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

  connect(options: any) {
    this._mongoose.connect(this.uri, options)
      .then(() => {
        this.gfs = new mongoose.mongo.GridFSBucket(this.mongoose.connection.db, {
          bucketName: "uploads"
        });
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

  setup_grid_fs_storage() {
    const storage = new GridFsStorage({
      "url": this.uri,
      "file": (req: any, file: any) => {
        return new Promise((resolve, reject) => {
          crypto.randomBytes(16, (err: any, buf: any) => {
            if (err) {
              return reject(err);
            }
            const filename = `${buf.toString("hex")}${file.originalname}`;
            const fileInfo = {
              filename,
              "bucketName": "uploads"
            };

            return resolve(fileInfo);
          });
        });
      }
    });

    return storage;
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