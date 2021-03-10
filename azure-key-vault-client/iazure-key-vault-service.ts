import { KeyVaultSecret } from '@azure/keyvault-secrets';

export interface IAzureKeyVaultClientService {
  list(): Promise<Array<string>>;
  read(key: string): Promise<KeyVaultSecret>;
  write(key: string, value: string): void;
  delete(key: string, is_purged: boolean): Promise<any>;
}
