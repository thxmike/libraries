module.exports = (grunt) => {


  grunt.initConfig({
    "eslint": {
      "src": [
        "./**/*.js",
        "!./node_modules/**",
        "!./**/node_modules/**"
      ],
      "options": {
        "configFile": ".eslintrc.json"
      }
    }
  });

  grunt.loadNpmTasks("gruntify-eslint");
  grunt.registerTask("default", ["eslint"]);

};