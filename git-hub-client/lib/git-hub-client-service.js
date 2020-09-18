const RestClient = require("rest-client");
const StringOperations = require("string-operations");
const parse = require("parse-link-header");

//Paging Based on https://developer.github.com/v3/#pagination

class GitHubClient {

  constructor(
    username,
    access_token,
    uri = "https://api.github.com"
  ) {
    this._uri = uri;
    if (username && access_token) {
      this._username = username;
      this._access_token = access_token;
    }
    this._rest_client = new RestClient();
  }

  generate_token() {
    let token = null;

    token = StringOperations.generate_basic_token(this._username, this._access_token);
    return Promise.resolve(token);
  }

  set_header(token) {
    let headers = {};

    if (token) {
      headers = {
        "Authorization": `Basic ${token}`
      };
    }
    headers.Accept = "application/vnd.github.v3+json";
    headers["User-Agent"] = "github-rest-client";
    return headers;
  }

  get_orgs(page = 1, per_page = 30) {

    let uri = GitHubClient._setup_paging(`${this._uri}/user/orgs`, page, per_page);

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        uri,
        headers,
        true
      ).then((response) => {
        //let resp = GitHubClient._parse_aggregate_response(response);
        if (response.body && typeof response.body === "string") {
          response.body = JSON.parse(response.body);
        }
        return Promise.resolve(response);
      });
    });
  }

  get_org(org_id) {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        `${this._uri}/orgs/${org_id}`,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  get_org_repos(org_id, page = 1, per_page = 30) { //Always 30

    let uri = GitHubClient._setup_paging(`${this._uri}/orgs/${org_id}/repos`, page, per_page);

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        uri,
        headers,
        true
      ).then((response) => {
        //let resp = GitHubClient._parse_aggregate_response(response, org_id);
        if (response.body && typeof response.body === "string") {
          response.body = JSON.parse(response.body);
        }

        return Promise.resolve(response);
      });
    });
  }

  get_org_repo(org_id, repo_id) {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        `${this._uri}/repos/${org_id}/${repo_id}`,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  get_org_repo_branches(org_id, repo_id, page = 1, per_page = 30) {

    let uri = GitHubClient._setup_paging(`${this._uri}/repos/${org_id}/${repo_id}/branches`, page, per_page);

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        uri,
        headers,
        true
      ).then((response) => {
        //let resp = GitHubClient._parse_aggregate_response(response, org_id, repo_id);
        if (response.body && typeof response.body === "string") {
          response.body = JSON.parse(response.body);
        }
        return Promise.resolve(response);
      }).catch(() => {
        let obj = {};

        obj.values = [];
        return Promise.resolve(obj);
      });
    });
  }

  get_org_repo_branch(org_id, repo_id, branch_id) {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        `${this._uri}/repos/${org_id}/${repo_id}/branches/${branch_id}`,
        headers
      ).then((response) => {
        let resp = GitHubClient._parse_aggregate_response(response);

        return Promise.resolve(resp);
      });
    });
  }

  get_org_repo_branch_commits(org_id, repo_id, branch, page = 1, per_page = 30) {

    let uri = GitHubClient._setup_paging(`${this._uri}/repos/${org_id}/${repo_id}/commits`, page, per_page);

    if (branch) {
      uri = `${this._uri}/repos/${org_id}/${repo_id}/commits/${branch}`;
    }

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);


      return this._rest_client.get(
        uri,
        headers,
        true
      ).then((response) => {
        //let resp = GitHubClient._parse_aggregate_response(response);
        if (response.body && typeof response.body === "string") {
          response.body = JSON.parse(response.body);
        }
        return Promise.resolve(response);
      });
    });
  }

  get_org_repo_commit(org_id, repo_id, commit_id = "last") {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);
      let uri = `${this._uri}/repos/${org_id}/${repo_id}/commits/${commit_id}`;

      if (commit_id === "last") {
        uri = `${this._uri}/rest/api/1.0/projects/${org_id}/repos/${repo_id}/commits?per_page=1`;
      }
      return this._rest_client.get(
        uri,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  static _parse_aggregate_response(data, org_id, repo_id) {
    let links = [];
    let my_data = "";
    let org = org_id;
    let rep = repo_id;

    if (data.headers.link) {
      let parsed = parse(data.headers.link);

      for (let obj_name in parsed) {
        if (Object.prototype.hasOwnProperty.call(parsed, obj_name)) {
          links.push({
            "rel": parsed[obj_name].rel,
            "method": "GET",
            "href": GitHubClient._update_url(parsed[obj_name].url, org, rep)
          });
        }
      }
    }
    if (data.body) {
      my_data = JSON.parse(data.body);
    }

    let resp = { links,
      "data": my_data };

    return resp;
  }

  static _update_url(url, org_id, repo_id) {
    let data = url.replace("https://api.github.com", "")
      .replace(/\/organizations\/[A-Za-z0-9\-\.]+/g, `/api/v1/orgs/${org_id}`)
      .replace("/repositories", `/api/v1/orgs/${org_id}/repos`)
      .replace(/\/repos\/[A-Za-z0-9\-\.]+/g, `/repos/${repo_id}`);

    return data;
  }

  static _setup_paging(uri, page = 1, per_page = 30) {

    if (per_page > 100) {
      per_page = 30;
    }
    let page_uri = uri;

    if (page_uri.includes("?")) {
      page_uri = `${page_uri}&page=${page}&per_page=${per_page}`;
    } else {
      page_uri = `${page_uri}?page=${page}&per_page=${per_page}`;
    }

    return page_uri;
  }
}
module.exports = GitHubClient;