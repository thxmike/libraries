const RestClientService = require("rest-client");
const Promise = require("bluebird");

class SecurityScreenerService {

  constructor(uri, username, password) {
    this.rest_client_service = new RestClientService();
    this._uri = uri;
    this._username = username;
    this._password = password;
    this._token = null;
    this._token_expiration = new Date();
  }

  get_token() {

    const pay_load = {
      "username": this._username,
      "password": this._password
    };
    let diff = (new Date() - this._token_expiration) / 60000;

    if (!this._token || diff >= 120) {
      return this.rest_client_service.post(`${this._uri}/api/user/login`, pay_load)
        .then((response) => {
          this._token = response["Authorization token"];
          this._token_expiration = new Date();
          return Promise.resolve(this._token);
        });
    }
    return Promise.resolve(this._token);
  }

  get_projects() {

    return this.get_token()
      .then((response) => {
        if (response) {
          let headers = {
            "Authorization": response
          };

          return this.rest_client_service.get(`${this._uri}/api/project/items`, headers)
            .then((resp) => {
              let res = JSON.parse(resp);

              return Promise.resolve(res.items);
            });
        }
        return Promise.reject(new Error({
          "code": 400,
          "message": "Unauthorized"
        }));
      })
      .catch((error) => {

        return Promise.reject(new Error({
          "code": 400,
          "message": error
        }));
      });
  }

  get_project(project_id) {
    return this.get_token().then((response) => {
      if (response) {
        let headers = {
          "Authorization": response
        };

        return this.rest_client_service.get(`${this._uri}/api/project/items`, headers)
          .then((results) => {
            let res = JSON.parse(results).items;

            let project = {};

            res.forEach((item) => {
              if (item.projectID === parseInt(project_id, 10)) {
                project = item;
              }
            });
            return Promise.resolve(project);
          });
      }
      return Promise.reject(new Error({
        "code": 400,
        "message": "Unauthorized"
      }));
    })
      .catch((error) => {

        return Promise.reject(new Error({
          "code": 400,
          "message": error
        }));
      });
  }

  get_sprints_by_project_id(project_id) {
    return this.get_token()
      .then((response) => {
        if (response) {
          let headers = {
            "Authorization": response
          };

          return this.rest_client_service.get(`${this._uri}/api/sprint/stats/${project_id}`, headers)
            .then((resp) => {
              let res = JSON.parse(resp);

              return Promise.resolve(res);
            });
        }
        return Promise.reject(new Error({
          "code": 400,
          "message": "Unauthorized"
        }));
      })
      .catch((error) => {
        return Promise.reject(new Error({
          "code": 400,
          "message": error
        }));
      });
  }

  get_sprint_by_project_id(project_id, sprint_id) {
    return this.get_token()
      .then((response) => {
        if (response) {
          let headers = {
            "Authorization": response
          };

          return this.rest_client_service.get(`${this._uri}/api/sprint/stats/${project_id}`, headers)
            .then((results) => {
              let res = JSON.parse(results);

              let sprint = {};

              res.forEach((item) => {
                if (item.sprint_id === parseInt(sprint_id, 10)) {
                  sprint = item;
                }
              });
              return Promise.resolve(sprint);
            });
        }
        return Promise.reject(new Error({
          "code": 400,
          "message": "Unauthorized"
        }));
      })
      .catch((error) => {
        return Promise.reject(new Error({
          "code": 400,
          "message": error
        }));
      });
  }
}
module.exports = SecurityScreenerService;