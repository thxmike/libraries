const RestClientService = require("rest-client");

class MetaDefender {

  constructor(base_uri, public_uri, port) {
    //private members
    this._uri = base_uri;
    this._public_uri = public_uri;
    this._rest_service = new RestClientService();
    if (port) {
      this._uri = `${base_uri}:${port}`;
    }
  }

  login(user, pw) {
    let path = `${this._uri}/login`;
    let payload = {
      "password": pw,
      user
    };

    return this._rest_service.post(path, payload, null)
      .then((response) => {
        if (!response.session_id) {
          return Promise.reject(response);
        }
        this._headers = {
          "apikey": response.session_id,
          "Cookie": `session_id_ometascan=${response.session_id}`,
          "DNT": 1
        };
        return Promise.resolve(response.session_id);
      }).catch((err) => {
        return Promise.reject(err);
      });
  }

  set base_uri (value) {
    this._uri = value;
  }

  add_user(user_name, user_display_name, email, pw, role, directory_type = 1) {

    let path = `${this._uri}/admin/user`;

    let payload = {
      "api_key": "",
      "directory_id": directory_type,
      "display_name": user_display_name,
      email,
      "name": user_name,
      "password": pw,
      "roles": [role],
      "ui_settings": {
        "refresh_rate": {
          "value": 30
        },
        "time_period": {
          "value": 24,
          "unitInHour": 1
        }
      }
    };

    return this._rest_service.post(path, payload, this._headers);
  }

  delete_user(user_name) {

    return this.get_users().then((users) => {
      let usrs = JSON.parse(users);

      for (let user of usrs) {

        if (user.name === user_name) {
          let uri = `${this._uri}/admin/user/${user.id}`;

          return this._rest_service.delete(uri, null, this._headers);
        }

      }
      return Promise.reject(new Error(`Unable to find user ${user_name}`));
    });
  }

  get_users() {

    let path = `${this._uri}/admin/user`;

    return this._rest_service.get(path, this._headers);
  }

  get_roles() {
    let path = `${this._uri}/admin/role`;

    return this._rest_service.get(path, this._headers);
  }

  update_user_display_name(user_name, display_name) {

    return this.get_users().then((users) => {

      let user_id = MetaDefender.check_for_user_id(users, user_name);

      if (user_id === -1) {
        return Promise.reject(new Error(`Unable to find user ${user_name}`));
      }
      let path = `${this._uri}/admin/user/${user_id}`;

      let payload = {
        display_name
      };

      return this._rest_service.put(path, payload, this._headers);
    });
  }

  update_user_name(user_name, new_user_name) {

    return this.get_users().then((users) => {

      let user_id = MetaDefender.check_for_user_id(users, user_name);

      if (user_id === -1) {
        return Promise.reject(new Error(`Unable to find user ${user_name}`));
      }
      let path = `${this._uri}/admin/user/${user_id}`;

      let payload = {
        "name": new_user_name
      };

      return this._rest_service.put(path, payload, this._headers);
    });
  }

  update_user_pw(user_name, pw) {

    return this.get_users().then((users) => {

      let user_id = MetaDefender.check_for_user_id(users, user_name);

      if (user_id === -1) {
        return Promise.reject(new Error(`Unable to find user ${user_name}`));
      }
      let path = `${this._uri}/admin/user/${user_id}`;

      let payload = {
        "password": pw
      };

      return this._rest_service.put(path, payload, this._headers);
    });
  }

  static check_for_user_id(users, user_name) {
    let user_id = -1;

    JSON.parse(users).forEach((user) => {
      if (user.name === user_name) {
        user_id = user.id;
      }
    });
    return user_id;
  }

  update_user_role(user_name, roles = []) {

    return Promise.all([
      this.get_users(),
      this.get_roles()
    ])
      .then((container) => {
        let [users] = container;
        let [, current_roles] = container;
        let role_ids = [];
        let user_id = MetaDefender.check_for_user_id(users, user_name);

        if (user_id === -1) {
          return Promise.reject(new Error(`Unable to find user ${user_name}`));
        }

        current_roles.forEach((current_role) => {
          roles.forEach((role) => {
            if (current_role.name === role.name) {
              role_ids.push(role.id);
            }
          });
        });

        if (roles.length === 0) {
          return Promise.reject(new Error("Roles Must be specified"));
        }

        let path = `${this._uri}/admin/user${user_id}`;

        let payload = {
          "roles": role_ids
        };

        return this._rest_service.post(path, payload, this._headers);
      });

  }

  version() {
    let path = `${this._uri}/version`;

    return this._rest_service.get(path, this._headers)
      .then((response) => {
        return Promise.resolve(response);
      }).catch((err) => {
        console.log(err.err);
      });
  }

  activate_online(activation_key, quantity = 1) {
    let path = `${this._uri}/admin/license/activation`;
    let payload = {
      "activationKey": activation_key,
      quantity,
      "comment": "Metadefender AntiVirus Server"
    };

    return this._rest_service.post(path, payload, this._headers);
  }

  license() {
    let path = `${this._uri}/admin/license`;

    return this._rest_service.get(path, this._headers);
  }

  get_license_file(activation_key, deployment_id, node_count = 1) {
    let path = `${this._public_uri}/activation?key=${activation_key}&deployment=${deployment_id}&quantity=${node_count}`;

    return this._rest_service.get(path, this._headers);
  }

  upload_license_file(file_data) {
    let path = `${this._uri}/admin/license`;

    return this._rest_service.post_file(path, file_data.toString(), this._headers);
  }

  deactivate_online() {
    let path = `${this._uri}/admin/license/deactivation`;

    return this._rest_service.post(path, null, this._headers);
  }

  deactivate_offline(activation_key, deployment_id) {
    let path = `${this._public_uri}/deactivation?key=${activation_key}&deployment=${deployment_id}`;

    return this._rest_service.get(path, this._headers);
  }

  scan(file_contents, file_name, additional_headers = {}) {
    let path = `${this._uri}/file`;
    let file_cont = file_contents.toString();
    let file_header = {
      "filename": file_name
    };

    let headers = Object.assign({}, additional_headers, file_header);

    return this._rest_service.post_file(path, file_cont, headers)
      .then((result) => {
        return Promise.resolve(result);
      }).catch((err) => {
        console.log(err);
      });
  }

  check_scan(data_id) {
    let path = `${this._uri}/file/${data_id}`;

    return this._rest_service.get(path)
      .then((response) => {
        return Promise.resolve(response);
      }).catch((err) => {
        console.log(err.err);
      });
  }

  export_configuration() {
    let path = `${this._uri}/admin/export`;

    return this._rest_service.get(path, this._headers);
  }
}
module.exports = MetaDefender;