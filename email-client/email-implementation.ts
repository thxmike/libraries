import { FileSystemService } from '@thxmike/file-system';
import nodeMailer from 'nodemailer';

import { IEmailService } from './iemail-service';

export class EmailService implements IEmailService {
  private file_system: FileSystemService;

  private email_server: string;

  private port: number;

  private template: string;

  constructor(
    email_server: string,
    port: number = 587,
    template: string = ""
  ) {
    this.file_system = new FileSystemService();
    this.email_server = email_server;
    this.port = port;
    this.template = template;
  }

  public setup_transport(): Promise<any> {
    return new Promise((resolve, reject) => {
      let transport = nodeMailer.createTransport({
        host: this.email_server,
        port: this.port,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control":
            "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0",
          Pragma: "no-cache",
        },
      });

      resolve(transport);
    });
  }

  public setup_template(): Promise<void> {
    if (!this.template) {
      return this.file_system
        .read_file(`node_modules/@thxmike/email-client/lib/template.html`)
        .then((results) => {
          this.template = results.toString();
          return Promise.resolve();
        });
    }
    return Promise.resolve();
  }

  public send_message(email_to: string, email_from: string, content: string, subject: string): Promise<any> {
    let message = {};

    return this.setup_template()
      .then(() => {
        message = {
          from: email_from,
          to: email_to,
          subject,
          html: this.template.replace("{{content}}", content),
        };
        return Promise.resolve();
      })
      .then(() => {
        return this.setup_transport();
      })
      .then((transport) => {
        return transport.sendMail(message);
      });
  }

  validate_email(email: string): boolean {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }
}
