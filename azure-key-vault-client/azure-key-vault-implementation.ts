import { DefaultAzureCredential } from '@azure/identity';
import { KeyVaultSecret, SecretClient } from '@azure/keyvault-secrets';

import { IAzureKeyVaultClientService } from './iazure-key-vault-service';

export class AzureKeyVaultClientService implements IAzureKeyVaultClientService {
  private _vault_uri: string;
  private _secret_client: SecretClient;

  constructor(vault_uri: string) {
    this._vault_uri = vault_uri;
    this._secret_client = new SecretClient(
      this._vault_uri,
      new DefaultAzureCredential()
    );
  }

  public async list(): Promise<Array<string>> {
    let secret_array = [];
    for await (const secretProperties of this._secret_client.listPropertiesOfSecrets()) {
      const secret = await this._secret_client.getSecret(secretProperties.name);
      secret_array.push(secret.name);
    }
    return Promise.resolve(secret_array);
  }

  public async read(key: string): Promise<KeyVaultSecret> {
    let response = await this._secret_client.getSecret(key);
    return response;
  }

  public write(key: string, value: string): void {
    this._secret_client.setSecret(key, value);
  }

  public delete(key: string, is_purged: boolean): Promise<any> {
    return this._secret_client.beginDeleteSecret(key).then((deleted) => {
      if (is_purged) {
        return this._secret_client.purgeDeletedSecret(key).then((purged) => {
          return Promise.resolve();
        });
      }
    });
  }
}
