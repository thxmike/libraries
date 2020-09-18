const bson = require("bson");
const mongoose = require("mongoose");
const uuidParse = require("uuid-parse");
const util = require("util");

class TypeConversionService {

  static convert_objectid_to_uuid(object_id, pad_left = false) {
    let id = "";
    //example: aa50d124-713e-11ea-bc55-0242ac130003

    if (object_id.length === 24) {
      if (pad_left) {
        id = `00000000-${object_id.slice(0, 4)}-${object_id.slice(4, 8)}-${object_id.slice(8, 12)}-${object_id.slice(12, 24)}`;
      } else {
        id = `${object_id.slice(0, 8)}-${object_id.slice(8, 12)}-${object_id.slice(12, 16)}-${object_id.slice(16, 20)}-${object_id.slice(20, 24)}00000000`;
      }
    }
    else if (object_id.length === 36) {
      id = object_id;
    }
    else {
      throw new Error("Invalid Object ID");
    }

    return id;
  }

  static convert_string_to_uuid(uuid_string) {

    //let uuid_parse = uuid(uuid_string);
    let id = new mongoose.Types.Buffer(uuidParse.parse(uuid_string));

    id.subtype(bson.Binary.SUBTYPE_UUID);
    return id.toObject();
  }

  static guid_to_byte_array(uuid_string) {
    let bytes = [];

    uuid_string.split("-").map((number, index) => {
      let bytesInChar = index < 3 ? number.match(/.{1,2}/g).reverse() : number.match(/.{1,2}/g);

      bytesInChar.map((byte) => {
        bytes.push(parseInt(byte, 16));
      });
    });
    return bytes;
  }

  static decode_base64_to_utf8(base64_encoded_string) {
    return Buffer.from(base64_encoded_string, "base64").toString("utf8");
  }

  static encode_utf8_to_base64(utf8_string) {
    return Buffer.from(utf8_string).toString("base64");
  }

  static unix_timestamp_to_po_date_time(UNIX_timestamp) {
    let date_obj = new Date(UNIX_timestamp * 1000);
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    let year = date_obj.getFullYear();
    let month = months[date_obj.getMonth()];
    let date = date_obj.getDate();
    let hour = date_obj.getHours();
    let min = date_obj.getMinutes();
    let sec = date_obj.getSeconds();
    let dateTime = `${date} ${month} ${year} ${hour}:${min}:${sec}`;

    return dateTime;
  }

  static convert_string_to_json(string) {
    let json_string = string;

    if (string && typeof string === "string") {
      json_string = JSON.parse(string);
    }
    return json_string;
  }

  static convert_object_to_string(object) {

    let obj = object;

    if (typeof object === "object") {
      obj = util.inspect(object, {
        "showHidden": false,
        "depth": null
      });
    }
    return obj;
  }
}

module.exports = TypeConversionService;