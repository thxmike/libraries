const RestClient = require("rest-client");

class BitBucketClient {

  constructor(
    username,
    password,
    uri = "https://ultigit.ultimatesoftware.com"
  ) {
    this._uri = uri;
    if (username && password) {
      this._username = username;
      this._password = password;
    }
    this._rest_client = new RestClient();
  }

  generate_token() {
    let token = null;

    if (this._username && this._password) {
      token = `Basic ${Buffer.from(`${this._username}:${this._password}`).toString("base64")}`;
    }
    return Promise.resolve(token);
  }

  set_header(token) {
    let headers = null;

    if (token) {
      headers = {
        "Authorization": token
      };
    }
    return headers;
  }

  get_projects(page = 1, per_page = 50) {

    let uri = BitBucketClient._setup_paging(`${this._uri}/rest/api/1.0/projects`, page, per_page);

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        uri,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  get_project(project_id) {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        `${this._uri}/rest/api/1.0/projects/${project_id}`,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  get_project_repos(project_id, page = 1, per_page = 50) {

    let uri = BitBucketClient._setup_paging(`${this._uri}/rest/api/1.0/projects/${project_id}/repos`, page, per_page);

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        uri,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  get_project_repo(project_id, repo_id) {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        `${this._uri}/rest/api/1.0/projects/${project_id}/repos/${repo_id}`,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  get_project_repo_branches(project_id, repo_id, page = 1, per_page = 50) {

    let uri = BitBucketClient._setup_paging(`${this._uri}/rest/api/1.0/projects/${project_id}/repos/${repo_id}/branches`, page, per_page);

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        uri,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      }).catch((error) => {
        return Promise.reject(error);
      });
    });
  }

  get_project_repo_branch(project_id, repo_id, branch_id) {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      return this._rest_client.get(
        `${this._uri}/rest/api/1.0/projects/${project_id}/repos/${repo_id}/branches?limit=1000`,
        headers
      ).then((response) => {
        let branches = JSON.parse(response.values);
        let brnch = null;

        branches.some((branch) => {
          if (branch.displayid === branch_id) {
            brnch = branch;
            return true;
          }
        });
        return Promise.resolve(brnch);
      });
    });
  }


  get_project_repo_branch_commits(project_id, repo_id, branch, page, per_page) {

    let uri = `${this._uri}/rest/api/1.0/projects/${project_id}/repos/${repo_id}/commits`;

    if (branch) {
      uri = `${this._uri}/rest/api/1.0/projects/${project_id}/repos/${repo_id}/commits?until=${branch}`;
    }
    let final_uri = BitBucketClient._setup_paging(uri, page, per_page);

    return this.generate_token().then((token) => {
      let headers = this.set_header(token);

      if (branch) {
        return this._rest_client.get(
          final_uri,
          headers
        ).then((response) => {
          return Promise.resolve(JSON.parse(response));
        });
      }
      return this._rest_client.get(
        final_uri,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });

    });
  }

  get_project_repo_commit(project_id, repo_id, branch, commit_id = "last") {
    return this.generate_token().then((token) => {
      let headers = this.set_header(token);
      let uri = `${this._uri}/rest/api/1.0/projects/${project_id}/repos/${repo_id}/commits/${commit_id}`;

      if (commit_id === "last") {
        uri = `${this._uri}/rest/api/1.0/projects/${project_id}/repos/${repo_id}/commits?start=0&limit=1`;
      }
      if (branch) {
        if (uri.includes("?")) {
          uri = `${uri}&until=${branch}`;
        } else {
          uri = `${uri}?until=${branch}`;
        }
      }
      return this._rest_client.get(
        uri,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }

  static _setup_paging(uri, page, per_page) {
    let limit = 50;

    if (per_page) {
      limit = per_page;
    }
    let page_uri = `${uri}?limit=${limit}`;

    if (page) {
      page_uri = `${page_uri}&start=${page}`;
    }
    return page_uri;
  }
}
module.exports = BitBucketClient;