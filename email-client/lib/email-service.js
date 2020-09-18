const FileSystemService = require("file-system");
const nodeMailer = require("nodemailer");

class EmailService {
  constructor(email_server, port = 587, template = null) {
    this.file_system = new FileSystemService();
    this.email_server = email_server;
    this.port = port;
    this.template = template;
  }

  setup_transport() {
    return new Promise((resolve, reject) => {
      let transport = nodeMailer.createTransport({
        "host": this.email_server,
        "port": this.port,
        "headers": {
          "Content-Type": "image/jpeg",
          "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0",
          "Pragma": "no-cache"
        }
      });

      resolve(transport);
    });
  }

  setup_template() {
    if (!this.template) {
      return this.file_system.read_file(`${__dirname}/../template.html`).then((results) => {
        this.template = results.toString();
        return Promise.resolve();
      });
    }
    return Promise.resolve();
  }

  send_message(email_to, email_from, content, subject) {
    let message = {};

    return this.setup_template().then(() => {
      message = {
        "from": email_from,
        "to": email_to,
        subject,
        "html": this.template.replace("{{content}}", content)
      };
      return Promise.resolve();
    }).then(() => {
      return this.setup_transport();
    }).then((transport) => {
      return transport.sendMail(message);
    });

  }

  validate_email(email) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(String(email).toLowerCase());
  }
}
module.exports = EmailService;