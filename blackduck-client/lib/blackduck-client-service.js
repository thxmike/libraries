const RestClient = require("rest-client");

class BlackDuckClient {

  constructor(
    auth_token,
    uri = "https://bduck.us.corp"
  ) {
    this._auth_token = auth_token;
    this._uri = uri;
    this._rest_client = new RestClient();
    this._bearer_token = {};
  }

  _generate_token() {

    let now = Date.now();

    if (!this._bearer_token.token || this._bearer_token.expire_timestamp && this._bearer_token.expire_timestamp < now - 2000) {

      let headers = {
        "Authorization": `token ${this._auth_token}`
      };

      return this._rest_client.post(`${this._uri}/api/tokens/authenticate`, null, headers)
        .then((response) => {

          let resp = JSON.parse(response);

          this._bearer_token.token = resp.bearerToken;
          this._bearer_token.expire_timestamp = now + resp.expiresInMilliseconds;

          return this._set_header();
        });
    }

    return Promise.resolve({
      "Authorization": `Bearer ${this._bearer_token.token}`
    });
  }

  _set_header() {
    return {
      "Authorization": `Bearer ${this._bearer_token.token}`
    };
  }

  get_projects(page, per_page = 1000) {

    let uri = `${this._uri}/api/projects?limit=${per_page}`;

    if (page) {
      uri = `${uri}&offset=${page}`;
    }

    return this.get_base(uri);
  }

  get_project(project_id) {
    let uri = `${this._uri}/api/projects/${project_id}`;

    return this.get_base(uri);
  }

  delete_project(project_id) {
    let uri = `${this._uri}/api/projects/${project_id}`;

    return this._generate_token().then((headers) => {

      return this._rest_client.delete(
        uri,
        null,
        headers
      ).then((response) => {
        let res = response;

        if (response && typeof response === "string" && (response.includes("[") && response.includes("]") || response.includes("{") && response.includes("}"))) {
          res = JSON.parse(response);
        }
        return Promise.resolve(res);
      });
    });
  }

  get_project_versions(project_id, page, per_page = 1000) {

    let uri = `${this._uri}/api/projects/${project_id}/versions?limit=${per_page}`;

    if (page) {
      uri = `${uri}&offset=${page}`;
    }

    return this.get_base(uri);
  }

  get_project_version(project_id, version_id) {

    let uri = `${this._uri}/api/projects/${project_id}/versions/${version_id}`;

    return this.get_base(uri);
  }

  delete_project_version(project_id, version_id) {

    let uri = `${this._uri}/api/projects/${project_id}/versions/${version_id}`;

    return this._generate_token().then((headers) => {

      return this._rest_client.delete(
        uri,
        null,
        headers
      ).then((response) => {
        return Promise.resolve(response);
      });
    });
  }

  create_project_version(project_id, version) {
    let uri = `${this._uri}/api/projects/${project_id}/versions`;

    return this._generate_token().then((headers) => {

      let payload = {
        "phase": "RELEASED",
        "distribution": "EXTERNAL",
        "versionName": version
      };

      return this._rest_client.post(
        uri,
        payload,
        headers
      ).then((response) => {
        return Promise.resolve(response);
      });
    });
  }

  get_scans() {
    let uri = `${this._uri}/api/internal/codelocations?limit=1000`;

    return this.get_base(uri);
  }

  get_scan(scan_location_id) {
    let uri = `${this._uri}/api/v1/scanlocations/${scan_location_id}`;

    return this.get_base(uri);
  }

  delete_scan(scan_location_id) {
    let uri = `${this._uri}/api/codelocations/${scan_location_id}`;

    return this._generate_token().then((headers) => {

      return this._rest_client.delete(
        uri,
        null,
        headers
      ).then((response) => {
        return Promise.resolve(response);
      });
    });
  }

  get_project_version_scans(project_id, version_id) {

    let uri = `${this._uri}/api/projects/${project_id}/versions/${version_id}/codelocations`;

    return this.get_base(uri);
  }

  create_project_and_version(name, description, version) {
    let uri = `${this._uri}/api/projects`;

    return this._generate_token().then((headers) => {

      let payload = {
        name,
        description,
        "cloneCategories": [
          "COMPONENT_DATA",
          "VULN_DATA"
        ],
        "versionRequest": {
          "phase": "RELEASED",
          "distribution": "EXTERNAL",
          "versionName": version
        }
      };

      return this._rest_client.post(
        uri,
        payload,
        headers
      ).then((response) => {
        return Promise.resolve(response);
      });
    });
  }

  get_version_reports(version_id) {

    let uri = `${this._uri}/api/versions/${version_id}/reports`;

    return this.get_base(uri);
  }

  get_version_report(version_id, report_id) {

    let uri = `${this._uri}/api/versions/${version_id}/reports/${report_id}`;

    return this.get_base(uri);
  }

  delete_version_report(version_id, report_id) {
    let uri = `${this._uri}/api/versions/${version_id}/reports/${report_id}`;

    return this._generate_token().then((headers) => {

      return this._rest_client.delete(
        uri,
        null,
        headers
      ).then((response) => {
        return Promise.resolve(response);
      });
    });
  }

  create_project_version_scan_report(project_id, version_id) {
    let uri = `${this._uri}/api/versions/${version_id}/reports`;

    let payload = {
      "categories": [
        "VERSION",
        "CODE_LOCATIONS",
        "ATTACHMENTS",
        "COMPONENTS",
        "SECURITY",
        "FILES"
      ],
      "versionId": version_id,
      "reportType": "VERSION",
      "reportFormat": "JSON"
    };

    return this._generate_token().then((headers) => {

      return this._rest_client.post(
        uri,
        payload,
        headers
      ).then((response) => {
        return Promise.resolve(response);
      });
    });
  }

  get_scan_report_contents(report_id) {
    let uri = `${this._uri}/api/reports/${report_id}/contents`;

    return this.get_base(uri);
  }

  get_base(uri) {
    return this._generate_token().then((headers) => {
      return this._rest_client.get(
        uri,
        headers
      ).then((response) => {
        return Promise.resolve(JSON.parse(response));
      });
    });
  }
}
module.exports = BlackDuckClient;