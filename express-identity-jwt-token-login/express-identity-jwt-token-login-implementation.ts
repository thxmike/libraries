import { RedisClientService } from '@thxmike/redis-client';

import { ExpressIdentityJWTClaimsInspectorService } from './express-identity-jwt-claims-inspector-service.js';
import { ExpressIdentityJWTTokenSigningService } from './express-identity-jwt-token-signing-service.js';

// Introspection is currently not supported by MS excluded for now
//import { ExpressIdentityJWTTokenIntrospectionService } from './express-identity-jwt-token-introspection-service.js';

export class ExpressIdentityJWTTokenLoginService {
  private _token_cache: any;
  // Introspection is currently not supported by MS excluded for now
  //private _express_identity_token_introspection_service: ExpressIdentityJWTTokenIntrospectionService;
  private _express_identity_token_signing_service: ExpressIdentityJWTTokenSigningService;
  private _express_identity_token_claims_service: ExpressIdentityJWTClaimsInspectorService;

  private _redis_client_service: RedisClientService | any = null;

  constructor(
    openid_configuration_uri: string,
    jkws_oauth_keyset_uri: string,
    introspection_uri: string = "",
    user_info_endpoint_uri: string,
    client_id: string,
    client_secret: string,
    redis_client: RedisClientService | any = null
  ) {
    this._token_cache = [];
    /*
    // Introspection is currently not supported by MS excluded for now
    this._express_identity_token_introspection_service = new ExpressIdentityJWTTokenIntrospectionService(
      introspection_uri,
      client_id,
      client_secret
    );
    */

    if(redis_client){
      this._redis_client_service = redis_client;
    }
    this._express_identity_token_signing_service = new ExpressIdentityJWTTokenSigningService(
      jkws_oauth_keyset_uri
    );
    this._express_identity_token_claims_service = new ExpressIdentityJWTClaimsInspectorService(
      user_info_endpoint_uri
    );
  }

  public async authenticate(req: any, res: any, next: any) {
    if (req.method === "OPTIONS") {
      //Pre-Flight from browser
      return next();
    }
    if (
      !ExpressIdentityJWTTokenLoginService.check_valid_authorization_header(req)
    ) {
      this.send_error_message(res, "Missing Token");
      return;
    }
    let token = "";
    try {
      token = ExpressIdentityJWTTokenLoginService.parse_credentials_token(
        req.headers.authorization
      );
    } catch (err) {
      this.send_error_message(res, err);
      return;
    }

    let found_cached_token = false;
    let epoch_date_now = Date.now();
    
    found_cached_token = await this.check_token_cache(token, epoch_date_now);

    if (found_cached_token) {
      return this.end_identity_check(next);
    }

    // MS Azure does not currently provide an introspection endpoint, removing for now till I can find a way to deal with this
    /*
    this._express_identity_token_introspection_service
      .introspect_token(token)
      .then((result: any) => {
        let body = JSON.parse(result.body);

        if (!body.active) {
          return Promise.reject(new Error("Introspection - Unauthorized"));
        }
        */
    try {
      return this._express_identity_token_signing_service
        .verify_token(token)
        .then((result: any) => {
          result.type = "user";
          if (!result.username && !result.email) {
            result.type = "service";
            return Promise.resolve(result);
          }
          return this._express_identity_token_claims_service
            .get_user_profile_claims(token)
            .then((user_profile_claims: any) => {
              let up_claims = JSON.parse(user_profile_claims);
              let claims = { ...result, ...up_claims };
              return Promise.resolve(claims);
            });
        })
        .then((claims: any) => {
          let expire_time = claims.exp * 1000;
          //Service Account
          if (claims.type && claims.type === "service") {
            return this.update_token_cache(token, expire_time).then(() =>{
              return this.end_identity_check(next);
            })
            
          } //User

          let id = claims["Object GUID"];

          if (!id) {
            return Promise.reject("Missing Claim");
          }
          return this.update_token_cache(token, expire_time).then(() => {
            return this.end_identity_check(next);
          })
        })
        .catch((error: any) => {
          //let response_code = error.trim().substring(0,3);
          let message = error;

          if (error.message) {
            message = error.message;
          }
          this.send_error_message(res, message);
        });
    } catch (e) {
      this.send_error_message(res, e.message);
      return;
    }
  }

  private async check_token_cache(token: string, epoch_date_now: number) {
    
    let found = false;
    let ind = -1;

    if(this._redis_client_service){
      let threshold = await this._redis_client_service.get(token);
      threshold = +threshold;
      if(threshold && (threshold > epoch_date_now)){
        found = true;
      }
      if(threshold && (threshold <= epoch_date_now)){
        found = false;
        await this._redis_client_service.delete(token);
      }
    }
    else {
      this._token_cache.some((cache_token: any, index: number) => {
        if (cache_token.id === token && cache_token.threshold > epoch_date_now) {
          found = true;
          return Promise.resolve(found);
        }
        if (cache_token.id === token && cache_token.threshold <= epoch_date_now) {
          ind = index;
        }
      });
      if (ind != -1) {
        this._token_cache.splice(ind, 1);
      }
    }
    return Promise.resolve(found);
    
  }

  private async update_token_cache(token: string, expire_time: number) {
    let found_cached_token = false;

    if (this._redis_client_service) {
      await this._redis_client_service.set(token, expire_time);
    }
    else {
        this._token_cache.some((cache_token: any, index: number) => {
            if (cache_token.id === token) {
                this._token_cache[index].threshold = expire_time;
                return Promise.resolve();
            }
        });
        if (!found_cached_token) {
          let id = token;
          let threshold = expire_time;
    
          this._token_cache.push({ id, threshold });
        }
    }
    return Promise.resolve();
  }

  private end_identity_check(next: any) {
    Promise.resolve();
    return next();
  }

  private send_error_message(res: any, message: string) {
    console.log(`Authentication Error: ${message}`);
    res.status(401).send(message);
  }

  private static check_valid_authorization_header(req: any) {
    let result = false;

    if (
      req.headers.authorization &&
      req.headers.authorization.includes("Bearer ")
    ) {
      result = true;
    }
    return result;
  }

  //Assumes Oauth 2.0 / JWT
  private static parse_credentials_token(header: any) {
    let access_token = header.replace(/^Bearer/, "").trim();

    if (!access_token) {
      throw new Error("Invalid Token");
    }
    return access_token;
  }
}
