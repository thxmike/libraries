import { IMongooseBaseSchema } from './imongoose-base-schema-service';

export class MongooseBaseSchema implements IMongooseBaseSchema {
  private _mongoose: any;
  private _schema: any;

  constructor(mongoose: any) {
    this._mongoose = mongoose;

    function setup_schema(mongoose: any) {

      let schema_definition = {
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
      };

      let schema = new mongoose.Schema(
        schema_definition
      );

      return schema;
    }

    function setup_schema_options(schema: any) {
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

      schema.options = options;

      function xform(doc: any, ret: any, options: any) {
        delete ret._id;
        return ret;
      };

      schema.options.toJSON({transform: xform});

      schema.options.toObject({transform: xform});;
      return schema;
    }

    function setup_function_virtuals(schema: any, mongoose: any) {
      
      schema.virtual("id").get(function() {
        return mongoose.uuid.from(this._id).toString();
      });

      schema.virtual("id").set(function(uuid_string: string) {
        this._id = mongoose.uuid.from(uuid_string);
      });

      return schema;
    }
    
    let schema = setup_schema(this._mongoose);
    schema = setup_schema_options(schema);

    this._schema = setup_function_virtuals(schema, this._mongoose);
  }
}