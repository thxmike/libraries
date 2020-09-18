const promise_library = require("bluebird");
const RestClientService = require("rest-client");

class DnsClientService {

  constructor(name_server, user_name, pw) {
    console.log("ctor");
    if (name_server) {
      this._name_server = name_server;
    }
    if (user_name) {
      this._user_name = user_name;
    }
    if (pw) {
      this._pw = pw;
    }
    this.Promise = promise_library;
    this._rest_client_service = new RestClientService();
  }

  set name_server(value) {
    this._name_server = value;
  }

  set user_name(value) {
    this._user_name = value;
  }

  set password(value) {
    this._pw = value;
  }

  retrieve_token() {

    let options = {
      "username": this._user_name,
      "password": this._pw
    };

    return this._rest_client_service.put(this.authentication_url, options);
  }

  get authentication_url() {

    return `${this._name_server}/authenticate`;
  }

  get authentication_header() {

    return this.retrieve_token().then((response) => {

      return this.Promise.resolve({ "x-authentication-token": response.token });
    });
  }

  zone_url_for(zone_identifier) {

    return `${this._name_server}/zone/${zone_identifier}`;

  }

  retrieve_zone_records(zone_identifier) {

    return this.authentication_header.then((header) => {

      return this._rest_client_service.get(this.zone_url_for(zone_identifier), header);

    }).then((unparsed_records) => {

      let parsed_response = JSON.parse(unparsed_records);

      return this.Promise.resolve(parsed_response);

    });
  }

  retrieve_cname_zone_records_by_host_name(zone_identifier, host_name) {

    let fully_qualified_name = `${host_name}.${zone_identifier}`;
    let zone_records = [];

    return this.retrieve_zone_records(zone_identifier)
      .then((records) => {

        for (let record of records.records) {

          if (record.content === fully_qualified_name && record.type === "CNAME") {
            zone_records.push(record);
          }
        }
        return this.Promise.resolve(zone_records);
      });
  }

  retrieve_cname_zone_records_by_alias(zone_identifier, alias) {

    let fully_qualified_name = `${alias}.${zone_identifier}`;
    let zone_records = [];

    return this.retrieve_zone_records(zone_identifier)
      .then((records) => {

        for (let record of records.records) {

          if (record.name === fully_qualified_name && record.type === "CNAME") {
            zone_records.push(record);

          }
        }
        return this.Promise.resolve(zone_records);
      });
  }

  retrieve_zone_records_by_similar_name(zone_identifier, name) {
    let zone_records = [];

    return this.retrieve_zone_records(zone_identifier)
      .then((records) => {

        for (let record of records.records) {

          if (record.name.toLowerCase().includes(name.toLowerCase()) ||
                        record.content.toLowerCase().includes(name.toLowerCase())) {
            zone_records.push(record);
          }
        }
        return this.Promise.resolve(zone_records);
      });
  }

  host_name_exists(zone_identifier, host_name) {

    return this.retrieve_cname_zone_records_by_host_name(zone_identifier, host_name)
      .then((record) => {
        let exist = false;

        if (record.length > 0) {
          exist = true;
        }
        return this.Promise.resolve(exist);
      });
  }

  alias_exists(zone_identifier, alias) {

    return this.retrieve_cname_zone_records_by_alias(zone_identifier, alias)
      .then((record) => {
        let exist = false;

        if (record.length > 0) {
          exist = true;
        }
        return this.Promise.resolve(exist);
      });
  }

  create_cname_record(zone_identifier, alias_name, canonical_name, ttl = 30, priority = null) {

    let record_payload = {
      "records": [
        {
          "name": `${alias_name}.${zone_identifier}`,
          "type": "CNAME",
          "content": `${canonical_name}.${zone_identifier}`,
          ttl,
          priority
        }
      ]
    };

    return this.authentication_header.then((header) => {

      console.log(`Creating: ${record_payload.records[0].name} ${record_payload.records[0].content}`);

      return this._rest_client_service.put(
        this.zone_url_for(zone_identifier),
        record_payload,
        header
      )
        .then((response) => {
          return this.Promise.resolve(response);
        });
    });
  }

  static check_update_record(record_payload) {

    let msg = null;

    if (record_payload.length === 0) {

      msg = "There is no records to update";
    }
    return msg;
  }

  static set_payload_record(record_payload, host_name, ttl, priority) {

    if (ttl) {
      record_payload.ttl = ttl;
    }
    if (priority) {
      record_payload.priority = priority;
    }
    if (host_name) {
      record_payload.content = host_name;
    }
    return record_payload;

  }

  update_cname_record(zone_identifier, alias_name, host_name, ttl, priority) {

    return this.retrieve_cname_zone_records_by_alias(zone_identifier, alias_name)
      .then((record_payload) => {

        let err = DnsClientService.check_update_record(record_payload);

        if (err) {
          return Promise.reject(err);
        }

        let records = DnsClientService.set_payload_record(record_payload, host_name, ttl, priority);

        return this.Promise.map(records, (record) => {

          return this.delete_cname_record(zone_identifier, alias_name, record.content.replace(`.${zone_identifier}`, ""));

        }).then(() => {

          return this.create_cname_record(zone_identifier, alias_name, host_name);
        })
          .catch((error) => {

            return Promise.reject(error);

          });
      });

  }

  delete_cname_record(zone_identifier, alias_name, host_name) {

    let record_payload = {
      "records": [
        {
          "name": `${alias_name}.${zone_identifier}`,
          "type": "CNAME",
          "content": `${host_name}.${zone_identifier}`,
          "mode": "delete"
        }
      ]
    };

    return this.authentication_header.then((header) => {

      console.log(`Deleting: ${record_payload.records[0].name} ${record_payload.records[0].content}`);

      return this._rest_client_service.post(
        this.zone_url_for(zone_identifier),
        record_payload,
        header
      );
    })
      .then((response) => {

        return Promise.resolve(response);

      });

  }
}
module.exports = DnsClientService;