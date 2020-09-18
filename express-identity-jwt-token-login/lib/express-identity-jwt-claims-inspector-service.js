const RestService = require("rest-client");

class ExpressIdentityJWTClaimsInspectorService {

  constructor(uri) {
    this._claims = [];
    if (uri) {
      this._user_profile_endpoint_uri = uri;
    }
    this._rest_client = new RestService();
  }

  get_user_profile_claims(token) {

    let _headers = {
      "Authorization": `Bearer ${token}`
    };

    return this._rest_client.get(this._user_profile_endpoint_uri, _headers);
  }

  get claims() {
    return this._claims;
  }

}
module.exports = ExpressIdentityJWTClaimsInspectorService;