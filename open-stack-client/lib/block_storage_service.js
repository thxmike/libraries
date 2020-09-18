
const RestClientService = require("rest-client");

class BlockStorageService {

  constructor(base_uri, headers) {
    this._uri = base_uri;
    this._rest_service = new RestClientService();
    this._headers = headers;
  }

  limits() {

    let uri_path = `${this._uri}/limits`;

    return this._rest_service.get(uri_path, this._headers);
  }

  os_quota_sets(project_id) {

    let uri_path = `${this._uri}/os-quota-sets/${project_id}?usage=True`;

    return this._rest_service.get(uri_path, this._headers);
  }

  os_hosts() {

    let uri_path = `${this._uri}/os-hosts`;

    return this._rest_service.get(uri_path, this._headers);
  }
}
module.exports = BlockStorageService;