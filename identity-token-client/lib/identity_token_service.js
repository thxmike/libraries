const RestClientService = require("rest-client");
const StringOperationsClient = require("string-operations");

class Token_Service {
  constructor(uri) {
    this._rest_service = new RestClientService();
    this.uri = uri;
  }

  get token() {
    return this[this._token];
  }

  get_client_credentials_token(
    client_id, client_secret,
    scopes
  ) {

    return new Promise((resolve, reject) => {
      let client_credentials_raw_data =
          "grant_type=client_credentials";

      if (scopes) {
        client_credentials_raw_data =
          `${client_credentials_raw_data}&scope=${Token_Service.parse_scope(scopes)}`;
      }

      let token = StringOperationsClient.generate_basic_token(client_id, client_secret);

      let auth_header = `Basic ${token}`;

      let headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": auth_header
      };

      let body = client_credentials_raw_data;

      let resolver = (response) => {
        this.success(response, resolve);
      };

      let catcher = (err) => {
        this.failure(err, reject);
      };

      return this._rest_service
        .post(this.uri, body, headers, true)
        .then(resolver)
        .catch(catcher);
    });
  }

  get_password_token(
    user_name, password,
    client_id, client_secret,
    scopes
  ) {

    return new Promise((resolve, reject) => {
      let password_raw_data = `grant_type=password&username=${user_name}&password=${password}`;

      if (scopes) {
        password_raw_data =
          `${password_raw_data}&scope=${Token_Service.parse_scope(scopes)}`;
      }
      if (client_id && client_secret) {
        password_raw_data = `${password_raw_data}
        &client_id=${client_id}
        &client_secret=${client_secret}`;
      }
      let headers = {
        "content-type": "application/x-www-form-urlencoded"
      };
      let body = password_raw_data;

      let resolver = (response) => {
        this.success(response, resolve);
      };

      let catcher = (err) => {
        this.failure(err, reject);
      };

      return this._rest_service
        .post(this.uri, body, headers, true)
        .then(resolver)
        .catch(catcher);
    });
  }

  static parse_scope(scope) {
    let scope_value = scope;

    if (Array.isArray(scope)) {
      scope_value = scope.join(" ");
    }
    return scope_value;
  }

  success(response, resolve) {
    let json_body = JSON.parse(response.body);

    this._token = { "Authorization": `Bearer ${json_body.access_token}` };
    resolve(this._token);
  }

  failure(err, reject) {
    reject(err);
  }

}
module.exports = Token_Service;