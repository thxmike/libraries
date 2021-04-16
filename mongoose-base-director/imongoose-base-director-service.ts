export interface IMongooseBaseDirector {
  
  director: any;

  setup_schemas(): any;

  setup_managers(schemas: any): void;
}