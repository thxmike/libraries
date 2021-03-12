import fs from 'fs';
import http from 'http';
import https from 'https';

import { IHttpServerService } from './ihttp-server-service';

export class HttpServerService implements IHttpServerService{
  
  private _ports: Array<number>;
  private _app: any;
  private _application_name: string;
  private _certificate_obj: any;

  //public
  //TODO seperate the websocket server from web server
  constructor(
    app: any,
    port: any = 3000,
    certificate_location: string = "",
    key_location: string = "",
    use_web_sockets: boolean = false
  ) {
    this._ports = [port];
    if (port.includes(",")) {
      this._ports = port.split(",");
    }
    this._app = app;
    this._application_name = "default";

    if (certificate_location && key_location) {
      this._certificate_obj = {
        "key": key_location,
        "cert": certificate_location
      };
    }
  }

  public get application_name(): string {
    return this._application_name;
  }

  public set application_name(value: string) {
    this._application_name = value;
  }

  private get_certificate_data() {
    return Promise.all([
      this.get_certificate_file_content(),
      this.get_key_file_content()
    ]);
  }

  private get_certificate_file_content() {
    console.debug(`Reading Certificate`);
    return new Promise((resolve, reject) => {
      fs.readFile(this._certificate_obj.cert, "utf-8", (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  private get_key_file_content() {
    console.debug(`Reading Key`);
    return new Promise((resolve, reject) => {
      fs.readFile(this._certificate_obj.key, "utf-8", (err: any, data: any) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      let server = null;
      console.debug('Starting Express HTTP Servers');
      this._ports.forEach((port: number, index: number) => {
        if (
          port === 443 ||
          port === 3443 ||
          port === 4443 ||
          port === 5443 ||
          port === 6443 ||
          port === 7443 ||
          port === 8443 ||
          port === 9443
        ) {
          console.debug('Setting Up Express HTTPS Server');
          this.get_certificate_data()
            .then((data: Array<any>) => {
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

  private _finalize_setup(server: any, port: number) {
    server.listen(port);

    this._magic(port);
  }

  _magic(port: number) {
    console.log(`The magic happens on port(s) ${port}`);
  }
}