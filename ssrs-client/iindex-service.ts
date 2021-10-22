export interface ISSRSClientService {

  getReportsList(): Promise<any>;

  getReport(path: string): Promise<any>;

  renderReport(path: string, parameters: Array<{Name: string, Value: string}>): Promise<any>;
  
}
