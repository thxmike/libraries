export interface ISSRSClientService {

  init(): Promise<any>;
  
  getReportsList(): Promise<any>;

  getReport(path: string): Promise<any>;

  renderReport(path: string, parameters: Array<{Name: string, Value: string}>): Promise<any>;
  
}
