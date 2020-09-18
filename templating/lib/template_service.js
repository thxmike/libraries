const ejs = require("ejs");
const FileSystemService = require("file-system");

class TemplateService {
  constructor(source_template_path) {
    this._ejs = ejs;
    this._file_system_service = new FileSystemService();
    this._template_path = source_template_path;
  }

  generate(template, data) {
    let result = this._ejs.render(template, data);

    return result;
  }

  persist_to_file(template_file, data, destination_file_path) {
    let file_system_service = this._file_system_service;

    return file_system_service.read_file(`${this._template_path}/${template_file}.erb`)
      .then((template) => {
        let result = this.generate(template.toString(), data);

        return file_system_service.create(destination_file_path, result);
      }).catch((error) => {
        console.log(error);
      });
  }

  persist_to_memory(template_file, data) {
    let file_system_service = this._file_system_service;

    return file_system_service.read_file(`${this._template_path}/${template_file}.erb`)
      .then((template) => {
        let result = this.generate(template.toString(), data);

        return Promise.resolve(result);
      }).catch((error) => {
        console.log(error);
      });
  }
}
module.exports = TemplateService;