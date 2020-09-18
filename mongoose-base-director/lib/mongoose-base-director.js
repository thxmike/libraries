//Base Class
class BaseMongooseDirector {
  constructor(mongoose) {

    if (!mongoose.Types.UUID) {
      throw new Error("This object requires an mongoose instance from the Mongoose Setup Service");
    }
    this.mongoose = mongoose;

    const schemas = this.setup_schemas();

    this._managers = this.setup_managers(schemas);
  }

  //@override
  get director() {
    throw new Error("Base Method director - This method must have an override. This must return all of the model managers");
  }

  //@override
  setup_schemas() {
    throw new Error("Base Method setup_schemas - This method must have an override. This must define all of your schema definitions");
  }

  //@override
  setup_managers(schemas) {
    throw new Error("Base Method setup_managers - This method must have an override. This must setup all of the models for each schema");
  }
}
module.exports = BaseMongooseDirector;