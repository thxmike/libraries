
export interface IMongooseSetupService {

 //define_options(app_name: string, certificate: string, ca: string): any

  connect(uri: string, options: any, db: string, debug: boolean): any;

  mongoose: any;

  director(): any;

  listen(db: string): void
}