// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
    const process = require('process');
    const isCI = process.env.CI === 'true';

    process.env.CHROME_BIN = require('puppeteer').executablePath();

    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma'),
            require('karma-junit-reporter')
        ],
        client: {
            jasmine: {
                random: false,
                stopOnFailure: true,
                failFast: true,
            },
            clearContext: true, // leave Jasmine Spec Runner output visible in browser
            captureConsole: false
        },
        jasmineHtmlReporter: {
            suppressAll: true // removes the duplicated traces
        },
        coverageReporter: {
            dir: require('path').join(__dirname, './coverage'),
            subdir: '.',
            includeAllSources: true,
            reporters: [
                { type: 'cobertura' },
                { type: 'lcovonly' },
                { type: 'html' },
                { type: 'text-summary' },
            ]
        },
        reporters: ['progress', 'kjhtml', 'junit'],
        junitReporter: {
            outputDir: './junit'
        },
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: !isCI,
        browsers: ['ChromeCustom'],
        customLaunchers: {
            ChromeCustom: {
                base: 'ChromeHeadless',
                flags: [
                    '--disable-gpu',
                    '--no-sandbox'
                ],
            },
        },
        singleRun: isCI,
        browserDisconnectTimeout: 10000,
        browserDisconnectTolerance: 2,
        browserNoActivityTimeout: 60000,
        captureTimeout: 60000,
        browserSocketTimeout: 60000,
        pingTimeout: 30000,
    });
};
