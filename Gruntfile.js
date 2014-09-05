module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            build: {
                files: {
                    'build/easytimer.min.js': ['src/easytimer.js']
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify']);

};
