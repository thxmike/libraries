const mongoose = require("mongoose");

//Setup default with native ES6 Promise Library
mongoose.Promise = Promise;

//Extend mongoose object with uuid functions - uuid.v4 method i.e. mongoose.uuid.v4
const uuid = require("uuid-mongodb");

//Extend mongoose object
require("./mongoose-uuid-type")(mongoose);

//Extend mongoose object - Setup bson type - i.e. mongoose.bson
const bson = require("bson");

//Extend mongoose object - Setup Url type i.e. - mongoose.SchemaTypes.Url
require("./mongoose-url-type")(mongoose);

//Extend mongoose object - Setup extend_schema i.e. - mongoose.extend_schema();
const extend_schema = require("mongoose-extend-schema");

/*
 *Initializes new instance of mongoose, sets up instance, provides reference to instance
 *Wires up the models to the instance
 *Defaults to test database using uri string
 */
class MongooseSetupService {

  constructor(ModelDirector, uri = "mongodb://localhost:27017/test", debug = false, certificate = null, ca = null, app_name = "Custom Application", promise = null) {

    this._mongoose = mongoose;

    const db = this._mongoose.connection;

    if (promise) { //Setup custom promise library of choice
      this._mongoose.Promise = promise;
    }

    this._mongoose.uuid = uuid;
    this._mongoose.bson = bson;
    this._mongoose.extend_schema = extend_schema;
    this._uri = uri;

    const options = MongooseSetupService.define_options(app_name, certificate, ca);

    this._director = new ModelDirector(this._mongoose).director;

    this.connect(uri, options, db, debug);
  }

  static define_options(app_name, certificate, ca) {
    let options = {
      "keepAlive": 300000,
      "useCreateIndex": true,
      "connectTimeoutMS": 30000,
      "reconnectTries": Number.MAX_VALUE, //Never stop trying to reconnect
      "reconnectInterval": 500, //Reconnect every 500ms
      "useNewUrlParser": true,
      "appname": app_name
    };

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

  connect(uri, options, db, debug) {

    this._mongoose.set("debug", debug);
    this._mongoose.connect(uri, options)
      .then(() => {
        console.log("Mongoose is Ready");
        this.listen(db);
      })
      .catch((error) => {
        throw new Error(error);
      });
  }

  get mongoose() {
    return this._mongoose;
  }

  get director() {
    return this._director;
  }

  listen(db) {
    db.on("error", (error) => {
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
module.exports = MongooseSetupService;