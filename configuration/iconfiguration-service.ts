export interface IConfigurationService {

  merge(config: any): any;

  apply_environment_variable_overrides(config: any, parent: string): void;

  apply_azure_vault_overrides(config: any): Promise<any>;

  configuration: any;
}