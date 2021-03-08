export declare class StringService {
    static clean_string(value: string): string;
    static remove_uri_query_string(uri_with_query_string: string): string;
    static to_lower_case(value: string): string;
    static to_upper_case(value: string): string;
    static is_upper(value: string): boolean;
    static is_json(text: string): any;
    static format_GUID(objectGUID: any): string;
    static convert_guid_to_octet_string(id: any): string;
    static to_hex_string(value: any): any;
    static pad_value(value: string, length: number, pad_value: string): string;
    static generate_random_string(length: number): string;
    static generate_random_alpha_numeric_string(length: number): string;
    static generate_random(length: number, char_set: string): string;
    static generate_uuid(): string;
    static generate_mongo_object_id(): string;
    static generate_basic_token(user_name: string, pw: string): string;
    static snake_to_camel(str: string): string;
    static camel_to_snake(str: string): string;
}
