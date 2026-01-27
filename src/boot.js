// This file sets up the HTML reporter for karma-jasmine-html-reporter.
// It initializes the HTML reporter classes and configures the environment.
// This file is heavily based on jasmine-core\lib\jasmine-core\boot1.js, both the v5 and v6 ones.
(function () {
    'use strict';

    // Initialize HTML reporter classes on the jasmine object.
    // This is normally done by boot0.js, but we can't use boot0.js because it
    // creates a new jasmine instance which conflicts with karma-jasmine's setup.
    if (typeof jasmineRequire !== 'undefined' && jasmineRequire.html) {
        // Ensure jasmine.private exists - older jasmine-core versions used by
        // karma-jasmine may not have it, but jasmine-html.js from newer versions needs it.
        if (!jasmine.private) {
            jasmine.private = {};
        }
        jasmineRequire.html(jasmine);
    }

    var env = jasmine.getEnv();

    // Jasmine 6+ uses HtmlReporterV2, Jasmine 4/5 uses HtmlReporter
    if (jasmine.HtmlReporterV2) {
        // Jasmine 6+ path
        var urls = new jasmine.HtmlReporterV2Urls();

        // Don't use urls.configFromCurrentUrl() because it creates a specFilter
        // that uses HtmlSpecFilterV2 which expects spec.getPath() - a method that
        // karma-jasmine doesn't provide. Instead, manually configure with the
        // legacy 'spec' parameter approach that uses getFullName().
        var queryString = new jasmine.QueryString({
            getWindowLocation: function () {
                return window.location;
            }
        });

        var config = {
            stopOnSpecFailure: queryString.getParam('stopOnSpecFailure'),
            stopSpecOnExpectationFailure: queryString.getParam(
                'stopSpecOnExpectationFailure'
            ),
            hideDisabled: queryString.getParam('hideDisabled')
        };

        var random = queryString.getParam('random');
        if (random !== undefined && random !== '') {
            config.random = random;
        }

        var seed = queryString.getParam('seed');
        if (seed) {
            config.seed = seed;
        }

        // Handle spec filtering. HtmlReporterV2 creates 'path' URLs when clicking specs.
        // The 'path' parameter is a JSON-encoded array like ["Suite Name", "spec name"].
        // We match by checking if the full name starts with the path components.
        var pathParam = queryString.getParam('path');
        if (pathParam) {
            try {
                var pathArray = JSON.parse(pathParam);
                config.specFilter = function(spec) {
                    var fullName = spec.getFullName();
                    var expectedPrefix = pathArray.join(' ');
                    return fullName === expectedPrefix || fullName.startsWith(expectedPrefix + ' ');
                };
            } catch (e) {
                // If path is not valid JSON, ignore the filter
            }
        }

        env.configure(config);

        var htmlReporter = new jasmine.HtmlReporterV2({ env: env, urls: urls });

        // Monkey-patch jasmineStarted to handle missing/invalid data from karma-jasmine
        var originalJasmineStarted = htmlReporter.jasmineStarted.bind(htmlReporter);
        htmlReporter.jasmineStarted = function(options) {
            // Ensure required properties exist and are valid numbers
            options = options || {};
            if (typeof options.totalSpecsDefined !== 'number' || !isFinite(options.totalSpecsDefined)) {
                options.totalSpecsDefined = 0;
            }
            if (typeof options.numExcludedSpecs !== 'number' || !isFinite(options.numExcludedSpecs)) {
                options.numExcludedSpecs = 0;
            }
            return originalJasmineStarted(options);
        };

        env.addReporter(htmlReporter);
    } else {
        // Jasmine 4/5 path
        var queryString = new jasmine.QueryString({
            getWindowLocation: function () {
                return window.location;
            }
        });

        var specQueryParam = queryString.getParam('spec');
        var filterSpecs = !!specQueryParam;

        var config = {
            stopOnSpecFailure: queryString.getParam('stopOnSpecFailure'),
            stopSpecOnExpectationFailure: queryString.getParam(
                'stopSpecOnExpectationFailure'
            ),
            hideDisabled: queryString.getParam('hideDisabled')
        };

        var random = queryString.getParam('random');

        if (random !== undefined && random !== '') {
            config.random = random;
        }

        var seed = queryString.getParam('seed');
        if (seed) {
            config.seed = seed;
        }

        /**
         * ## Reporters
         * The `HtmlReporter` builds all of the HTML UI for the runner page. This reporter paints the dots, stars, and x's for specs, as well as all spec names and all failures (if any).
         */
        var htmlReporter = new jasmine.HtmlReporter({
            env: env,
            navigateWithNewParam: function (key, value) {
                return queryString.navigateWithNewParam(key, value);
            },
            addToExistingQueryString: function (key, value) {
                return queryString.fullStringWithNewParam(key, value);
            },
            getContainer: function () {
                return document.body;
            },
            createElement: function () {
                return document.createElement.apply(document, arguments);
            },
            createTextNode: function () {
                return document.createTextNode.apply(document, arguments);
            },
            timer: new jasmine.Timer(),
            filterSpecs: filterSpecs
        });

        env.addReporter(htmlReporter);

        /**
         * Filter which specs will be run by matching the start of the full name against the `spec` query param.
         * Don't override the specFilter unless the query param exists since it may be provided by external config.
         */
        if (specQueryParam) {
            var specFilter = new jasmine.HtmlSpecFilter({
                filterString: function () {
                    return specQueryParam;
                }
            });

            config.specFilter = function (spec) {
                return specFilter.matches(spec.getFullName());
            };
        }

        env.configure(config);

        /**
         * ## Execution
         *
         * Replace the browser window's `onload`, ensure it's called, and then run all of the loaded specs. This includes initializing the `HtmlReporter` instance and then executing the loaded Jasmine environment. All of this will happen after all of the specs are loaded.
         */
        htmlReporter.initialize();
    }
})();
