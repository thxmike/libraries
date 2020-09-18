const RestClientService = require("rest-client");
const Promise = require("bluebird");
const convertXMLtoJSON = Promise.promisify(require("xml2js").parseString);

class CheckMarxService {
  constructor(uri, username, pw) {
    this.rest_client = new RestClientService();
    this.uri = uri;
    this.username = username;
    this.pw = pw;
    this._token = null;
    this._token_expiration = new Date();
  }

  set_authorization_header() {
    let auth_uri = `${this.uri}/auth/identity/connect/token`;
    let payload = {
      "username": this.username,
      "password": this.pw,
      "grant_type": "password",
      "scope": "sast_rest_api",
      "client_id": "resource_owner_client",
      "client_secret": "014DF517-39D1-4453-B7B3-9930C563627C"
    };
    let diff = (new Date() - this._token_expiration) / 60000;

    let header = {
      "Content-Type": "application/x-www-form-urlencoded"
    };

    if (!this.header || diff >= 120) {
      return this.rest_client
        .post(auth_uri, payload, header)
        .then((response) => {
          let token = JSON.parse(response).access_token;

          this.header = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          };
        });
    }
    return Promise.resolve();
  }

  get_projects() {
    let uri = `${this.uri}/projects`;

    return this.get_base(uri, this.header);
  }

  get_project(id) {
    let uri = `${this.uri}/projects/${id}`;

    return this.get_base(uri, this.header);
  }

  create_project(name) {
    let uri = `${this.uri}/projects`;

    let payload = {
      name,
      "owningTeam": "00000000-1111-1111-b111-989c9070eb11",
      "isPublic": false
    };

    return this.set_authorization_header().then(() => {
      this.header["Content-Type"] = "application/json;v2.0";
      return this.rest_client.post(uri, payload, this.header);
    });
  }

  delete_project(id) {
    let uri = `${this.uri}/projects/${id}`;

    return this.set_authorization_header().then(() => {
      return this.rest_client.delete(uri, null, this.header);
    });
  }

  get_project_source(project_id) {
    return this.get_project(project_id).then((project) => {
      let source_link = project.links.find((link) => link.rel === "source");

      let uri = `${this.uri}/projects/${project_id}/sourceCode/remoteSettings/${source_link.type}`;

      return this.get_base(uri, this.header);
    });
  }

  create_project_source(project_id, type, uri, branch = "ref/heads/master", paths = null, user_name = null, password = null) {

    let payload = this.determine_payload(type, uri, paths, branch, user_name, password);

    let source_url = `${this.uri}/projects/${project_id}/sourceCode/remoteSettings/${type}`;

    return this.set_authorization_header().then(() => {
      this.header["Content-Type"] = "application/json;v1.0";
      return this.rest_client.post(source_url, payload, this.header);
    });
  }

  determine_payload(type, uri, paths, branch, user_name, password) {
    let payload = {};

    if (type === "git") {
      payload = this.get_git_payload(uri, branch);
    } else if (type === "tfs") {
      payload = this.get_tfs_payload(uri, paths, user_name, password);
    } else if (type === "svn") {
      payload = this.get_svn_payload(uri, paths, user_name, password);
    } else if (type === "shared") {
      payload = this.get_shared_drive_payload(uri, user_name, password);
    } else {
      throw new Error("Unsupported Source Type");
    }
    return payload;
  }

  get_git_payload(url, branch, user_name, password) {
    if (user_name && password) {
      let parts = url.split("//");

      uri = `${parts[0]}//${user_name}:${password}@${parts[1]}`;
    }

    return {
      url,
      branch
    };
  }

  get_tfs_payload(url, path, user_name, password) {
    return {
      "credentials": {
        "userName": user_name,
        password
      },
      "uri": {
        "absoluteUrl": url,
        "port": 8080
      },
      "paths": [path.split()]
    };
  }

  get_svn_payload(url, paths, user_name, password) {
    return {
      "uri": {
        "absoluteUrl": url,
        "port": 8080
      },
      "paths": [paths.split()],
      "credentials": {
        "userName": user_name,
        password
      }
    };
  }

  get_shared_drive_payload(path, user_name, password) {
    return {
      "paths": [paths.split("|")],
      "credentials": {
        "userName": user_name,
        password
      }
    };
  }

  get_project_scans(project_id) {
    let uri = `${this.uri}/sast/scans?projectId=${project_id}`;

    return this.get_base(uri, this.header);
  }

  get_project_last_scan(project_id, last_number) {
    let uri = `${this.uri}/sast/scans?projectId=${project_id}&last=${last_number}`;

    return this.get_base(uri, this.header);
  }

  get_project_scan(scan_id) {
    let uri = `${this.uri}/sast/scans/${scan_id}`;

    return this.get_base(uri, this.header);
  }

  create_project_scan(project_id, is_incremental, comment) {
    let uri = `${this.uri}/sast/scans`;

    let payload = {
      "projectId": project_id,
      "isIncremental": is_incremental,
      "isPublic": false,
      "forceScan": false,
      comment
    };

    return this.set_authorization_header().then(() => {
      this.header["Content-Type"] = "application/json;v1.0";
      return this.rest_client.post(uri, payload, this.header);
    });
  }

  delete_project_scan(scan_id) {

    let uri = `${this.uri}/sast/scans/${scan_id}`;

    return this.set_authorization_header().then(() => {
      return this.rest_client.delete(uri, null, this.header);
    });
  }

  get_project_scan_status(scan_id) {
    let uri = `${this.uri}/sast/scansQueue/${scan_id}`;

    return this.set_authorization_header().then(() => {
      return this.get_base(uri);
    });
  }

  update_project_scan_settings(project_id, preset_id = 100003, engine_configuration_id = 1) {
    let uri = `${this.uri}/sast/scanSettings`;

    let payload = {
      "projectId": project_id,
      "presetId": preset_id,
      "engineConfigurationId": engine_configuration_id
    };

    return this.set_authorization_header().then(() => {
      return this.rest_client.post(uri, payload, this.header);
    });
  }

  cancel_project_scan_status(scan_id) {

    let uri = `${this.uri}/sast/scansQueue/${scan_id}`;

    let payload = {
      "status": "Canceled"
    };

    return this.set_authorization_header().then(() => {
      return this.rest_client.patch(uri, payload, this.header);
    });
  }

  get_scan_results_statistics(scan_id) {
    let uri = `${this.uri}/sast/scans/${scan_id}/resultsStatistics`;

    return this.get_base(uri, this.header);
  }

  start_scan_report(scan_id) {
    let uri = `${this.uri}/reports/sastScan`;

    let payload = JSON.parse(JSON.stringify({
      "reportType": "XML",
      "scanId": scan_id
    }));

    return this.set_authorization_header().then(() => {
      this.header["Content-Type"] = "application/json";
      return this.rest_client.post(uri, payload, this.header);
    });
  }

  get_scan_report(report_id) {
    let uri = `${this.uri}/reports/sastScan/${report_id}`;

    return this.set_authorization_header()
      .then(() => {
        return this.rest_client.get(uri, this.header);
      })
      .then((xml) => {
        return convertXMLtoJSON(xml);
      });
  }

  get_scan_report_status(report_id) {
    let uri = `${this.uri}/reports/sastScan/${report_id}/status`;

    return this.get_base(uri, this.header);
  }

  get_base(uri) {
    return this.set_authorization_header()
      .then(() => {
        return this.rest_client.get(uri, this.header);
      })
      .then((res) => {
        return Promise.resolve(JSON.parse(res));
      });
  }
}

module.exports = CheckMarxService;