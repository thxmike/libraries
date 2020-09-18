let Promise = require("bluebird");
let JiraClient = require("jira-connector");
let os = require("os");
let FileSystem = require("file-system");
let StringOperations = require("string-operations");
let PagingService = require("rest-pagination-aggregation");

class JiraClientService {
  constructor(uri, user_name, pw, token_type = "basic") {
    this.configuration = {
      host: uri,
    };

    this.configure_authentication(user_name, pw, token_type);

    this._uri = `https://${uri}/rest/api/2`;
    this.jira = new JiraClient(this.configuration);
    this.token = StringOperations.generate_basic_token(user_name, pw);

    //Needed for search
    let headers = {
      Authorization: `Basic ${this.token}`,
    };

    this.paging_service = new PagingService(
      headers,
      "startAt",
      "maxResults",
      "total",
      50,
      true,
      false
    );

    this._temp_dir = os.tmpdir();
    this._file_system = new FileSystem();
  }

  get_issue(id) {
    let issue = Promise.promisifyAll(this.jira.issue);

    return issue
      .getIssueAsync({
        issueId: id,
      })
      .then((iss) => {
        return Promise.resolve(iss);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  add_issue_attachment(id, filename, data) {
    let issue = Promise.promisifyAll(this.jira.issue);

    let file_path = `${this._temp_dir}/${filename}`;

    return this._file_system
      .write_file(file_path, JSON.stringify(data))
      .then(() => {
        return issue
          .addAttachmentAsync({
            issueId: id,
            filename: file_path,
          })
          .then((iss) => {
            return Promise.resolve(iss);
          })
          .catch((error) => {
            return Promise.reject(error);
          });
      });
  }

  get_issue_by_project_issue_type(project_id, issue_type_id, id) {
    let jql = `project="${project_id}" AND issuetype="${issue_type_id}" AND issue="${id}"`;
    let options = {};

    options.jql = jql;
    let searchClient = Promise.promisifyAll(this.jira.search);

    return searchClient
      .searchAsync(options)
      .then((issue) => {
        return Promise.resolve(issue);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  get_issues(project_id, issue_type_id, page = 0, page_size = 50) {
    let jql = `project="${project_id}" and issuetype="${issue_type_id}"`;

    return this.search(jql, page, page_size);
  }

  search(jql, page, page_size, fields) {
    let options = {};

    options.jql = jql;
    options.maxResults = page_size;
    options.startAt = page;
    if (fields) {
      options.fields = fields;
    }
    let searchClient = Promise.promisifyAll(this.jira.search);

    return searchClient
      .searchAsync(options)
      .then((issues) => {
        return Promise.resolve(issues);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  search_get(jql, fields = "id,key,summary", page_number = 0) {
    let encoded_jql = jql.replace("&", "%26");

    let uri = `${this._uri}/search?jql=${encoded_jql}&fields=${fields}`;

    return this.paging_service.get_all_pages(uri, page_number);
  }

  create_issue(data) {
    let issue = Promise.promisifyAll(this.jira.issue);

    return issue
      .createIssueAsync(data)
      .then((iss) => {
        return Promise.resolve(iss);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  get_issue_types() {
    let issueType = Promise.promisifyAll(this.jira.issueType);

    return issueType
      .getAllIssueTypesAsync({})
      .then((issue_types) => {
        return Promise.resolve(issue_types);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  get_issue_type(id) {
    let issueType = Promise.promisifyAll(this.jira.issueType);

    return issueType
      .getIssueTypeAsync({ issueTypeId: id })
      .then((issue_types) => {
        return Promise.resolve(issue_types);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  get_projects() {
    let project = Promise.promisifyAll(this.jira.project);

    return project
      .getAllProjectsAsync({})
      .then((projects) => {
        return Promise.resolve(projects);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  get_project(id) {
    let project = Promise.promisifyAll(this.jira.project);

    return project
      .getProjectAsync({
        projectIdOrKey: id,
      })
      .then((proj) => {
        return Promise.resolve(proj);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  get_project_issue_types(project_id) {
    return this.get_project(project_id).then((result) => {
      return Promise.resolve(result.issueTypes);
    });
  }

  get_project_issue_type_issue_metadata(project_id, issue_type_id) {
    let issue = Promise.promisifyAll(this.jira.issue);

    return issue
      .getCreateMetadataAsync({
        projectIds: project_id,
        issuetypeIds: issue_type_id,
        expand: "projects.issuetypes.fields",
      })
      .then((projects) => {
        return Promise.resolve(projects);
      })
      .catch((error) => {
        return Promise.reject(error);
      });
  }

  get_project_components(project_id) {
    let project = Promise.promisifyAll(this.jira.project);

    return project
      .getComponentsAsync({
        projectIdOrKey: project_id,
      })
      .then((components) => {
        return Promise.resolve(components);
      });
  }

  get_component(id) {
    let component = Promise.promisifyAll(this.jira.component);

    return component.getComponentAsync({ id }).then((components) => {
      return Promise.resolve(components);
    });
  }

  configure_authentication(user_name, pw, token_type) {
    if (user_name || pw) {
      if (!(user_name && pw)) {
        throw Error(
          "user_name or password is missing. user_name and password must be used in conjuction with each other"
        );
      } else if (token_type) {
        if (StringOperations.to_lower_case(token_type) === "basic") {
          this.configuration.basic_auth = JiraClientService.basic_authentication(
            user_name,
            pw
          );
        } else if (StringOperations.to_lower_case(token_type) === "oauth") {
          this.configuration.oauth = JiraClientService.oauth_authentication(
            user_name,
            pw
          );
        } else {
          throw Error("invalid token type");
        }
      }
    } else {
      throw Error("user_name and password must be provided");
    }
  }

  static basic_authentication(user_name, pw) {
    return {
      base64: StringOperations.generate_basic_token(user_name, pw),
    };
  }

  //TODO: need to research implementation details
  static oauth_authentication(client_id, client_secret) {
    return new Error("Not implemented");
  }
}
module.exports = JiraClientService;
