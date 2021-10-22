import { ISSRSClientService } from './iindex-service';
import ssrs from 'mssql-ssrs';

export class SSRSClientService implements ISSRSClientService {

  private _serverOptions: any;
  private _serverConfig: any

  constructor(server: string = "", username: string, password: string) {
    
    this._serverConfig = {
      server: server,
      isHttps: false, // optional, default: false
      port: 80, // optional, default: 80
    };

    this._serverOptions = {
      username: username,
      password: password
    }

    const _ = async () => { await ssrs.start(this._serverConfig, this._serverOptions) };
  }

  public async getReportsList(): Promise<any> {
    let reportPath = "/";
    let isRecursive = true;
    return await ssrs.reportService.listChildren(reportPath, isRecursive);
  }

  public async getReport(path: string): Promise<any> {
    return await ssrs.reportService.getProperties(path);
  }

  public async renderReport(path: string, parameters: Array<{Name: string, Value: string}>): Promise<any> {
    
    let fileType = 'html';
    let reportOutput = await ssrs.reportExecution.getReport(path, fileType, parameters)
    const buff = Buffer.from(reportOutput.Result, "base64");

    return buff.toString("utf8");
  }
}
