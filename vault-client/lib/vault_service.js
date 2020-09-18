const RestClientService = require("rest-client");

class VaultClientService {

  constructor (end_point, api_version = "/v1", app_id = null, user_id = null, certificate = null, key = null, ca = null) {
    this.rest_client_service = new RestClientService();
    this.base_uri = `${end_point}/${api_version}`;
    if (app_id) {
      this.app_id = app_id;
    }
    if (user_id) {
      this.user_id = user_id;
    }
    if (certificate) {
      this.certificate = certificate;
    }
    if (ca) {
      this.ca = ca;
    }
    if (key) {
      this.key = key;
    }
    this.token = null;
  }

  get authentication_header() {

    if (this.token) {
      return Promise.resolve({ "X-Vault-Token": this.token });

    }
    return this.retrieve_token().then((response) => {

      if (response.auth) {
        this.token = response.auth.client_token;
      } else if (response.body.auth) {
        this.token = response.body.auth.client_token;
      }
      return Promise.resolve({ "X-Vault-Token": this.token });
    });
  }

  retrieve_token() {

    if (this.certificate && this.ca && this.key) {
      return this.retrieve_token_via_certificate(this.certificate, this.key, this.ca);
    }
    //else by app_id and user_id
    return this.retrieve_token_via_appid_userid(this.app_id, this.user_id);

  }

  retrieve_token_via_certificate(cert, key, ca) {

    let agentOptions = { ca,
      cert,
      key
    };
    let auth_uri = `${this.base_uri}/auth/cert/login`;

    return this.rest_client_service.post(auth_uri, {}, {}, true, agentOptions);
  }

  retrieve_token_via_appid_userid(app_id, user_id) {
    let payload = {
      app_id,
      user_id
    };
    let auth_uri = `${this.base_uri}/auth/app-id/login`;

    return this.rest_client_service.post(auth_uri, payload);
  }

  revoke_token() {

    let auth_uri = `${this.base_uri}/auth/token/revoke-self`;

    return this.authentication_header.then((header) => {
      return this.rest_client_service.post(auth_uri, null, header, true);
    });
  }

  read(path, key) {

    let uri_path = `${this.base_uri}${path}/${key}`;

    return this.authentication_header.then((header) => {

      return this.rest_client_service.get(uri_path, header)
        .then((result) => {

          let results_json = JSON.parse(result);
          let value = results_json.data[key];
          let item = { };

          item[key] = value;

          return Promise.resolve(item);
        });
    });
  }

  delete(path, key) {

    let uri_path = `${this.base_uri}${path}/${key}`;

    return this.authentication_header.then((header) => {

      return this.rest_client_service.delete(uri_path, null, header);
    });
  }

  write(path, key, value) {

    let uri_path = `${this.base_uri}${path}/${key}`;

    return this.authentication_header.then((header) => {
      let payload = {};

      payload[key] = value;

      return this.rest_client_service.post(uri_path, payload, header);
    });
  }

  list(path) {

    let uri_path = `${this.base_uri}${path}/?list=true`;

    return this.authentication_header.then((header) => {

      return this.rest_client_service.get(uri_path, header)
        .then((results) => {

          let results_json = JSON.parse(results);
          let { keys } = results_json.data;
          let promises = [];

          keys.forEach((key) => {
            if (!VaultClientService.check_for_reserved_uri_characters(key)) {
              promises.push(this.read(path, key));
            }
          });
          return Promise.all(promises);
        })
        .then((results) => {
          let values = {};

          results.forEach((result) => {
            for (let property_name in result) {
              if (Object.prototype.hasOwnProperty.call(result, property_name)) {
                values[property_name] = result[property_name];
              }
            }
          });

          return Promise.resolve(values);

        });
    });
  }

  vault_list(path) {

    let uri_path = `${this.base_uri}${path}/?list=true`;

    return this.authentication_header.then((header) => {

      return this.rest_client_service.get(uri_path, header)
        .then((results) => {

          let results_json = JSON.parse(results);
          let { keys } = results_json.data;

          return Promise.resolve(keys);
        });
    });
  }

  static check_for_reserved_uri_characters(value) {

    let regex = /[ ;,\/?:@&=+$#]/g;

    return regex.test(value);

  }

}
module.exports = VaultClientService;