/*eslint-disable no-ternary */
const Promise = require("bluebird");
const { MongoClient } = Promise.promisifyAll(require("mongodb"));

class MongoClientService {

  constructor(uri, database, username, password, tls_key, tls_cert) {

    this._uri = uri;
    if (username) {
      this._username = username;
    }
    if (database) {
      this._database = database;
    }
    if (password) {
      this._password = password;
    }
    if (tls_key) {
      this._tls_key = tls_key;
    }
    if (tls_cert) {
      this._tls_cert = tls_cert;
    }
  }

  get_aggregate(collection_name, filter, projection = { projection: { _id: 0 } }) {

    return MongoClient.connectAsync(this._uri, {
      "ssl": true,
      "sslKey": this._tls_key,
      "sslCert": this._tls_cert,
      "useNewUrlParser": true,
      "useUnifiedTopology": true,
      "authMechanism": "MONGODB-X509",
      "authSource": "$external"
    }).then((client) => {
      return new Promise((resolve, reject) => {
        client.db(this._database).collection(collection_name).find(filter, projection)
          .toArray((err, data) => {
            return err
              ? reject(err)
              : resolve(data);
          });
      });
    });
  }

}
module.exports = MongoClientService;