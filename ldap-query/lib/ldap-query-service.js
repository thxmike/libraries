const ldapjs = require("ldapjs");
const string_service = require("string-operations");
const ulti_type_conversion_service = require("type-conversion");
const Promise = require("bluebird");

//LDAP is slow, especially when it comes to searching.
class LdapQueryService {
  constructor(ldap_uri, search_dn, service_account_dn, password) {
    this._ldap_uri = ldap_uri;
    this._service_account_dn = service_account_dn;
    this._password = password;
    this._search_dn = search_dn;
    this._user_attributes = [
      "objectGUID",
      "givenName",
      "sn",
      "title",
      "description",
      "sAMAccountName",
      "mail"
    ];
    this._user_detail_attributes = [
      "l",
      "c",
      "department",
      "departmentNumber",
      "dn",
      "title",
      "employeeID",
      "employeeType",
      "extensionAttribute3",
      "extensionAttribute4",
      "whenCreated",
      "whenChanged",
      "lastLogon",
      "lastLogonTimeStamp",
      "extensionAttribute1",
      "physicalDeliveryOfficeName",
      "manager",
      "sAMAccountName",
      "userPrincipalName",
      "objectGUID",
      "memberOf",
      "thumbnailPhoto",
      "lastLogonTimeStamp",
      "mobile",
      "telephoneNumber"
    ];
    this._group_attributes = [
      "objectGUID",
      "name",
      "cn",
      "dn",
      "displayName",
      "groupType",
      "sAMAccountName",
      "mail",
      "member",
      "whenCreated",
      "whenChanged"
    ];
    this._members_attributes = [
      "dn",
      "objectGUID",
      "sAMAccountName",
      "lastLogonTimeStamp"
    ];
  }

  //search the ldap system for samAccountName
  get_users(filter = "") {

    const users_filter = "(&(objectCategory=person)(objectClass=user)" +
    "(!(|(memberof=CN=NonInteractiveLogon-UG,OU=Non-Interactive Service Accounts,OU=Application and Service Accounts,DC=us,DC=corp)" +
    "(memberof=CN=GSuiteSharedMailboxes,OU=All Groups,DC=us,DC=corp)" +
    "(memberof=CN=NonInteractiveLogon-GG,OU=Interactive Service Accounts,OU=Application and Service Accounts,DC=us,DC=corp)" +
    "(givenName=svc_*)(sn=svc_*)(userPrincipalName=svc_*)(title=Svc_account)(sAMAccountName=svc_*))))";

    return this.search(users_filter, this._user_attributes).then((results) => {

      return Promise.resolve(results.items);
    });
  }

  get_groups() {

    const groups_filter = "(&(objectClass=group))";

    return this.search(groups_filter, this._group_attributes).then((results) => {

      return Promise.resolve(results.items);
    });
  }

  get_group(id) {
    return this.get_by_guid(id, this._group_attributes);
  }

  get_user(id, include_advanced = false) {
    let attributes = this._user_detail_attributes;

    if (include_advanced) {
      attributes = this._user_attributes.concat(this._user_detail_attributes);
    }
    return this.get_by_guid(id, attributes);
  }

  get_user_details(id) {
    return this.get_by_guid(id, this._user_detail_attributes);
  }

  get_member_attributes(dn) {
    return this.get_by_dn(dn, this._members_attributes);
  }

  get_members_by_group_id(id) {

    return this.get_group(id).then((group) => {
      return Promise.map(
        group.items[0].member,
        (member) => {
          return this.get_member_attributes(member);
        },
        { "concurrency": 3 }
      );
    }).then((promise_results_array) => {

      let list = {};

      list.count = promise_results_array.length;
      list.items = [];
      promise_results_array.forEach((member_detail_result) => {
        list.items.push(member_detail_result.items[0]);
      });
      return Promise.resolve(list);

    });

  }

  get_by_guid(id, attributes) {

    let object_GUID_buffer = ulti_type_conversion_service.guid_to_byte_array(id);

    let guid_filter = new ldapjs.filters.EqualityFilter({
      "attribute": "objectGUID",
      "value": object_GUID_buffer
    });

    return this.search(guid_filter, attributes);
  }

  get_by_dn(dn, attributes) {

    let filter = new ldapjs.filters.EqualityFilter({
      "attribute": "distinguishedName",
      "value": dn
    });

    return this.search(filter, attributes);
  }

  search(filter, attributes) {
    let results = {}; //results.count = int, results.data = ;

    results.items = [];
    return new Promise((resolve, reject) => {
      let _client = ldapjs.createClient({
        "url": this._ldap_uri
      });

      _client.bind(this._service_account_dn, this._password, (error, response) => {
        if (error) {
          reject(error);
        }
        let opts = {
          filter,
          "scope": "sub",
          "paged": true,
          "sizeLimit": 1000,
          attributes
        };

        _client.search(this._search_dn, opts, (error, res) => {
          res.on("searchEntry", (entry) => {

            let result = {};

            result.id = string_service.format_GUID(JSON.parse(JSON.stringify(entry.raw)).objectGUID);
            result = Object.assign({}, result, entry.object);
            if (entry.raw.thumbnailPhoto) {
              result.thumbnailPhoto = entry.raw.thumbnailPhoto.toString("base64");
            }
            Reflect.deleteProperty(result, "objectGUID");
            Reflect.deleteProperty(result, "controls");
            results.items.push(result);

          });
          res.on("searchReference", (referral) => {
            //continue
            console.debug(`referral: ${referral.uris.join()}`);
          });
          res.on("error", (err) => {
            reject({ "error": err.message });
          });
          res.on("end", () => {
            _client.unbind();
            results.count = results.items.length;
            resolve(results);
          });
        });
      });
    });
  }
}
module.exports = LdapQueryService;