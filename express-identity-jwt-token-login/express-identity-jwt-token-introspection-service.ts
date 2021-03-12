const RestService = require("rest-client");
const TypeConversionService = require("type-conversion");

/*
 *
 * https://tools.ietf.org/html/rfc7662
 *
 * If the token can expire, the authorization server MUST determine
 * whether or not the token has expired.
 * o  If the token can be issued before it is able to be used, the
 * authorization server MUST determine whether or not a token's valid
 * period has started yet.
 * o  If the token can be revoked after it was issued, the authorization
 * server MUST determine whether or not such a revocation has taken
 * place.
 * o  If the token has been signed, the authorization server MUST
 * validate the signature.
 * o  If the token can be used only at certain resource servers, the
 * authorization server MUST determine whether or not the token can
 * be used at the resource server making the introspection call.
 */

class ExpressIdentityJWTTokenIntrospectionService {
  constructor(introspection_uri, client_id, client_secret = null) {

    this._introspection_uri = introspection_uri; //https://corpfedtest.ultimatesoftware.com/as/introspect.oauth2
    this._client_id = client_id;
    //defaults to i - implicit, c - client credentials
    this._grant_type = "i";
    this._type_conversion_service = new TypeConversionService();
    this._rest_service = new RestService();

    if (client_secret) {
      this._client_secret = client_secret;
      let encoded_creds = TypeConversionService.encode_utf8_to_base64(`${client_id}:${client_secret}`);

      this._auth_token = `${encoded_creds}`;
      this._grant_type = "c";
    }
  }

  introspect_token(token) {

    const uri = `${this._introspection_uri}?token=${token}`;
    let local_promise = {};
    let headers = { "Content-Type": "application/x-www-form-urlencoded" };

    if (this._grant_type === "i") { //implicit
      local_promise = this._rest_service.post(uri, `client_id=${this._client_id}`, headers, true);
    } else { //client credential
      headers.Authorization = `Basic ${this._auth_token}`;
      local_promise = this._rest_service.post(uri, null, headers, true);
    }
    return local_promise;
  }

}

module.exports = ExpressIdentityJWTTokenIntrospectionService;