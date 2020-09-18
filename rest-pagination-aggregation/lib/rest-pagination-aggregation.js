const RestClient = require("rest-client");
const ParseLinkHeader = require("parse-link-header");
const Promise = require("bluebird");

module.exports = class RestPaginationAggregation {

  /*
   *takes in tokens that are used for pagination
   *defaults are page for the page index and per_page for the amount on a single page, count for total
   *set the value to your specific api, such as start, limit, index, link header
   */
  constructor(
    headers, page_token = "page",
    per_page_token = "per_page",
    count_token = "count", per_page = 50,
    parallelism = false, echo = false
  ) {
    this._page_token = page_token;
    this._per_page_token = per_page_token;
    this._count_token = count_token;
    this.rest_client = new RestClient();
    this._echo = echo;
    this._parallelism = parallelism;
    this._total_page_count = -1;
    this._page_data = [];
    this._per_page = per_page;
    this._headers = headers;
  }

  get_all_pages(uri, start_page = 1, headers = null) {

    if (headers) {
      this._headers = headers;
    }
    let url = new URL(uri);

    this._page_data = [];
    this._total_page_count = -1;

    if (url.searchParams.get(this._page_token) || url.searchParams.get(this._per_page_token)) {
      return Promise.reject("pagination parameters are not allowed in the URI");
    }

    let full_uri = this._get_full_uri(uri, start_page);

    return new Promise((resolve, reject) => {
      return this._get_page(full_uri).then((response) => { //first page
        let body = this._parse_page_body(response);

        if (this._determine_is_end(start_page, response, body)) {
          return resolve(this._page_data);
        }
        if (this._parallelism) {
          if (this._total_page_count) {
            return this._get_pages_in_parallel(full_uri, start_page + 1, resolve, reject);
          }
          console.log("The requested api data does not allow for parallelism. Starting serial process");
          return this._get_pages_serially(full_uri, start_page, resolve, reject);

        }
        return this._get_pages_serially(full_uri, start_page, resolve, reject);

      }).catch((err) => reject(err));
    });
  }

  _get_pages_serially(full_uri, page, resolve, reject) {
    let next_page = page + 1;

    full_uri = this._get_full_uri(full_uri, next_page);
    return this._get_page_serially(full_uri, next_page, resolve, reject);
  }

  _get_page_serially(uri, page_number, resolve, reject) {

    this._log(uri);

    return this.rest_client.get(uri, this._headers, true).then((response) => {

      let body = this._parse_page_body(response);

      this._page_data = this._page_data.concat(this._determine_body_data(body));

      if (this._determine_is_end(page_number, response, body)) {
        return resolve(this._page_data);
      }

      let next_uri = this._get_full_uri(uri, page_number + 1);

      return this._get_page_serially(next_uri, page_number + 1, resolve, reject);

    });
  }

  _get_pages_in_parallel(full_uri, page, resolve, reject) {

    let uris = [];

    for (;page <= this._total_page_count; page += 1) {
      let uri = this._get_full_uri(full_uri, page);

      uris.push(uri);
    }
    return Promise.map(uris, (uri) => {
      return this._get_page(uri);
    }, { "concurrency": 3 }).then(() => {
      return resolve(this._page_data);
    }).catch((err) => {
      //console.log(err);
      return reject(err);
    });
  }

  _log(uri) {
    if (this._echo) {
      console.log(`GET ${uri}`);
    }
  }

  _get_page(page_uri, get_headers = true) {

    this._log(page_uri);
    return this.rest_client.get(page_uri, this._headers, get_headers).then((response) => {

      let body = this._parse_page_body(response);

      this._page_data = this._page_data.concat(this._determine_body_data(body));

      if (this._total_page_count === -1) { //first page
        this._total_page_count = this._determine_total_page_count(response, body);
      }
      return Promise.resolve(response);
    });
  }

  _get_full_uri(uri, page_number) {

    let href = new URL(uri);

    href.searchParams.set(this._page_token, page_number);
    if (this._page_token === "startAt") {
      href.searchParams.set(this._page_token, page_number * this._per_page);
    }

    href.searchParams.set(this._per_page_token, this._per_page);

    let page_uri = href.toString();

    return page_uri;
  }

  _determine_is_end(page_number, response, body) {
    let result = false;

    //Jira Pagination (zero based)
    if (body.issues && body.total && page_number === this._total_page_count - 1) {
      result = true;
    }
    //Ultimate Software Standard Pagination (one based)
    if (page_number === this._total_page_count) {
      result = true;
    } else if (!this._total_page_count) {
      //Checking for Alternate Pagination
      if (body.isLastPage) {
        result = true;
      } else if (Array.isArray(body) && body.length === 0) {
        result = true;
      }
      //Checking Link Headers
    } else if (response && response.headers.link) {
      let parsed = ParseLinkHeader(response.headers.link);

      if (parsed && !parsed.next) {
        result = true;
      }
    }
    return result;
  }

  _determine_total_page_count(response, body) {
    let total_page_count = 0;

    if (this._count_token && response.headers[this._count_token]) {
      total_page_count = Math.ceil(response.headers[this._count_token] / response.headers[this._per_page_token]);
    } else if (this._count_token && body[this._count_token] && body[this._per_page_token]) {
      total_page_count = Math.ceil(body[this._count_token] / body[this._per_page_token]);
    } else if (this._count_token && body[this._count_token] && !body[this._per_page_token]) {
      total_page_count = Math.ceil(body[this._count_token] / 50);
    }

    return total_page_count;
  }

  _parse_page_body(response) {
    let data = response.body;

    if (typeof response.body === "string") {
      data = JSON.parse(response.body);
    }
    return data;
  }

  _determine_body_data(body) {
    let data = body;

    let return_data = [];

    if (Array.isArray(data)) {
      return_data = data;
    } else if (data.values) {
      return_data = data.values;
    } else if (data.data) {
      return_data = data.data;
    } else if (data.issues) { //Jira
      return_data = data.issues;
    }
    return return_data;
  }
};