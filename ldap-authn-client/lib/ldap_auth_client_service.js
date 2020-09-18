const ldapjs = require("ldapjs");

//LDAP is slow, especially when it comes to searching.
class LdapAuthClientService {
  constructor(ldap_uri, search_dn, service_account_dn, password, cache_threshold) {
    this._ldap_uri = ldap_uri;
    this._service_account_dn = service_account_dn;
    this._password = password;
    this._local_user_cache = [];
    this._search_dn = search_dn;
    this._token = null;
    this._threshold_limit = cache_threshold;
    this.test_ldap_connectivity();
  }

  test_ldap_connectivity() {
    let _client = ldapjs.createClient({
      "url": this._ldap_uri
    });

    _client.bind(this._service_account_dn, this._password, (err, res) => {
      if (err) {
        console.log(`There is a problem connecting to the ldap server ${
          this._ldap_uri
        } - ${err}`);
      }
      if (res) {
        console.log(res);
      }
      _client.unbind();
    });
  }

  //binds based on samAccountName and associated pw
  authenticate_user(user_name, pw) {

    let token = `Basic ${Buffer.from(`${user_name}:${pw}`).toString("base64")}`;

    return this.find_user(user_name, pw, token).then((user) => {
      return this.authenticate_ldap(user.dn, pw);
    });
  }

  /*
   * Name: find_user
   * finds a user ldap record based on samAccountName
   * searches the local cache first before going to ldap
   */
  find_user(user_name, pw, token) {

    let cached_user = this.search_local_user_cache(user_name);
    let current_user_threshold = Date.now();

    if (cached_user) {
      //found cached user already authenticated within the session threshold
      if (
        cached_user.threshold > current_user_threshold
      ) {
        return Promise.resolve(cached_user);
      }

      /*
       *found cached user but not within the session threshold. Updating cache with
       * new threshold and re-authenticating user.
       */
      this.update_threshold_local_auth_user_cache(
        user_name,
        Date.now() + this._threshold_limit
      );
      return Promise.resolve(cached_user);
    }
    return this.search_for_user_in_ldap(user_name, token).then((user) => {
      return Promise.resolve(user, pw);
    });

  }

  //binds based on ldap dn and pw
  authenticate_ldap(dn, pw) {
    return new Promise((resolve, reject) => {
      let _client = ldapjs.createClient({
        "url": this._ldap_uri
      });

      _client.bind(dn, pw, (error, response) => {
        if (error) {
          reject(error);
        }
        if (response) {
          console.log(response);
        }
        resolve();
      });
    });
  }

  //searches the local user cache
  search_local_user_cache(sAMAccountName) {
    let usr = null;

    for (let user of this._local_user_cache) {
      if (user.sAMAccountName.toLowerCase() === sAMAccountName.toLowerCase()) {
        usr = user;
        break;
      }
    }
    return usr;
  }

  //updates threshold on the the local user cache
  update_threshold_local_auth_user_cache(sAMAccountName, threshold) {
    let index = 0;

    for (let user of this._local_user_cache) {
      if (user.sAMAccountName.toLowerCase() === sAMAccountName.toLowerCase()) {
        this._local_user_cache[index].threshold = threshold;
      }
      index += 1;
    }
  }

  //search the ldap system for samAccountName
  search_for_user_in_ldap(sAMAccountName, token) {
    return new Promise((resolve, reject) => {
      let _client = ldapjs.createClient({
        "url": this._ldap_uri
      });

      _client.bind(this._service_account_dn, this._password, (error, response) => {
        if (error) {
          reject(error);
        }
        let opts = {
          "filter": `(&(objectCategory=person)(objectClass=user)(sAMAccountName=${sAMAccountName}))`,
          "scope": "sub",
          "attributes": [
            "dn",
            "objectGUID",
            "sAMAccountName"
          ]
        };
        let obj = {};

        _client.search(this._search_dn, opts, (error, res) => {
          res.on("searchEntry", (entry) => {
            obj = entry.object;
            obj.token = token;
            obj.threshold = Date.now() + this._threshold_limit;
            this._local_user_cache.push(obj);
            resolve(obj);
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
            //resolve(obj);
          });
        });
      });
    });
  }
}
module.exports = LdapAuthClientService;