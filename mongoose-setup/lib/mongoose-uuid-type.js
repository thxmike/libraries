let mongo = function (mongoose) {
  //var mongoose = require('mongoose');
  let bson = require("bson");
  let util = require("util");
  let uuidParse = require("uuid-parse");
  let mongodb = require("mongodb");

  let Document = mongoose.Document;

  function getter(binary) {
    if (binary == null) {
      return undefined;
    }
    if (!(binary instanceof mongoose.Types.Buffer.Binary)) {
      return binary;
    }

    let len = binary.length();
    let b = binary.read(0, len);
    let buf = new Buffer(len);
    let hex = "";

    for (var i = 0; i < len; i++) {
      buf[i] = b[i];
    }

    for (var i = 0; i < len; i++) {
      let n = buf.readUInt8(i);

      if (n < 16) {
        hex += `0${n.toString(16)}`;
      } else {
        hex += n.toString(16);
      }
    }

    return `${hex.substr(0, 8)}-${hex.substr(8, 4)}-${hex.substr(12, 4)}-${hex.substr(16, 4)}-${hex.substr(20, 12)}`;
  }

  function SchemaUUID(path, options) {
    mongoose.SchemaTypes.Buffer.call(this, path, options);

    this.getters.push(getter);
  }

  util.inherits(SchemaUUID, mongoose.SchemaTypes.Buffer);

  SchemaUUID.schemaName = "UUID";

  SchemaUUID.prototype.checkRequired = function(value) {
    return value instanceof mongoose.Types.Buffer.Binary;
  };

  SchemaUUID.prototype.cast = function(value, doc, init) {

    if (value instanceof mongoose.Types.Buffer.Binary) {
      if (init && doc instanceof mongoose.Types.Embedded) {
        return getter(value);
      }
      return value;
    }

    if (
      !(value instanceof mongoose.Types.Buffer.Binary) &&
      value.constructor.name === "Binary" &&
      value._bsontype &&
      value._bsontype === "Binary" &&
      value.position &&
      value.position === 16 &&
      value.sub_type &&
      value.sub_type === 4
    ) {
      value = value.toString();
    }

    if (typeof value === "string") {
      let uuidBuffer = new mongoose.Types.Buffer(uuidParse.parse(value));

      uuidBuffer.subtype(bson.Binary.SUBTYPE_UUID);

      return uuidBuffer.toObject();
    }

    throw new Error(`Could not cast ${value} to UUID.`);
  };

  SchemaUUID.prototype.castForQuery = function($conditional, val) {
    let handler;

    if (arguments.length === 2) {
      handler = this.$conditionalHandlers[$conditional];

      if (!handler) {
        throw new Error(`Can't use ${$conditional} with UUID.`);
      }

      return handler.call(this, val);
    }

    return this.cast($conditional);
  };
  mongoose.Types.UUID = mongoose.SchemaTypes.UUID = SchemaUUID;
};

module.exports = mongo;
module.exports.UUID = mongo.SchemaUUID;