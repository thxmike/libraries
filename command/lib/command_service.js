const { spawn, exec } = require("child_process");

class CommandService {

  constructor() {
    this.output = "";
    this.options = {};
    this.args = [];
    this.child = {};
  }

  setup(directory, argument_array) {

    this.options.cwd = directory;

    this.args = argument_array;
  }

  setup_io_events(standard_in) {

    if (standard_in) {
      //child.stdin.setEncoding('utf8');
      this.child.stdin.write(standard_in);
      this.child.stdin.end();
    }

    this.child.stdout.on("data", (data) => {
      this.output = `${this.output}\n${data.toString()}`;
    });

    this.child.stderr.on("data", (data) => {
      this.output = `${this.output}\n${data.toString()}`;
    });
  }

  setup_base_events(reject_on_error, resolve, reject) {

    this.setup_error_event(reject_on_error, resolve, reject);

    this.setup_close_event(reject_on_error, resolve, reject);

    this.setup_start_event();

    this.setup_exit_event();

    this.setup_message_event();
  }

  setup_close_event(reject_on_error, resolve, reject) {

    this.child.on("close", (code) => {

      let error_msg = `Process exited with code ${code}:\n ${this.output}`;

      if (code === 0) {
        resolve(this.output);
      } else if (reject_on_error) {
        reject(error_msg);
      } else {
        resolve(error_msg);
      }
      this.output = null;
    });
  }

  setup_exit_event() {
    this.child.on("exit", (code, signal) => {
      this.output = `Process exited with code ${code} and signal ${signal}\n${this.output}`;
    });

  }

  setup_message_event() {
    this.child.on("message", (message) => {
      this.output = `${this.output}\n${message}`;
    });
  }

  setup_start_event() {
    this.child.on("open", () => {
      this.output = `Starting:\n${this.output}`;
    });
  }

  setup_error_event(reject_on_error, resolve, reject) {

    this.child.on("error", (error) => {

      if (reject_on_error) {
        reject(error);
      } else {
        resolve(error);
      }

    });
  }

  execute(command, directory = "./", argument_array = [], reject_on_error = true, standard_in = null) {

    return new Promise((resolve, reject) => {

      this.setup(directory, argument_array);

      if (!argument_array || argument_array.length === 0) {
        this.child = exec(command, this.options);
      } else {
        this.child = spawn(command, this.args, this.options);
      }

      this.setup_io_events(standard_in);

      this.setup_base_events(reject_on_error, resolve, reject);

    });
  }

}

module.exports = CommandService;