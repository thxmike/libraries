const request_library = require("request-ntlm-promise");

class RestNtmlClientService {

  constructor(username, password, domain) {

    this._request = request_library;
    this.set_options(username, password, domain);
  }

  set_options(username, password, domain) {
    this.options = {
      username,
      password,
      "ntlm_domain": domain
    };
  }

  get(uri, headers) {

    this.options.url = uri;
    this.options.headers = RestNtmlClientService.check_content_type(headers);

    return this._request.get(this.options);
  }

  static check_content_type(headers, type) {

    let _headers = headers;

    if (!_headers) {
      _headers = {};
    }

    if (!_headers["Content-Type"]) {
      if (type) {
        if (type === "object") {
          _headers["Content-Type"] = "application/json";
        } else if (type === "string") {
          _headers["Content-Type"] = "application/x-www-form-urlencoded";
        }
      }
    }

    return _headers;
  }
}
module.exports = RestNtmlClientService;