const RestClientService = require("rest-client");

class InfoBloxClientService {

  constructor(server, user_name, pw, version = 'v2.3.1') {
    console.debug("ctor");
    if (server) {
      this._server = server;
      this._base_uri = `https://${this._server}/wapi/${version}`
    }
    if (user_name) {
      this._user_name = user_name;
    }
    if (pw) {
      this._pw = pw;
    }
    this._credential = Buffer.from(`${this._user_name}:${this._pw}`).toString("base64");
    this._rest_client_service = new RestClientService();
  }

  set server(value) {
    this._server = value;
  }

  set user_name(value) {
    this._user_name = value;
  }

  set password(value) {
    this._pw = value;
  }

  get header(){
      return {
          "Authorization": `Basic ${this._credential}`,
          "Content-Type": "application/json"
      }
  }
  
  get_dns_zones() {
      const uri = `${this._base_uri}/zone_auth?_return_as_object=1&_return_fields=fqdn`
      return this._rest_client_service.get(uri, this.header);
  }

  get_host_by_name(name){
    const uri = `${this._base_uri}/record:host?name~=${name}`
    return this._rest_client_service.get(uri, this.header);
  }

  get_host_by_ip(ip_address){
    const uri = `${this._base_uri}/record:host?name~=${ip_address}`
    return this._rest_client_service.get(uri, this.header);
  }

  get_hosts_records(){
    const uri = `${this._base_uri}/record:a?_return_fields=name,ipv4addr&_max_results=100000`
    return this._rest_client_service.get(uri, this.header);
  }

  get_alias_records(){
    const uri = `${this._base_uri}/record:cname?_return_fields=name,canonical`
    return this._rest_client_service.get(uri, this.header);
  }
}
module.exports = InfoBloxClientService;