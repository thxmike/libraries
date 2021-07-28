const Promise = require("bluebird");
const Plan = require("./plan.json");
const CommandService = require("./command/lib/command_service");

let update = (folder_array, index, res) => {

  return new Promise((resolve) => {

    let command_service = new CommandService();

    let check = false;

    let folder = folder_array[index];

    console.log(`node-check-updates ${folder}`);

    return command_service.execute("ncu", folder, [
      "-u",
      "--packageFile=package.json"
    ], true)
 /*   
      .then(() => {
        console.log(`npm install ${folder}`);
        return command_service.execute("npm i", folder, [], true);
      })
*/
  
      .then(() => {
        console.log("git status");
        return command_service.execute("git status", "./", [], true);
      })
      .then((results) => {
        let changes = results;

        check = true;//changes.includes(folder);

        console.log(`setting changes for ${folder}`);
        return Promise.resolve();
      })
      .then(() => {
        if (!check) {
          console.log(`skipping publishing ${folder}`);
        }
        if (check) {
          console.log(`npm version patch ${folder}`);
          return command_service.execute("npm version patch", folder, [], true);
        }
        return Promise.resolve();
      })
      .then(() => {
        if (check) {
          console.log(`git add in ${folder}`);
          return command_service.execute("git", folder, [
            "add",
            "."
          ], true);
        }
        return Promise.resolve();
      })
      .then(() => {
        if (check) {
          console.log(`git commit in ${folder}`);
          return command_service.execute(`git commit -m'Updates to ${folder}'`, folder, [], true);
        }
        return Promise.resolve();
      })
      .then(() => {
        if (check) {
          console.log(`npm publish for ${folder}`);
          return command_service.execute("npm publish", folder, [], true);
        }
        return Promise.resolve();
      })
      .then(() => {
        if (check) {
          console.log(`git push for ${folder}`);
          return command_service.execute("git push", folder, [], true);
        }
        return Promise.resolve();
      })
      .then(() => {
        index += 1;
        if (index === folder_array.length) {
          console.log("Update Completed");
          return resolve();
        }
        return update(folder_array, index, resolve).then(() => {
          return resolve();
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};


update(Plan.order, 0);