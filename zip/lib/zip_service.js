const archiver = require("archiver");
const FileSystemService = require("file-system");

class ZipService {

  constructor() {
    this._fs = new FileSystemService();
  }

  compress_directory(folder_to_compress, zip_file_to_create) {

    return new Promise((resolve, reject) => {

      let output = this._fs.write_file_stream(zip_file_to_create);

      this.archiver = archiver("zip", {
        //Sets the compression level.
        "zlib": { "level": 9 }
      });

      this.archiver.name = `${folder_to_compress}`;

      this.setup(resolve, reject);

      this.archiver.pipe(output);

      this.archiver.directory(`${this.archiver.name}`, false);

      this.archiver.finalize();

      console.log(`The folder ${this.archiver.name} is being compressed to ${zip_file_to_create}`);

    });
  }

  //private
  setup(resolve, reject) {

    this.archiver.on("error", (err) => {
      reject(err);
    });

    this.archiver.on("progress", (progress) => {

      console.log(`Processing Zip ${this.archiver.name} ${progress.fs.processedBytes} / ${progress.fs.totalBytes} `);
    });

    this.archiver.on("end", () => {
      resolve(`Stream has ended for ${this.archiver.name}`);
    });

  }
}

module.exports = ZipService;