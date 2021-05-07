import { IMongooseBaseDirector } from './iindex-service';

//Base Class
export abstract class MongooseBaseDirector implements IMongooseBaseDirector {

  private _mongoose: any;
  private _managers: any;

  public get mongoose(): any {
    return this._mongoose;
  }

  public get managers(): any {
    return this._managers;
  }

  constructor(mongoose: any) {

    if (!mongoose.Types.UUID) {
      console.log("UUID's are unable to be used with this instance of MongoDB");
    }
    this._mongoose = mongoose;

    const schemas = this.setup_schemas();

    this._managers = this.setup_managers(schemas);
  }

  get director() {
    throw new Error("Base Method director - This method must have an override. This must return all of the model managers");
  }

  setup_schemas() {
    throw new Error("Base Method setup_schemas - This method must have an override. This must define all of your schema definitions");
  }

  setup_managers(schemas: any) {
    throw new Error("Base Method setup_managers - This method must have an override. This must setup all of the models for each schema");
  }
}