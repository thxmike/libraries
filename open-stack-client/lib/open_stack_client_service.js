const RestClientService = require("rest-client");
const ComputeService = require("./compute_service");
const BlockStorageService = require("./block_storage_service");

class OpenStackClient {

  constructor(base_uri, port, version = "v3") {
    //private members
    this._uri = base_uri;
    this._project_id = 0;
    this._project_name = "";
    this._rest_service = new RestClientService();
    this._cinder_v2_service = null;
    this._cinder_service = null;
    this._nova_v3_service = null;
    this._available_services_list = [];
    this._consumable_services_list = [];

    if (port) {
      this._uri = `${base_uri}:${port}`;
    }
    this._uri = `${this._uri}/${version}`;
  }

  get available_services_list () {
    return this._available_services_list;
  }

  get consumable_services_list () {
    return this._consumable_services_list;
  }

  get project_id () {
    return this._project_id;
  }

  get project_name() {
    return this._project_name;
  }

  get tenant_id () {
    return this._project_id;
  }

  get tenant_name() {
    return this._project_name;
  }

  get nova_v3 () {
    return this._nova_v3_service;
  }

  get cinder_v2() {
    return this._cinder_v2_service;
  }

  get cinder() {
    return this._cinder_service;
  }

  authenticate(user, pw) {
    let path = `${this._uri}/auth/tokens`;

    let payload = {
      "auth": {
        "identity": {
          "methods": ["password"],
          "password": {
            "user": {
              "domain": {
                "name": "Default"

              },
              "name": user,
              "password": pw
            }
          }
        }
      }
    };

    return this._rest_service.post(path, payload, null, true)
      .then((response) => {
        if (!response) {
          return Promise.reject(response);
        }
        if (response.body.token.project.id) {
          this._project_id = response.body.token.project.id;
          this._project_name = response.body.token.project.name;
        }

        this._headers = { "X-Auth-Token": response.headers["x-subject-token"] };

        this.create_services(response.body.token.catalog);

        return Promise.resolve(this._headers);

      }).catch((err) => {
        return Promise.reject(err);
      });
  }

  create_services(catalog, region = null) {

    catalog.forEach((item) => {

      let service_list_item = {
        "name": item.name,
        "type": item.type,
        "urls": []
      };

      item.endpoints.forEach((endpoint) => {
        service_list_item.urls.push(endpoint.url);
      });

      this._available_services_list.push(service_list_item);

      if (item.name === "novav3") {

        this._nova_v3_service = new ComputeService(item.endpoints[0].url, this._headers);
        this._consumable_services_list.push(service_list_item);
      }
      if (item.name === "cinderv2") {

        this._cinder_v2_service = new BlockStorageService(item.endpoints[0].url, this._headers);
        this._consumable_services_list.push(service_list_item);
      }
      if (item.name === "cinder") {

        this._cinder_service = new BlockStorageService(item.endpoints[0].url, this._headers);
        this._consumable_services_list.push(service_list_item);
      }
    });

  }
}

module.exports = OpenStackClient;