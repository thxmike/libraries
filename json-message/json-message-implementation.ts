import { IJsonMessageService } from './ijson-message-service';

export class JsonMessageService implements IJsonMessageService {
  static not_authorized(message: string) {
    return {
      "code": "401",
      "type": "Unauthorized",
      "description": message
    };
  }

  static param_does_not_exist(param: string) {
    return {
      "code": 400,
      "type": "Bad Request",
      "description": `The param ${param} does not exist`
    };
  }

  static query_string_does_not_exist(param: string) {
    return {
      "code": 400,
      "type": "Bad Request",
      "description": `The query string item ${param} does not exist`
    };
  }

  static get not_implemented() {
    return {
      "code": "501",
      "error": "Bad Request",
      "description": "Not Implemented"
    };
  }
}