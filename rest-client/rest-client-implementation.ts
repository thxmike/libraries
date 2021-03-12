import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import * as uuid from 'uuid';

import { IRestClientService } from './irest-client-service';

export class RestClientService implements IRestClientService {
  private base_uri: string;
  private _source_id: string;
  private _options: any;
  private _request: any;

  public get source_id() {
    return this._source_id;
  }

  constructor(base_uri: string = "") {
    this.base_uri = "";
    if (base_uri) {
      this.base_uri = base_uri;
    }
    this._request = fetch;
    this._source_id = uuid.v4();
  }

  public get(uri: string, payload: any, headers: any): Promise<any> {
    return this.common_request(uri, payload, headers, "GET");
  }

  public post(uri: string, payload: any, headers: any): Promise<any> {
    return this.common_request(uri, payload, headers, "POST");
  }

  public put(uri: string, payload: any, headers: any): Promise<any> {
    return this.common_request(uri, payload, headers, "PUT");
  }

  //TODO
  public post_file(uri: string, file_content: any, headers: any) {}

  public delete(uri: string, payload: any, headers: any): Promise<any> {
    return this.common_request(uri, payload, headers, "DELETE");
  }

  public patch(uri: string, payload: any, headers: any): Promise<any> {
    return this.common_request(uri, payload, headers, "PATCH");
  }

  private common_request(
    uri: string,
    payload: any,
    headers: any,
    method: string
  ): Promise<any> {
    this._options = RestClientService.setup_options(headers, method, payload);
    return this._request(this.check_uri(uri), this._options)
      .then((response: any) => {
        this.check_response_status(response);

        return response.text();
      })
      .then((resp: any) => {
        let result = this.is_json(resp);
        if (result) {
          return Promise.resolve(result);
        } else {
          return Promise.resolve(resp);
        }
      });
  }

  private static setup_options(
    headers: any,
    method: string,
    payload: string = "",
    content_type: string = "application/json"
  ) {
    let _headers = headers;
    let options: any = { method };

    if (!_headers) {
      _headers = {};
    }

    if (!_headers["Content-Type"]) {
      _headers["Content-Type"] = content_type;
    }

    if (
      _headers["Content-Type"].toLowerCase() === "application/json" &&
      payload
    ) {
      options.body = JSON.stringify(payload);
    } else if (
      _headers["Content-Type"].toLowerCase() ===
        "application/x-www-form-urlencoded" &&
      payload
    ) {
      let params = new URLSearchParams();
      let payload_array = payload.split("&");
      payload_array.forEach((item) => {
        let item_split = item.split("=");
        params.append(item_split[0], item_split[1]);
      });
      options.body = params;
    }
    options.redirect = "follow";
    options.headers = _headers;
    return options;
  }

  private is_json(str: any) {
    let result = "";
    try {
      result = JSON.parse(str);
    } catch (e) {
      return false;
    }
    return result;
  }

  private check_response_status(res: any) {
    if (res.ok) {
      return res;
    } else {
      throw new Error(
        `The HTTP status of the reponse: ${res.status} (${res.statusText})`
      );
    }
  }

  private check_uri(uri: string) {
    if (!uri.includes("://") && this.base_uri) {
      return `${this.base_uri}${uri}`;
    }
    return uri;
  }
}
