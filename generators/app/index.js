'use strict';

var generators = require('yeoman-generator');

var gen = generators.Base.extend({
    initializing: function() {

        try {
            this.username = process.env.USER || process.env.USERPROFILE.split(require('path').sep)[2];
        } catch (e) {
            this.username = '';
        }
    },
    prompting: function() {
        var done = this.async();
        var self = this;

        this.prompt([
            {
                type: 'input',
                name: 'name',
                message: 'Your slides name',
                validate: function(name) {
                    if (!name) {
                        return 'Slides name cannot be empty';
                    }
                    if (!/\w+/.test(name)) {
                        return 'Slides name should only consist of 0~9, a~z, A~Z, _, .';
                    }

                    var fs = require('fs');
                    if (!fs.existsSync(self.destinationPath(name))) {
                        return true;
                    }
                    if (require('fs').statSync(self.destinationPath(name)).isDirectory()) {
                        return 'Project already exist';
                    }
                    return true;
                }
            },
            {
                type: 'input',
                name: 'description',
                message: 'Your slides description',
                default: ''
            },
            {
                type: 'input',
                name: 'username',
                message: 'Your name',
                default: this.username
            },
            {
                type: 'input',
                name: 'email',
                message: 'Your email',
                default: ''
            },
            {
                type: 'list',
                name: 'theme',
                message: 'Choose a theme of this slides',
                choices: [
                    'beige',
                    'black',
                    'blood',
                    'league',
                    'moon',
                    'night',
                    'serif',
                    'simple',
                    'sky',
                    'solarized',
                    'white'
                ]
            },
            {
                type: 'checkbox',
                name: 'plugins',
                message: 'Choose plugins you\'d like to add',
                choices: [
                    {
                        checked: true,
                        name: 'highlight',
                        value: [
                            {
                                src: 'highlight/highlight.js',
                                async: true,
                                callback: 'function() { hljs.initHighlightingOnLoad(); }'
                            }
                        ]
                    },
                    {
                        checked: true,
                        name: 'markdown',
                        value: [
                            {
                                src: 'markdown/marked.js',
                                condition: 'function() { return !!document.querySelector( \'[data-markdown]\' ); }'
                            },
                            {
                                src: 'markdown/markdown.js',
                                condition: 'function() { return !!document.querySelector( \'[data-markdown]\' ); }'
                            }
                        ]
                    },
                    {
                        checked: true,
                        name: 'math',
                        value: [
                            {
                                src: 'math/math.js',
                                async: true
                            }
                        ]
                    },
                    {
                        checked: true,
                        name: 'search',
                        value: [
                            {
                                src: 'search/search.js',
                                async: true
                            }
                        ]
                    },
                    {
                        checked: true,
                        name: 'zoom-js',
                        value: [
                            {
                                src: 'zoom-js/zoom.js',
                                async: true
                            }
                        ]
                    }
                ]
            }
        ], function(answers) {
            this.answers = answers;
            this.obj = {answers: this.answers};
            done();
        }.bind(this));
    },
    configuring: function() {
        var path = require('path');
        var fs = require('fs');
        var self = this;
        var done = this.async();
        fs.exists(this.destinationPath(this.answers.name), function(exists) {
            if (exists && fs.statSync(self.destinationPath(self.answers.name)).isDirectory()) {
                self.log.error('Directory [' + self.answers.name + '] exists');
                process.exit(1);
            }
            self.destinationRoot(path.join(self.destinationRoot(), self.answers.name));
            done();
        });
    },
    writing: function() {
        this.bulkDirectory('css', this.destinationPath('css'));
        this.bulkDirectory('img', this.destinationPath('img'));
        this.bulkDirectory('js', this.destinationPath('js'));
        this.bulkDirectory('lib', this.destinationPath('lib'));
        this.bulkDirectory('plugin', this.destinationPath('plugin'));

        this.fs.copyTpl(this.templatePath('index.html'), this.destinationPath('index.html'), this.obj);
        this.fs.copyTpl(this.templatePath('package.json.vm'), this.destinationPath('package.json'), this.obj);

    },
    end: function() {
        this.log.ok('Slides ' + this.answers.name + ' generated!!!');
    }
});

module.exports = gen;
