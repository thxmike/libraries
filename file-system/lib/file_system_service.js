const Promise = require("bluebird");
const file_service = Promise.promisifyAll(require("fs"));

class FileSystemService {

  constructor() {
    this._file_service = file_service;
  }

  read_file_stream(file_path) {

    return this._file_service.createReadStream(file_path);
  }

  write_file_stream(file_path) {
    return this._file_service.createWriteStream(file_path);
  }

  read_file(file_path) {

    return new Promise((resolve, reject) => {

      this._file_service.readFile(file_path, (err, data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(data);
      });

    });

  }

  write_file(file_path, data) {

    return new Promise((resolve, reject) => {

      this._file_service.writeFile(file_path, data, (err, return_data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(return_data);
      });

    });

  }

  append_file(file_path, data) {

    return new Promise((resolve, reject) => {

      this._file_service.appendFile(file_path, data, (err, return_data) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        resolve(return_data);
      });

    });

  }

  create(file_path, data) {

    return new Promise((resolve, reject) => {

      let options = { "flag": "w" };

      this._file_service.writeFile(file_path, data, options, (err) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        console.log(file_path);
        console.log("The file was saved!");
        resolve();
      });

    });
  }

  create_folder(directory) {

    return new Promise((resolve, reject) => {

      this._file_service.stat(directory, (err) => {
        if (err) {
          if (err.toString().indexOf("ENOENT: no such file or directory") > -1) {

            this._file_service.mkdir(directory, (error) => {
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

  move(source, destination) {

    return new Promise((resolve, reject) => {

      this._file_service.rename(source, destination, (err) => {
        if (err) {
          reject(err);
        }
        console.log(`Successfully moved ${source} to ${destination}`);
        resolve();
      });
    });
  }

  list_folders(directory) {
    let folders = [];

    return this._file_service.readdirAsync(directory)
      .then((files_or_folders) => {

        return Promise.map(files_or_folders, (file_or_folder) => {
          let full_path = `${directory}${file_or_folder}`;

          return new Promise((resolve, reject) => {
            this._file_service.stat(full_path, (err, stat) => {
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

  is_exists(file_path) {
    let test = false;

    return this._file_service.statAsync(file_path)
      .then((stat) => {
        if (stat) {
          test = true;
        }
        return Promise.resolve(test);
      });
  }
}
module.exports = FileSystemService;