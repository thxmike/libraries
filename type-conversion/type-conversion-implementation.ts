import BSON from 'bson';
import * as Mongoose from 'mongoose';
import * as util from 'util';
import * as uuidParse from 'uuid-parse';

import { ITypeConversionService } from './itype-conversion-service';

export class TypeConversionService implements ITypeConversionService {

  public static convert_objectid_to_uuid(object_id: string, pad_left: boolean = false) {
    let id = "";
    //example: convert this 5d6ede6a0ba62570afcedd3a to 00000000-5d6e-de6a-0ba6-2570afcedd3a or 5d6ede6a-0ba6-2570-afcedd3a00000000

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

  public static convert_string_to_uuid(uuid_string: string) {

    //let uuid_parse = uuid(uuid_string);
    let id = new Mongoose.Types.Buffer(uuidParse.parse(uuid_string));

    id.subtype(BSON.Binary.SUBTYPE_UUID);
    return id.toObject();
  }

  public static guid_to_byte_array(uuid_string: string ) {
    let bytes: number[] = [];

    uuid_string.split("-").map((number, index) => {
   
      if(number){
        let match =  number.match(/.{1,2}/g);
        if(match){
          let bytesInChar = index < 3 ? match.reverse() : match;

          bytesInChar.map((byte) => {
            bytes.push(parseInt(byte, 16));
          });
        }
      }
    });
    return bytes;
  }

  public static decode_base64_to_utf8(base64_encoded_string: string) {
    return Buffer.from(base64_encoded_string, "base64").toString("utf8");
  }

  public static encode_utf8_to_base64(utf8_string: string) {
    return Buffer.from(utf8_string).toString("base64");
  }

  public static unix_timestamp_to_po_date_time(UNIX_timestamp: number) {
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

  public static convert_string_to_json(string: any) {
    let json_string = string;

    if (string && typeof string === "string") {
      json_string = JSON.parse(string);
    }
    return json_string;
  }

  public static convert_object_to_string(object: any) {

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