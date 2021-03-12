export interface IHttpServerService {
  application_name: string;

  start(): Promise<void>;
}
