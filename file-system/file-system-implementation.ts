import Promise from 'bluebird';
import fs from 'fs';

import { IFileSystemService } from './ifile-system-service';

export class FileSystemService implements IFileSystemService{
  private _file_service: any;

  constructor() {
    this._file_service = Promise.promisifyAll(fs);
  }

  public read_file_stream(file_path: string): Promise<any> {
    return this._file_service.createReadStreamAsync(file_path);
  }

  public write_file_stream(file_path: string): Promise<any> {
    return this._file_service.createWriteStreamAsync(file_path);
  }

  public read_file(file_path: string): Promise<string> {
    return this._file_service.readFileAsync(file_path);
  }

  public write_file(file_path: string, data: string): Promise<void> {
    return this._file_service.writeFileAsync(file_path, data);
  }

  public append_file(file_path: string, data: string): Promise<string> {
    return this._file_service.appendFileAsync(file_path, data);
  }

  public create(file_path: string, data: string): Promise<void> {
    let options = { flag: "w" };

    return this._file_service.writeFileAsync(file_path, data, options);
  }

  public create_folder(directory: string): Promise<string> {
    return new Promise((resolve: any, reject: any) => {
      this._file_service.stat(directory, (err: any) => {
        if (err) {
          if (
            err.toString().indexOf("ENOENT: no such file or directory") > -1
          ) {
            this._file_service.mkdir(directory, (error: any) => {
              if (error) {
                reject(error);
              }

              resolve(`Directory: ${directory} created`);
            });
          } else {
            reject(err);
          }
        } else {
          resolve(`Directory: ${directory} already exists`);
        }
      });
    });
  }

  public move(source: string, destination: string) {
    return this._file_service.renameAsync(source, destination);
  }

  public list_folders(directory: string): Promise<Array<string>> {
    let folders: Array<string> = [];

    return this._file_service
      .readdirAsync(directory)
      .then((files_or_folders: Array<string>) => {
        return Promise.map(files_or_folders, (file_or_folder: string) => {
          let full_path = `${directory}${file_or_folder}`;

          return new Promise((resolve: any, reject: any) => {
            this._file_service.stat(full_path, (err: any, stat: any) => {
              if (err) {
                reject(err);
              }
              if (stat.isDirectory()) {
                folders.push(full_path);
              }
              resolve();
            });
          });
        });
      })
      .then(() => {
        return Promise.resolve(folders);
      });
  }

  public is_exists(file_path: string): Promise<boolean> {

    let test = false;

    return this._file_service.statAsync(file_path).then((stat: any) => {
      if (stat) {
        test = true;
      }
      return Promise.resolve(test);
    });
  }
}
