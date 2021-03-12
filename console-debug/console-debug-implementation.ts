import { TypeConversionService } from '@thxmike/type-conversion';


export class ConsoleService {

  constructor(is_debug_mode: boolean, console: any) {

    console.custom = true;
    if (is_debug_mode) {
      //do nothing
      console.debug = (...args: Array<any>) => {

        let updated_args: Array<any> = [];

        args.forEach((arg) => {
          if (typeof args === "object") {
            updated_args.push(TypeConversionService.convert_object_to_string(arg));
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