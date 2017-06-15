module.exports = function(grunt) {

    grunt.loadNpmTasks("grunt-release");

    grunt.initConfig({
        release: {
            options: {
                github: {
                    repo: "airvantage/vleet",
                    accessTokenVar: "GITHUB_ACCESS_TOKEN"
                }
            }
        }
    });
};
