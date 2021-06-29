import { mongoose } from '@thxmike/mongoose-custom';
import uuid from 'uuid-mongodb';

import { IMongooseBaseSchema } from './iindex-service';

export class MongooseBaseSchema extends mongoose.Schema implements IMongooseBaseSchema {
  
  private _mongoose: any;

  public get mongoose(){
    return this._mongoose;
  }

  constructor(obj: any, options: any, custom_mongoose: any) {

    let default_options = {
      "id": false,
      "toObject": {
        "getters": true,
        "virtuals": true,
        "transform": <any>null
      },
      "toJSON": {
        "getters": true,
        "virtuals": true,
        "transform": <any>null
      }
    }

    function xform(doc: any, ret: any, options: any) {
      delete ret._id;
      return ret;
    };

    default_options.toJSON.transform = xform;

    default_options.toObject.transform = xform;

    default_options = { ...options, ...default_options};

    super(obj, default_options);
   
    this._mongoose = custom_mongoose;

    let default_schema_definition = {
      "_id": {
        "type": this._mongoose.SchemaTypes.UUID,
        "default": uuid.v4
      },
      "context_id": {
        "type": this._mongoose.SchemaTypes.UUID,
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
        "type": this._mongoose.SchemaTypes.ObjectId,
        "required": true,
        "default": mongoose.Types.ObjectId()
      },
      "__v": {
        "type": Number,
        "select": false
      }
    };

    this.add(default_schema_definition);

    this.virtual("id").get(function() {
      return uuid.from(this._id).toString();
    });

    this.virtual("id").set(function(uuid_string: string) {
      this._id = uuid.from(uuid_string);
    });
  } 
}