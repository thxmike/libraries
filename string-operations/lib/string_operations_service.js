const ulti_type_conversion_service = require("type-conversion");
const uuid = require("uuid");

class StringService {

  /*
   * @clean_string: removes tabs, new lines and carriage returns
   * @value: the string to clean
   * returns the string cleaned.
   */
  static clean_string(value) {
    return value.replace(/[\n\t\r\']/g, "");
  }

  static remove_uri_query_string(uri_with_query_string) {
    let val = uri_with_query_string;

    if (uri_with_query_string.indexOf("?") > 0) {
      [val] = uri_with_query_string.split("?");
    }
    return val;
  }

  static to_lower_case(value) {
    return value.toLowerCase();
  }

  static to_upper_case(value) {
    return value.toUpperCase();
  }

  static is_upper(value) {

    let check = false;

    if (value === value.toUpperCase()) {
      check = true;
    }
    return check;
  }

  static is_json(text) {
    try {
      return JSON.parse(text) && Boolean(text);
    } catch (err) {
      return false;
    }
  }

  static format_GUID(objectGUID) {

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

  static convert_guid_to_octet_string(id) {
    let byte_array = ulti_type_conversion_service.guid_to_byte_array(id);
    let octet_string = "";

    byte_array.forEach((byte) => {
      octet_string = `${octet_string}\\x${StringService.to_upper_case(StringService.pad_value(StringService.to_hex_string(byte), 2, "0"))}`;
    });

    return octet_string;
  }

  static to_hex_string(value) {
    return value.toString(16);
  }

  static pad_value(value, length, pad_value) {
    return value.padStart(length, pad_value);
  }

  static generate_random_string(length) {

    let chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";

    return StringService.generate_random(length, chars);
  }

  static generate_random_alpha_numeric_string(length) {

    let chars = "ABCDEFGHIJKLMNOP1234567890";

    return StringService.generate_random(length, chars);
  }

  static generate_random(length, char_set) {
    let word = "";

    for (let index = 0; index < length; index += 1) {
      let character = Math.floor(Math.random() * char_set.length);

      word += char_set.charAt(character);
    }
    return word;
  }

  static generate_uuid() {
    return uuid.v4();
  }

  static generate_mongo_object_id() {
    let timestamp = (new Date().getTime() / 1000 | 0).toString(16);

    return timestamp + "xxxxxxxxxxxxxxxx".replace(/[x]/g, () => {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase();
  }

  static generate_basic_token(user_name, pw) {
    return Buffer.from(`${user_name}:${pw}`).toString("base64");
  }

  static snake_to_camel(str) {
    return str.replace(
      /([-_][a-z])/g,
      (group) => group.toUpperCase()
        .replace("-", "")
        .replace("_", "")
    );
  }

  static camel_to_snake(str) {
    return str.replace(/\.?([A-Z]+)/g, "_$1").toLowerCase().replace(/^_/, "");
  }
}

module.exports = StringService;