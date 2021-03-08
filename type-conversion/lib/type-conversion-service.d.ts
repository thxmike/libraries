export declare class TypeConversionService {
    static convert_objectid_to_uuid(object_id: string, pad_left?: boolean): string;
    static convert_string_to_uuid(uuid_string: string): import("bson").Binary;
    static guid_to_byte_array(uuid_string: string): number[];
    static decode_base64_to_utf8(base64_encoded_string: string): string;
    static encode_utf8_to_base64(utf8_string: string): string;
    static unix_timestamp_to_po_date_time(UNIX_timestamp: number): string;
    static convert_string_to_json(string: any): any;
    static convert_object_to_string(object: any): any;
}
