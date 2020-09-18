const fs = require("fs");
const https = require("https");
const http = require("http");
const WebSocket = require("ws");

class HttpServerService {
  //public
  constructor(
    app,
    port = 3000,
    certificate_location = null,
    key_location = null,
    use_web_sockets = false
  ) {
    this._ports = [port];
    if (port.includes(",")) {
      this._ports = port.split(",");
    }
    this._app = app;
    this._use_web_sockets = use_web_sockets;
    this._application_name = "default";

    if (certificate_location && key_location) {
      this._certificate_obj = {
        "key": key_location,
        "cert": certificate_location
      };
    }
  }

  get socket_server() {
    return this._socket_server;
  }

  set application_name(value) {
    this._application_name = value;
  }

  get_certificate_data() {
    return Promise.all([
      this.get_certificate_file_content(),
      this.get_key_file_content()
    ]);
  }

  get_certificate_file_content() {
    console.debug(`Reading Certificate`);
    return new Promise((resolve, reject) => {
      fs.readFile(this._certificate_obj.cert, "utf-8", (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  get_key_file_content() {
    console.debug(`Reading Key`);
    return new Promise((resolve, reject) => {
      fs.readFile(this._certificate_obj.key, "utf-8", (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  start() {
    return new Promise((resolve, reject) => {
      let server = null;
      console.debug('Starting Express HTTP Servers');
      this._ports.forEach((port, index) => {
        if (
          port === "443" ||
          port === "3443" ||
          port === "4443" ||
          port === "5443" ||
          port === "6443" ||
          port === "7443" ||
          port === "8443" ||
          port === "9443"
        ) {
          console.debug('Setting Up Express HTTPS Server');
          this.get_certificate_data()
            .then((data) => {
              let cert_object = {
                "key": data[1],
                "cert": data[0]
              };

              server = https.createServer(cert_object, this._app);
              this._finalize_setup(server, port);
            })
            .catch((err) => {
              console.error(err);
            });
        } else {
          console.debug('Setting Up Express HTTP Server');
          server = http.createServer(this._app);
          this._finalize_setup(server, port);
        }
        if (index + 1 === this._ports.length) {
          return resolve();
        }
      });
    });
  }

  _finalize_setup(server, port) {
    server.listen(port);

    if (this._use_web_sockets) {
      console.debug('Setting Up WebSocket Server')
      this._socket_server = new WebSocket.Server({ server });
      console.log("Using websockets");
    }

    this._magic(port);
  }

  _magic(port) {
    console.log(`The magic happens on port(s) ${port}`);
  }
}
module.exports = HttpServerService;