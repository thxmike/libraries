export interface IMongooseBaseDirector {
  
  mongoose: any;

  managers: any;
  
  director: any;

  setup_schemas(): any;

  setup_managers(schemas: any): void;
}