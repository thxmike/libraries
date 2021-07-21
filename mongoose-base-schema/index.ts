import { mongoose } from '@thxmike/mongoose-custom';
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
      "_id": {
        "type": UUID,
        "default": uuid.v4,
        /*"get": (buffer: any) => stringify(buffer),
        "set": (string: any) => {
            const buffer = parse(string);
            return new this._mongoose.SchemaTypes.Types.Buffer(buffer).toObject(0x03);
        }*/
      },
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
      },
      "__v": {
        "type": Number,
        "select": false
      }
    };

    this.add(default_schema_definition);

    this.virtual("id").get(function() {
      return uuid.from(this._id);
    });

    this.virtual("id").set(function(uuid_string: string) {
      this._id = uuid.from(uuid_string);
    });
  } 
}