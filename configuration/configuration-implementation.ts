import { AzureKeyVaultClientService } from '@thxmike/azure-key-vault-client';
import { resolve } from 'node:path';

import { IConfigurationService } from './iconfiguration-service';

export class ConfigurationService implements IConfigurationService {
  private _configuration: any;
  private _environment_variables: any;
  private _vault_variables: any;
  private _vault_service: any;

  //Initialize with a default configuration
  constructor(configuration: any) {
    if (configuration) {
      this._configuration = configuration;
    }
    this._environment_variables = process.env;
  }

  private check_azure_vault(): Promise<any> {
    let my_promise = null;
    let good_state = { state: true, message: "Vault Overrides Applied" };
    if (
      this._environment_variables.AZURE_KEY_STORE_URI &&
      this._environment_variables.AZURE_CLIENT_ID &&
      this._environment_variables.AZURE_CLIENT_SECRET &&
      this._environment_variables.AZURE_TENANT_ID
    ) {
      my_promise = new Promise((resolve) => {
        this._vault_service = new AzureKeyVaultClientService(
          this._environment_variables.AZURE_KEY_STORE_URI
        );
        resolve(good_state);
      });
    } else {
      my_promise = new Promise((resolve) => {
        this._vault_service = new AzureKeyVaultClientService(
          this._environment_variables.AZURE_KEY_STORE_URI
        );
        resolve({
          state: false,
          message:
            "Environment variables AZURE_KEY_STORE_URI, AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_CLIENT_SECRET are not setup. The system will attempt to use ManagedIdentityCredential for connecting to Vault. Continuing",
        });
      });
    }
    return my_promise;
  }

  //This will extend or add on to an existing configuration
  public merge(config: any): any {
    let configuration = this._configuration;

    this._configuration = { ...this._configuration, ...config };
    return this.configuration;
  }

  /*
   * Any conflicts by name or underscore notation combination in environment variables, it will override
   * configuration
   */
  public apply_environment_variable_overrides(
    config = this._configuration,
    parent = ""
  ): void {
    for (let property in config) {
      if (Object.prototype.hasOwnProperty.call(config, property)) {
        let full_prop_name = null;

        if (parent) {
          full_prop_name = `${parent}_${property}`;
        } else {
          full_prop_name = property;
        }

        if (typeof config[property] === "object") {
          this.apply_environment_variable_overrides(
            config[property],
            full_prop_name
          );
        }

        if (this._environment_variables[full_prop_name]) {
          if (typeof config[property] === "boolean") {
            config[property] =
              this._environment_variables[full_prop_name] == "true";
          } else if (isNaN(config[property]) === false) {
            config[property] = parseInt(
              this._environment_variables[full_prop_name],
              10
            );
          } else {
            config[property] = this._environment_variables[full_prop_name];
          }
        }
      }
    }
  }

  public apply_azure_vault_overrides(
    config = this._configuration
  ): Promise<any> {
    return this.check_azure_vault()
      .then(() => {
        return this._vault_service.list();
      })
      .then((list) => {
        this._vault_variables = list;
        return new Promise((resolve, reject) => {
          return this.apply_azure_vault_override(config, resolve);
        });
      });
  }

  private async apply_azure_vault_override(
    config: any,
    resolve: any,
    parent: string = "",
    level: number = 0
  ) {
    for (let property in config) {
      if (Object.prototype.hasOwnProperty.call(config, property)) {
        let full_prop_name = null;
        if (parent) {
          full_prop_name = `${parent}-${property}`;
          level += 1;
        } else {
          full_prop_name = property;
        }
        if (typeof config[property] === "object") {
          await this.apply_azure_vault_override(
            config[property],
            resolve,
            full_prop_name,
            level
          );
        }
        if (this._vault_variables.includes(full_prop_name)) {
          let secret = await this._vault_service.read(full_prop_name);
          let val = secret.value;

          if (typeof val === "boolean") {
            config[property] = val === true;
          } else if (isNaN(val) === false) {
            config[property] = parseInt(val, 10);
          } else {
            config[property] = val;
          }
        }
      }
    }
    if (level === 0) {
      return resolve();
    }
  }

  //Returns the current configuration
  get configuration() {
    return this._configuration;
  }
}
