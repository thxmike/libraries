
const TypeConversionClient = require("type-conversion");

class ConsoleService {

  constructor(is_debug_mode, console) {

    console.custom = true;
    if (is_debug_mode) {
      //do nothing
      console.debug = (...args) => {

        let updated_args = [];

        args.forEach((arg) => {
          if (typeof args === "object") {
            updated_args.push(TypeConversionClient.convert_object_to_string(arg));
          } else {
            updated_args.push(arg);
          }
        });

        console.log(Date.now().toString(), "-", ...updated_args);
      };
    } else {
      console.debug = () => {};
    }
    return console;
  }
}
module.exports = ConsoleService;