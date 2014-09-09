module.exports = function(grunt) {

    grunt.initConfig({
        uglify: {
            build: {
                files: {
                    'dist/easytimer.min.js': ['src/easytimer.js']
                }
            }
        },
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['build']);
    grunt.registerTask('build', ['uglify']);

};
