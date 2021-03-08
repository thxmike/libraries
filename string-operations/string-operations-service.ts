import { TypeConversionService } from '@thxmike/type-conversion';
import * as uuid from 'uuid';

export class StringService {

  /*
   * @clean_string: removes tabs, new lines and carriage returns
   * @value: the string to clean
   * returns the string cleaned.
   */
  public static clean_string(value: string) {
    return value.replace(/[\n\t\r\']/g, "");
  }

  public static remove_uri_query_string(uri_with_query_string: string) {
    let val = uri_with_query_string;

    if (uri_with_query_string.indexOf("?") > 0) {
      [val] = uri_with_query_string.split("?");
    }
    return val;
  }

  public static to_lower_case(value: string) {
    return value.toLowerCase();
  }

  public static to_upper_case(value: string) {
    return value.toUpperCase();
  }

  public static is_upper(value: string) {

    let check = false;

    if (value === value.toUpperCase()) {
      check = true;
    }
    return check;
  }

  public static is_json(text: string) {
    try {
      return JSON.parse(text) && Boolean(text);
    } catch (err) {
      return false;
    }
  }

  public static format_GUID(objectGUID: any) {

    const hex = Buffer.from(objectGUID, "binary").toString("hex");

    const p1 =
      hex.substr(-26, 2) +
      hex.substr(-28, 2) +
      hex.substr(-30, 2) +
      hex.substr(-32, 2);

    const p2 = hex.substr(-22, 2) + hex.substr(-24, 2);
    const p3 = hex.substr(-18, 2) + hex.substr(-20, 2);
    const p4 = hex.substr(-16, 4);
    const p5 = hex.substr(-12, 12);

    return [
      p1,
      p2,
      p3,
      p4,
      p5
    ].join("-");

  }

  public static convert_guid_to_octet_string(id: any) {
    let byte_array = TypeConversionService.guid_to_byte_array(id);
    let octet_string = "";

    byte_array.forEach((byte) => {
      octet_string = `${octet_string}\\x${StringService.to_upper_case(StringService.pad_value(StringService.to_hex_string(byte), 2, "0"))}`;
    });

    return octet_string;
  }

  public static to_hex_string(value: any) {
    return value.toString(16);
  }

  public static pad_value(value: string, length: number, pad_value: string) {
    return value.padStart(length, pad_value);
  }

  public static generate_random_string(length: number) {

    let chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";

    return StringService.generate_random(length, chars);
  }

  public static generate_random_alpha_numeric_string(length: number) {

    let chars = "ABCDEFGHIJKLMNOP1234567890";

    return StringService.generate_random(length, chars);
  }

  public static generate_random(length: number, char_set: string) {
    let word = "";

    for (let index = 0; index < length; index += 1) {
      let character = Math.floor(Math.random() * char_set.length);

      word += char_set.charAt(character);
    }
    return word;
  }

  public static generate_uuid() {
    return uuid.v4();
  }

  public static generate_mongo_object_id() {
    let timestamp = (new Date().getTime() / 1000 | 0).toString(16);

    return timestamp + "xxxxxxxxxxxxxxxx".replace(/[x]/g, () => {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
  }

  public static generate_basic_token(user_name: string, pw: string) {
    return Buffer.from(`${user_name}:${pw}`).toString("base64");
  }

  public static snake_to_camel(str: string) {
    return str.replace(
      /([-_][a-z])/g,
      (group) => group.toUpperCase()
        .replace("-", "")
        .replace("_", "")
    );
  }

  public static camel_to_snake(str: string) {
    return str.replace(/\.?([A-Z]+)/g, "_$1").toLowerCase().replace(/^_/, "");
  }
}
