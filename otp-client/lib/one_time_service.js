const RestClientService = require("rest-client");

class OneTimeClientService {

  constructor (base_uri, port) {
    this._uri = base_uri;
    if (port) {
      this._uri = `${this._uri}:${port}`;
    }
    this.rest_client_service = new RestClientService();
  }

  create_secret(text, passphrase = null, ttl = 300) {

    let path = `${this._uri}/api/v1/share`;

    let payload = `secret=${text}&ttl=${ttl}`;

    if (passphrase) {
      payload = `${payload}&passphrase=${passphrase}`;
    }

    return this.rest_client_service.post(path, payload);

  }

  generate_secret(passphrase = null, ttl = 3600) {

    let path = `${this._uri}/api/v1/generate`;

    let payload = `ttl=${ttl}`;

    if (passphrase) {
      payload = `${payload}&passphrase=${passphrase}`;
    }

    return this.rest_client_service.post(path, payload);
  }

  retrieve_secret(path, passphrase) {

    let uri = `${this._uri}/api/v1/secret/${path}`;

    let payload = "";

    if (passphrase) {
      payload = `passphrase=${passphrase}`;
    }

    return this.rest_client_service.post(uri, payload);
  }
}
module.exports = OneTimeClientService;