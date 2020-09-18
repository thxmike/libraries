# ulti-ldap-authn-client

## Purpose

To provide a simple client for authentication to interact with an LDAP server.

To use create a new instance of the LDAP client then authenticate.

Example:

```javascript
    const ldap_client_service = new AuthNService(
      'ldaps://us.corp:636',
      'dc=us,dc=corp',
      'CN=svc_ldap_search,OU=Non-Interactive Service Accounts,OU=Application and Service Accounts,DC=us,DC=corp',
      '*******', // It is suggested that this is stored in UltiSafe/Vault
      30000
    );
    ldap_client_service.authenticate_user('login_user_name', 'login_password')
```

Details

### Public

- ctor(ldap_uri, search_dn, service_account_dn, password, cache_threshold)  - Initializes a new instance of an ldap client
  - ldap_uri - required - must be in uri format. example. - ldaps://us.corp:636
  - search_dn - required - The starting search dn location for your user base. This must be in ldap dn format - example - dc=us,dc=corp
  - service_account_dn - Since us.corp's active directory requires an account this is the service account in ldap dn format to search the ldap system for user dn's. This is required to authenticate a user.. example - CN=svc_ldap_search,OU=Non-Interactive Service Accounts,OU=Application and Service Accounts,DC=us,DC=corp
  - password - The password associated to the service account
  - cache_threshold - Since LDAP lookups are slow, this module has a temporary cache to store LDAP user dn's. This way when concucurrent requests after the initial login is complete, the lookup of the user will be in this temporary cache
  - Returns error or nothing.

- authenticate_user(user_name, pw) - Searches the DN, for the user DN. Caches that User DN and token. Then authenticates the user
  - user_name - the (common name) cname of the user
  - password -  the password associated to the user
  - Returns a promise.

- test_ldap_connectivity() - used to make sure your initial connection to ldap works. If fails handle error.
  - Returns error or nothing. 

- find_user(user_name, pw, token) - Used to find a user in LDAP. Searched the cache first. The token is passed to determine if the password has changed from the cache.
  - user_name - the user cname to find
  - pw - the password for the user in case the user is not found in the cache
  - token - if it is available it is used for comparison
  - Returns a promise.
  
### Private

- authenticate_ldap - This does the authentication process against LDAP 
  - Returns a promise.

- search_local_user_cache - Searches the local ldap location.
  - Returns a userdn string or error.
  
- update_threshold_local_auth_user_cache - Sets the threshold in the local cache to determine if the threshold has been exceeded or a new login was successful.
  - Returns void

- search_for_user_in_ldap - Searches for a user in LDAP by sAMAccountName
  - Returns a promise