
const RestClientService = require("rest-client");

class ComputeService {
  constructor(base_uri, headers) {
    this._uri = base_uri;
    this._rest_service = new RestClientService();
    this._headers = headers;
  }

  limits() {

    let uri_path = `${this._uri}/limits`;

    return this._rest_service.get(uri_path, this._headers);
  }

  os_simple_tenant_usage(tenant_id, start_date, end_date) {

    let uri_path = `${this._uri}/os-simple-tenant-usage/${tenant_id}?detailed=0&start=${start_date}&end=${end_date}`;

    return this._rest_service.get(uri_path, this._headers);
  }
}
module.exports = ComputeService;