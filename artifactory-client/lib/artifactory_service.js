const request = require("request");
const file_system_service = require("fs");

const _base_url = new WeakMap();
const _repository = new WeakMap();
const _credentials = new WeakMap();
const _default_header = new WeakMap();

class ArtifactoryService {

  constructor(base_url, repository, user_name, pw) {

    _base_url.set(this, base_url);
    _repository.set(this, repository);
    let credentials = null;

    if (user_name && pw) {

      let cred = `${user_name}:${pw}`;
      let buffer = new Buffer(cred);

      credentials = buffer.toString("base64");

    }
    let default_header = {
      "Connection": "keep-alive",
      "Keep-Alive": "30",
      "Transfer-Encoding": "chunked"
    };

    if (credentials) {
      default_header.Authorization = credentials;
      _credentials.set(this, credentials);
    }
    _default_header.set(this, default_header);

  }

  publish(project_code, version, file_to_publish) {

    let file_name = file_to_publish.replace(/^.*[\\\/]/, "");
    let url = `${_base_url.get(this)}/${_repository.get(this)}/${project_code}/${version}/${file_name}`;

    let headers = _default_header.get(this);

    let options = {
      url,
      headers
    };

    return new Promise((resolve, reject) => {

      let file_stream = file_system_service.createReadStream(file_to_publish);

      file_stream
        .pipe(request.put(options, (error, response) => {
          if (error) {
            reject(error.message);
            return;
          }
          //We expect a CREATED return code.
          if (response.statusCode !== 201) {
            reject(`HTTP Status Code from server was: ${response.statusCode}`);
            return;
          }
          console.log(`${file_to_publish} has been published to ${options.url}`);
          resolve(JSON.parse(response.body));
        }));
    });

  }

  download(project_code, version, file_to_download) {

    let url = `${_base_url.get(this)}/${_repository.get(this)}/${project_code}/${version}/${file_to_download}`;

    let headers = _default_header.get(this);

    return new Promise((resolve, reject) => {

      let options = {
        url,
        headers
      };

      request.get(options)
        .on("error", (err) => {
          reject(err);
        })
        .on("end", (response) => {

          if (response) {
            resolve(response);
          } else {
            resolve();
          }

        })
        .pipe(file_system_service.createWriteStream(`/tmp/${file_to_download}`));
    });

  }
}

module.exports = ArtifactoryService;