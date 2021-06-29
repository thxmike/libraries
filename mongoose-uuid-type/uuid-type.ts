import { Binary } from 'bson';
import mongoose from 'mongoose';
import uuid from 'uuid';

export class UUID extends mongoose.SchemaType {

  private defaults: any = {"message":""};

  constructor(path: any, options: any) {
    super(path, options, 'UUID');
    //this.validate(function (val: any) { return this.validateUuid(val, options) }, options.message || this.defaults.message || 'uuid is invalid')
  }
    
  // `cast()` takes a parameter that can be anything. You need to
  // validate the provided `val` and throw a `CastError` if you
  // can't convert it.
  cast(value: any, doc: any, init: any) {
    
    if (typeof value === 'string') {
      if(uuid.validate(value)) {
        let uuidBuffer = new mongoose.Schema.Types.Buffer(value);
        uuidBuffer.subtype(Binary.SUBTYPE_UUID);
        return uuidBuffer;
      }
      throw new Error(`${value} is not a value uuid`);
    }

    if (value instanceof mongoose.Types.Buffer){
      let strval = uuid.stringify(value);
    }
  
    throw new Error('Could not cast ' + value + ' to uuid.');
  }

  
  checkRequired (value: any) {
    return value instanceof Binary;
  }
  
  /*
  getter (binary: Buffer){
    return uuid.stringify(binary);
  }
  */
 /*
  validateUuid(value: any){
    return uuid.validate(value);
  }
  */
}
  