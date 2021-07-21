import mongoose from 'mongoose';
import util from 'util';
import uuid from 'uuid-mongodb';

const { Error, SchemaType } = mongoose;
export class UUID extends mongoose.SchemaType {
  private defaults: any = { message: "" };

  constructor(path: any, options: any) {
    super(path, options, "UUID");
    uuid.mode("relaxed");
    this.validate(function (val: any) {
      return UUID.validateUuid(val);
    }, options.message || this.defaults.message || "uuid is invalid");
  }

  // `cast()` takes a parameter that can be anything. You need to
  // validate the provided `val` and throw a `CastError` if you
  // can't convert it.
  cast(value: any, doc: any, init: any) {

    if (SchemaType._isRef(this, value, doc, init)) {
      // wait! we may need to cast this to a document
  
      if (value === null || value === undefined) {
        return value;
      }
  
      
      if (value instanceof Document) {
        //value['$__'].wasPopulated = true;
        return value;
      }
  
      // setting a populated path
      if (value.constructor.name === 'Binary') {
        return value;
      } else if (typeof value === 'string') {
        var uuidBuffer = uuid.from(value);
        return uuidBuffer;
      } else if (Buffer.isBuffer(value) || !util.isObject(value)) {
        throw new Error.CastError('UUID', value, this.path);
      }
  
      // Handle the case where user directly sets a populated
      // path to a plain object; cast to the Model used in
      // the population query.
      var path = doc.$__fullPath(this.path);
      var owner = doc.ownerDocument ? doc.ownerDocument() : doc;
      var pop = owner.populated(path, true);
      var ret = value;
      if (!doc.$__.populated ||
          !doc.$__.populated[path] ||
          !doc.$__.populated[path].options ||
          !doc.$__.populated[path].options.options ||
          !doc.$__.populated[path].options.options.lean) {
        ret = new pop.options.model(value);
        ret.$__.wasPopulated = true;
      }
  
      return ret;
    }
    if (typeof value === "string") {
      if (UUID.validateUuid(value)) {
        let uuidBuffer = uuid.from(value);
        return uuidBuffer;
      }
      throw new Error(`${value} is not a value uuid string`);
    }
    if (value.constructor.name === "Binary") {
      if (value.sub_type === 4) {
        let strval = uuid.from(value);
        return strval;
      }
      throw new Error(`${value} is not a value uuid binary`);
    }
    throw new Error(
      "Could not cast " + value + " to uuid. Since it is an unsupported type"
    );
  }

  checkRequired(value: any) {
    return value.constructor.name === "Binary";
  }

  static validateUuid(value: any) {
    try {
      return uuid.from(value);
    } catch (e) {
      return false;
    }
  }
}
