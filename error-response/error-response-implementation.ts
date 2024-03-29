import { StringService } from '@thxmike/string-operations';

import { IErrorResponseService } from './ierror-response-service';

export class ErrorResponseService implements IErrorResponseService {

  public static is_in_error_state({ err, response, body }: { err: any; response: any; body: any; }) {

    let in_error_state = false;

    if (err) {
      in_error_state = true;
    } else if (response && response.statusCode > 399) {

      in_error_state = true;

    } else if (body) {
      if (!StringService.is_json(body)) {
        if (body.toString().indexOf("AccessDeniedException") !== -1 ||
                  body.toString().indexOf("There was an error processing your request") !== -1 ||
                  body.toString().indexOf("An error occurred while processing your request.") !== -1) {
          in_error_state = true;
        }
      }
    }
    return in_error_state;
  }

  public static extract_error_messages(err: any, response: any, body: any) {

    let error_message: {code: number, messages: any[] } = { code: 0, messages: [] };

    error_message.code = 503;
    error_message.messages = [];

    if (body) {
      error_message.messages = error_message.messages.concat(ErrorResponseService.check_body(body));
    }

    if (response) {
      error_message.code = response.statusCode;
      error_message.messages = error_message.messages.concat(ErrorResponseService.check_response(response));
    }

    if (err) {
      error_message.messages = error_message.messages.concat(ErrorResponseService.check_err(err));
    }

    return error_message;
  }

  public static check_body(body: any): any[] {

    let error_messages: any[] = [];

    if (body) {

      error_messages = [];
      if (typeof body === "string") {
        let tmp = { message : "" };

        if (StringService.is_json(body)) {
          tmp = JSON.parse(body);
        } else {
          tmp.message = body;
        }

        body = tmp;
      }
      if (body && body.id) {
        error_messages.push(`${body.id}`.trim());
      }
      if (body && body.message) {
        error_messages.push(`${body.message}`.trim());
      }
      if (body && body.messageCode) {
        error_messages.push(`${body.messageCode} - ${body.messageDetails}`.trim());
      }
      if (body && body.messages) {
        body.messages.forEach((message: any) => {
          error_messages.push(`${message.message}`.trim());
        });
      }
      if (body && body.errors) {
        if (Array.isArray(body.errors)) {
          body.errors.forEach((message: any) => {
            error_messages.push(`${message.message ? message.message : message.errorMessage ? message.errorMessage : message}`.trim());
          });
        } else {
          error_messages.push(body.errors);
        }
      }
      if (body && body.errorMessages) {
        if (Array.isArray(body.errorMessages)) {
          body.errorMessages.forEach((message: any) => {
            error_messages.push(`${message.message ? message.message : message.errorMessage ? message.errorMessage : message}`.trim());
          });
        } else {
          error_messages.push(body.errorMessages);
        }
      }
      if (body && body.modelState) {
        for (let property in body.modelState) {
          if (body.modelState.hasOwnProperty(property)) {
            body.modelState[property].forEach((msg: any) => {
              error_messages.push(`${msg.code} - ${msg.message}`.trim());
            });
          }
        }
      }
      if (body && body.reason) {
        error_messages.push(`${body.reason}`.trim());
      }
    }

    return error_messages;
  }

  public static check_response(response: any): any[] {

    let error_messages = [];

    if (response) {
      error_messages = [];

      if (response && response.message) {
        error_messages.push(`${response.message}`.trim());
      }
      if (response && response.statusMessage) {
        error_messages.push(`${response.statusMessage}`.trim());
      }
    }
    return error_messages;
  }

  public static check_err(err: any): any[] {
    let error_message = [];

    if (err) {
      error_message = [];
      error_message.push(err);
    }

    return error_message;
  }
}