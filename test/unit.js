var assert = require('assert');
var fs = require('fs');
var Module = require('module');
var path = require('path');
var vm = require('vm');

var reporterPath = require.resolve('../src/index');

function loadReporter(jasmineCore) {
    var originalLoad = Module._load;
    Module._load = function(request, parent, isMain) {
        if (request === 'jasmine-core') {
            return jasmineCore;
        }

        return originalLoad(request, parent, isMain);
    };

    delete require.cache[reporterPath];
    try {
        return require(reporterPath);
    } finally {
        Module._load = originalLoad;
        delete require.cache[reporterPath];
    }
}

function file(pattern) {
    return {
        pattern: pattern,
        included: true,
        served: true,
        watched: false
    };
}

function initializeReporter(jasmineVersion) {
    var jasminePath = '/project/node_modules/jasmine-core/lib/jasmine-core';
    var jasmineCore = {
        version: function() {
            return jasmineVersion;
        },
        files: {
            path: jasminePath,
            cssFiles: ['jasmine.css'],
            jsFiles: ['jasmine.js', 'jasmine-html.js']
        }
    };
    var plugin = loadReporter(jasmineCore);
    var initReporter = plugin['reporter:kjhtml'][1];
    var config = {
        files: [
            file('/project/node_modules/karma-jasmine/node_modules/jasmine-core/lib/jasmine-core/jasmine.js'),
            file('/project/node_modules/karma-jasmine/lib/boot.js'),
            file('/project/node_modules/karma-jasmine/lib/adapter.js'),
            file('/project/test/spec.js')
        ]
    };

    initReporter.call({}, config, function() {});
    return config.files.map(function(configFile) {
        return configFile.pattern.replace(/\\/g, '/');
    });
}

function testJasmine6Files() {
    var files = initializeReporter('6.0.1');

    assert.deepStrictEqual(files, [
        '/project/node_modules/karma-jasmine/node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
        '/project/node_modules/karma-jasmine/lib/boot.js',
        '/project/node_modules/karma-jasmine/lib/adapter.js',
        '/project/node_modules/jasmine-core/lib/jasmine-core/jasmine.css',
        '/project/node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
        path.resolve(__dirname, '../src/boot.js').replace(/\\/g, '/'),
        '/project/test/spec.js'
    ]);
}

function testJasmine7Files() {
    var files = initializeReporter('7.0.1');

    assert.deepStrictEqual(files, [
        '/project/node_modules/jasmine-core/lib/jasmine-core/jasmine.js',
        '/project/node_modules/karma-jasmine/lib/adapter.js',
        '/project/node_modules/jasmine-core/lib/jasmine-core/jasmine.css',
        '/project/node_modules/jasmine-core/lib/jasmine-core/jasmine-html.js',
        path.resolve(__dirname, '../src/boot.js').replace(/\\/g, '/'),
        '/project/test/spec.js'
    ]);
}

function runBoot(options) {
    var reporters = [];
    var configured;

    function HtmlReporterV2() {
        this.startedWith = null;
        if (options.frozen) {
            Object.freeze(this);
        }
    }

    HtmlReporterV2.prototype.jasmineStarted = function(startOptions) {
        this.startedWith = startOptions;
    };

    if (options.frozen) {
        Object.freeze(HtmlReporterV2.prototype);
    }

    var context = {
        document: {
            body: {}
        },
        isFinite: isFinite,
        jasmine: {
            getEnv: function() {
                return {
                    addReporter: function(reporter) {
                        reporters.push(reporter);
                    },
                    configure: function(config) {
                        configured = config;
                    }
                };
            },
            HtmlReporterV2: HtmlReporterV2,
            HtmlReporterV2Urls: function() {},
            QueryString: function() {
                this.getParam = function() {
                    return undefined;
                };
            }
        },
        window: {
            location: {
                search: ''
            }
        }
    };

    var bootSource = fs.readFileSync(
        path.resolve(__dirname, '../src/boot.js'),
        'utf8'
    );
    vm.runInNewContext(bootSource, context);

    return {
        configured: configured,
        reporter: reporters[0]
    };
}

function testJasmine6StartNormalization() {
    var result = runBoot({ frozen: false });
    result.reporter.jasmineStarted({});

    assert.strictEqual(result.reporter.startedWith.totalSpecsDefined, 0);
    assert.strictEqual(result.reporter.startedWith.numExcludedSpecs, 0);
}

function testJasmine7FrozenReporter() {
    var result = runBoot({ frozen: true });

    assert.ok(result.configured);
    assert.ok(result.reporter);
    assert.strictEqual(
        Object.prototype.hasOwnProperty.call(
            result.reporter,
            'jasmineStarted'
        ),
        false
    );
}

testJasmine6Files();
testJasmine7Files();
testJasmine6StartNormalization();
testJasmine7FrozenReporter();
