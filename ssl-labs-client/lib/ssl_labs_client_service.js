const RestClientService = require("rest-client");
const TimerService = require("timer");

class SslLabsClientService {

  constructor(base_url = "https://api.ssllabs.com/api/v3/") {
    this._base_url = base_url;
    this._rest_service = new RestClientService();
    this._timer_service = new TimerService();
  }

  info() {

    let uri = `${this._base_url}info`;

    return this._rest_service.get(uri);
  }

  analyze(host_name, publish = "off", start_new = "on", from_cache = "off", max_age = 24, all = "done", ignore_mismatch = "on") {

    let uri = `${this._base_url}analyze?host=${host_name}&publish=${publish}&startNew=${start_new}&fromCache=${from_cache}&maxAge=${max_age}&all=${all}&ignoreMismatch=${ignore_mismatch}`;

    return this._rest_service.get(uri);
  }

  get_endpoint_detail (host_name, ip_address) {

    let uri = `${this._base_url}getEndpointData?host=${host_name}&s=${ip_address}`;

    return this._rest_service.get(uri);
  }
}

module.exports = SslLabsClientService;