'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      all: ['auth/*.js', 'bin/*.js', 'bin/nodeftpd', 'commands/*.js', 'lib/*.js', '*.js'],
      options: {
        ignores: ['node_modules'],
        node: true
      }
    }
  });

  // NPM Tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Aliases
  grunt.registerTask('default', ['jshint']);
};
