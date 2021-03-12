const ExpressIdentityJWTTokenIntrospectionService = require("./express-identity-jwt-token-introspection-service");
const ExpressIdentityJWTTokenSigningService = require("./express-identity-jwt-token-signing-service");
const ExpressIdentityJWTClaimsService = require("./express-identity-jwt-claims-inspector-service");

class ExpressIdentityJWTTokenLoginService {
  constructor(openid_configuration_uri, jkws_oauth_keyset_uri, introspection_uri, user_info_endpoint_uri, client_id, client_secret) {

    this._token_cache = [];
    this._express_identity_token_introspection_service =
      new ExpressIdentityJWTTokenIntrospectionService(introspection_uri, client_id, client_secret);
    this._express_identity_token_signing_service =
      new ExpressIdentityJWTTokenSigningService(jkws_oauth_keyset_uri);
    this._express_identity_token_claims_service =
      new ExpressIdentityJWTClaimsService(user_info_endpoint_uri);
  }

  authenticate(req, res, next) {

    if (req.method === "OPTIONS") { //Pre-Flight from browser
      return next();
    }
    if (!ExpressIdentityJWTTokenLoginService.check_valid_authorization_header(req)) {

      this.send_error_message(res, "Missing - Not Authorized");
      return;
    }
    let token = ExpressIdentityJWTTokenLoginService.parse_credentials_token(req.headers.authorization);

    let found_cached_token = false;
    let epoch_date_now = Date.now();

    found_cached_token = this.check_token_cache(token, epoch_date_now);

    if (found_cached_token) {
      return this.end_identity_check(next);
    }

    this._express_identity_token_introspection_service.introspect_token(token)
      .then((result) => {

        let body = JSON.parse(result.body);

        if (!body.active) {
          return Promise.reject(new Error("Introspection - Unauthorized"));
        }
        return this._express_identity_token_signing_service.verify_token(token);
      })
      .then((result) => {

        result.type = "user";
        if (!result.username && !result.email) {
          result.type = "service";
          return Promise.resolve(result);
        }
        return this._express_identity_token_claims_service.get_user_profile_claims(token)
          .then((user_profile_claims) => {
            let up_claims = JSON.parse(user_profile_claims)
;            let claims = {...result, ...up_claims};
            return Promise.resolve(claims);
          });
      })
      .then((claims) => {
          
        let expire_time = claims.exp * 1000;
        //Service Account
        if (claims.type && claims.type === "service") {
          this.update_token_cache(token, expire_time);
          return this.end_identity_check(next);
        } //User

        let id = claims["Object GUID"];


        if (!id) {
          return Promise.reject(new Error("Claim - Unauthorized"));
        }
        this.update_token_cache(token, expire_time);
        return this.end_identity_check(next);
      })
      .catch((error) => {
        //let response_code = error.trim().substring(0,3);
        let message = error;

        if (error.message) {
          message = error.message;
        }
        this.send_error_message(res, message);

      });

  }

  check_token_cache(token, epoch_date_now) {
    let found = false;
    let local_cache = this._token_cache;
    let ind = -1;

    this._token_cache.some((cache_token, index) => {
      if (cache_token.id === token && cache_token.threshold > epoch_date_now) {
        found = true;
        return found;
      }
      if (cache_token.id === token && cache_token.threshold <= epoch_date_now) {
        ind = index;
      }
    });
    if (ind != -1) {
      this._token_cache = local_cache.splice(ind, 1);
    }
    return found;
  }

  update_token_cache(token, expire_time) {

    let found_cached_token = false;

    this._token_cache.some((cache_token) => {
      if (cache_token.id === token) {

        cache_token.threshold = expire_time;
        return found_cached_token;
      }
    });

    if (!found_cached_token) {
      let id = token;
      let threshold = expire_time;

      this._token_cache.push({ id,
        threshold });
    }
  }

  end_identity_check(next) {

    Promise.resolve();
    return next();
  }

  send_error_message(res, message) {
    res.status(401).json({
      "code": 401,
      message
    });
  }

  static check_valid_authorization_header(req) {
    let result = false;

    if (req.headers.authorization && req.headers.authorization.includes("Bearer ")) {
      result = true;
    }
    return result;
  }

  //Assumes Oauth 2.0 / JWT
  static parse_credentials_token(header) {
    let access_token = header.replace(/^Bearer/, "").trim();

    if (!access_token) {
      throw new Error("Invalid Token");
    }
    return access_token;
  }
}

module.exports = ExpressIdentityJWTTokenLoginService;