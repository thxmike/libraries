export declare class ErrorResponseService {
    static is_in_error_state({ err, response, body }: {
        err: any;
        response: any;
        body: any;
    }): boolean;
    static extract_error_messages(err: any, response: any, body: any): {
        code: number;
        messages: any[];
    };
    static check_body(body: any): any[];
    static check_response(response: any): any[];
    static check_err(err: any): any[];
}
