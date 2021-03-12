import { RestClientService } from '@thxmike/rest-client';

export class ExpressIdentityJWTClaimsInspectorService {
  private _claims: any;
  private _user_profile_endpoint_uri: string = "";
  private _rest_client: RestClientService;

  constructor(uri: string) {
    this._claims = [];
    if (uri) {
      this._user_profile_endpoint_uri = uri;
    }
    this._rest_client = new RestClientService();
  }

  get_user_profile_claims(token: string) {
    let _headers = {
      Authorization: `Bearer ${token}`,
    };

    return this._rest_client.get(this._user_profile_endpoint_uri, null, _headers);
  }

  get claims() {
    return this._claims;
  }
}
