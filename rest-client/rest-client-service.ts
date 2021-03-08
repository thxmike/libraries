const ErrorResponseService = require("error-response");
const request_library = require("request");
const querystring = require("querystring");
const uuid = require("uuid");
const string_operations = require("string-operations");

class RestClientService {

  constructor(base_uri = null) {

    this.base_uri = null;
    if (base_uri) {
      this.base_uri = base_uri;
    }
    this._request = request_library;
    this._source_id = uuid.v4();
  }

  get(uri, headers, include_metadata = false) {

    let _uri = this.check_uri(uri);

    let _headers = RestClientService.check_content_type(headers);

    return new Promise((resolve, reject) => {

      let options = this.setup_options({
        "url": _uri,
        "followAllRedirects": true,
        "headers": _headers
      });

      let check = (err, response, body) => {
        return this.check_results(err, response, body, resolve, reject, include_metadata);
      };

      return this._request.get(options, check);
    });
  }

  post(uri, payload, headers, include_metadata = false, agentOptions = {}) {

    let _uri = this.check_uri(uri);
    let type = typeof payload;
    let _headers = RestClientService.check_content_type(headers, type);

    return new Promise((resolve, reject) => {

      let options = this.setup_options({
        "url": _uri,
        "followAllRedirects": true,
        "headers": _headers
      });

      if (agentOptions !== {}) {
        options.agentOptions = agentOptions;
      }

      if (payload) {
        if (type === "object" && _headers["Content-Type"].includes("application/json")) {
          options.json = payload;
        } else if (type === "object" && _headers["Content-Type"].includes("application/x-www-form-urlencoded")) {
          options.body = querystring.stringify(payload);
          _headers["Content-Length"] = options.body.length;
        } else {
          let form_data = {};

          payload.split("&").forEach((key_value_pair) => {
            let key = null;
            let value = null;

            [
              key,
              value
            ] = key_value_pair.split("=");

            form_data[key] = value;
          });
          options.form = form_data;
        }
      }

      let check = (err, response, body) => {
        return this.check_results(err, response, body, resolve, reject, include_metadata);
      };

      return this._request.post(options, check);
    });
  }

  put(uri, payload, headers, include_metadata = false) {

    let _uri = this.check_uri(uri);
    let _headers = RestClientService.check_content_type(headers);

    return new Promise((resolve, reject) => {

      let options = this.setup_options({
        "url": _uri,
        "headers": _headers,
        "followAllRedirects": true,
        "json": payload
      });

      let check = (err, response, body) => {
        return this.check_results(err, response, body, resolve, reject, include_metadata);
      };

      return this._request.put(options, check);
    });
  }

  post_file(uri, file_content, headers) {

    let _uri = this.check_uri(uri);

    return new Promise((resolve, reject) => {

      let options = this.setup_options({
        "url": _uri,
        headers,
        "followAllRedirects": true,
        "body": file_content
      });

      let check = (err, response, body) => {
        return this.check_results(err, response, body, resolve, reject);
      };

      return this._request.post(options, check);
    });
  }

  delete(uri, payload, headers, include_metadata = false) {

    let _uri = this.check_uri(uri);

    let update_headers = RestClientService.check_content_type(headers);

    return new Promise((resolve, reject) => {

      let options = this.setup_options({
        "url": _uri,
        "followAllRedirects": true,
        "headers": update_headers
      });

      if (payload) {
        options.json = payload;
      }

      let check = (err, response, body) => {
        return this.check_results(err, response, body, resolve, reject, include_metadata);
      };

      return this._request.delete(options, check);
    });
  }

  patch(uri, payload, headers, include_metadata = false) {

    let _uri = this.check_uri(uri);

    let update_headers = RestClientService.check_content_type(headers);

    return new Promise((resolve, reject) => {

      let options = this.setup_options({
        "url": _uri,
        "followAllRedirects": true,
        "headers": update_headers
      });

      if (payload) {
        options.json = payload;
      }

      let check = (err, response, body) => {
        return this.check_results(err, response, body, resolve, reject, include_metadata);
      };

      return this._request.patch(options, check);
    });
  }

  setup_options(options) {
    return Object.assign({}, options);
  }

  check_results(err, response, body, resolve, reject, include_metadata) {

    let is_in_error = ErrorResponseService.is_in_error_state(err, response, body);

    if (is_in_error) {
      
      let message = {};
      let parsed_body = {};
      if(body) {
        if(typeof body === 'object'){
          parsed_body = JSON.parse(JSON.stringify(body));
        } else if (string_operations.is_json(body)) {
          parsed_body = JSON.parse(body);
        } else {
          parsed_body =  { "message" : body }
        }
        if(!parsed_body._source_id) {
          message._source_id = this._source_id;
        }
        else {
          message._source_id = parsed_body._source_id
        }
      } else {
        message._source_id = this._source_id;
      }
      if(message._source_id !== this._source_id && body){
        message = {...message, ...parsed_body};
      } else {
        message = {...message, ...ErrorResponseService.extract_error_messages(err, response, body)};
      }
      
      return reject(message);

    } else {
      let return_value = {};

      return_value.body = body;
      return_value.headers = response.headers;
      return_value.statusCode = response.statusCode;
      if (include_metadata) {
        return resolve(return_value);
      }
      return resolve(body);
    }
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

  check_uri(uri) {
    if (!uri.includes("://") && this.base_uri) {
      return `${this.base_uri}${uri}`;
    }
    return uri;
  }
}

module.exports = RestClientService;