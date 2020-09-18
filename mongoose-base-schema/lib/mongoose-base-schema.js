/*
 *Using ES5 implementation since Mongoose does not support ES6 Inheritance on schemas
 * or arrow functions on virtuals, transforms...
 */

class BaseSchema {

  constructor(mongoose) {

    if (!mongoose.Types.UUID) {
      throw new Error("This object requires an mongoose instance from the Mongoose Setup Service");
    }

    this.mongoose = mongoose;

    function setup_schema_options() {
      let options = {
        "id": false,
        "toObject": {
          "getters": true,
          "virtuals": true
        },
        "toJSON": {
          "getters": true,
          "virtuals": true
        }
      };

      options.toJSON.transform = function(doc, ret, options) {
        delete ret._id;
        return ret;
      };
      options.toObject.transform = function(doc, ret, options) {
        delete ret._id;
        return ret;
      };
      return options;
    }

    function setup_schema(schema_options, mongoose) {
      let schema = new mongoose.Schema(
        {
          "_id": {
            "type": mongoose.Types.UUID,
            "default": mongoose.uuid.v4,
            "required": true
          },
          "code": {
            "type": String,
            "required": true,
            "unique": true
          },
          "name": {
            "type": String,
            "required": true
          },
          "description": {
            "type": String,
            "required": true
          },
          "timestamps": {
            "created": {
              "type": Date,
              "required": true,
              "default": Date.now
            },
            "updated": {
              "type": Date,
              "required": true,
              "default": Date.now
            },
            "deleted": {
              "type": Date,
              "default": null
            }
          },
          "nonce": {
            "type": mongoose.Schema.ObjectId,
            "required": true,
            "default": mongoose.Types.ObjectId()
          },
          "__v": {
            "type": Number,
            "select": false
          }
        },
        schema_options
      );

      return schema;
    }

    function setup_function_virtuals(schema, mongoose) {

      schema.virtual("id").get(function() {
        return mongoose.uuid.from(this._id).toString();
      });

      schema.virtual("id").set(function(uuid_string) {
        this._id = mongoose.uuid.from(uuid_string);
      });
      return schema;
    }

    let schema_options = setup_schema_options();
    let schema = setup_schema(schema_options, this.mongoose);

    this.schema = setup_function_virtuals(schema, this.mongoose);
  }
}

module.exports = BaseSchema;