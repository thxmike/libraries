export interface IFileSystemService {
    read_file_stream(file_path: string): Promise<any>;
    write_file_stream(file_path: string): Promise<any>;
    read_file(file_path: string): Promise<string>;
    write_file(file_path: string, data: string): Promise<void>;
    append_file(file_path: string, data: string): Promise<string>;
    create(file_path: string, data: any): Promise<void>;
    create_folder(directory: string): Promise<string>;
    move(source: string, destination: string): Promise<void>;
    list_folders(directory: string): Promise<Array<string>>;
    is_exists(file_path: string): Promise<boolean>;

}