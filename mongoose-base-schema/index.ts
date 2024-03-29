import { mongoose } from '@thxmike/mongoose-custom';
import { TypeConversionService } from '@thxmike/type-conversion';
import uuid from 'uuid-mongodb';

import { IMongooseBaseSchema } from './iindex-service';

const { UUID, ObjectId } = mongoose.Schema.Types;
export class MongooseBaseSchema extends mongoose.Schema implements IMongooseBaseSchema {
  
  private _mongoose: any;

  public get mongoose(){
    return this._mongoose;
  }

  constructor(obj: any, options: any, custom_mongoose: any) {
    uuid.mode("relaxed");
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
      "context_id": {
        "type": UUID,
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
        "type": ObjectId,
        "required": true,
        "default": this._mongoose.Types.ObjectId()
      }
    };

    this.add(default_schema_definition);

    this.virtual("id").get(function() {
      let str = this._id.toString();
      let myid = TypeConversionService.convert_objectid_to_uuid(str, true);
      return uuid.from(myid);
    });
  } 
}