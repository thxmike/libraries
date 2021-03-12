import { RestClientService } from '@thxmike/rest-client';
import { TypeConversionService } from '@thxmike/type-conversion';
import jwt, { Algorithm } from 'jsonwebtoken';

/*
 *
 * Has a valid
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

export class ExpressIdentityJWTTokenSigningService {

  private _jkws_oauth_keyset_uri: string;
  private _rest_service : RestClientService;
  private _type_conversion_service: TypeConversionService;
  private _public_keyset: any;
  private _public_key: any;

  constructor(jkws_oauth_keyset_uri: string) {
    this._jkws_oauth_keyset_uri = jkws_oauth_keyset_uri;
    this._rest_service = new RestClientService();
    this._type_conversion_service = new TypeConversionService();
    this._public_keyset = null;
  }

  public verify_token(token: string) {

    let decoded_token = ExpressIdentityJWTTokenSigningService.decoded_token(token);
    let id = ExpressIdentityJWTTokenSigningService.get_key_id(decoded_token);
    let algorithm = ExpressIdentityJWTTokenSigningService.get_key_alg(decoded_token);

    let promise = Promise.resolve();

    if (!this._public_keyset) {
      promise = this.retrieve_jwks_data().then((keyset: any) => {
        this._public_keyset = keyset;
        this.set_public_key(id);
        return Promise.resolve();
      });
    }

    return promise.then(() => {
      return this.verify_token_signature(token, algorithm);
    }).then((decoded_data) => {
      return Promise.resolve(decoded_data);
    }).catch((error) => {
      return Promise.reject({
        "code": 401,
        "message": error.message
      });
    });
  }

  private retrieve_jwks_data() {
    return this._rest_service.get(this._jkws_oauth_keyset_uri, '', '')
      .then((result: any) => {
        let public_keyset = JSON.parse(result);

        return Promise.resolve(public_keyset);
      });
  }

  private static decoded_token(token: string) {
    return jwt.decode(token, { "complete": true });
  }

  private static get_key_id(decoded_token: any) {
    return decoded_token.header.kid;
  }

  private static get_key_alg(decoded_token: any) {
    return decoded_token.header.alg;
  }

  private set_public_key(id: any) {
    this._public_keyset.keys.forEach((public_key_item: any) => {
      if (id === public_key_item.kid) {
        //this._public_key = TypeConversionService.decode_base64_to_utf8(public_key_item.x5c[0]);
        this._public_key = `-----BEGIN CERTIFICATE-----\n${public_key_item.x5c[0]}\n-----END CERTIFICATE-----`;
      }
    });
  }

  //verify signature and decode token
  private verify_token_signature(token: string, alg: Algorithm = "RS256") {

    let list_algorithms: Array<Algorithm> = []
    list_algorithms.push(alg);

    return new Promise((resolve, reject) => {
      jwt.verify(token.trim(), this._public_key, { algorithms: list_algorithms }, (err: any, decoded: any) => {
        if (err) {
          return reject(err);
        }
        resolve(decoded);
      });
    });
  }
}