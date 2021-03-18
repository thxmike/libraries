import { Connection } from 'typeorm';

export interface ITypeOrmMssqlSetupService{
    setup(): Promise<Connection>;
    close(): Promise<void>;
}