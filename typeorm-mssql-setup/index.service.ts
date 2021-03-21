export interface ITypeOrmMssqlSetupService {
    initialize(): Promise<void>;
    close(): Promise<void>;
}