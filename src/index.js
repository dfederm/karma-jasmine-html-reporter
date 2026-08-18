var jasmineCore = require('jasmine-core');

var JASMINE_CORE_FILE_PATTERN = /[\\/]jasmine-core[\\/]lib[\\/]jasmine-core[\\/]jasmine\.js$/i;
var KARMA_JASMINE_BOOT_PATTERN = /[\\/]karma-jasmine[\\/]lib[\\/]boot\.js$/i;
var KARMA_JASMINE_ADAPTER_PATTERN = /[\\/]karma-jasmine[\\/]lib[\\/]adapter\.js$/i;
var createPattern = function (path) {
  return { pattern: path, included: true, served: true, watched: false };
};

var findFileIndex = function (files, pattern) {
  return files.findIndex(function (file) {
    return pattern.test(file.pattern);
  });
};

var requireFileIndex = function (files, pattern, description) {
  var index = findFileIndex(files, pattern);
  if (index === -1) {
    throw new Error('Could not find ' + description + ' in Karma files');
  }

  return index;
};

var insertReporterFiles = function (files, insertionIndex) {
  jasmineCore.files.cssFiles.forEach(function (file) {
    files.splice(++insertionIndex, 0, createPattern(jasmineCore.files.path + '/' + file));
  });

  jasmineCore.files.jsFiles.forEach(function (file) {
    if (file === 'jasmine.js') {
      return;
    }

    files.splice(++insertionIndex, 0, createPattern(jasmineCore.files.path + '/' + file));
  });

  files.splice(++insertionIndex, 0, createPattern(__dirname + '/boot.js'));
};

var initReporter = function (karmaConfig, baseReporterDecorator) {
  const files = karmaConfig.files;

  baseReporterDecorator(this);

  if (karmaConfig.jasmineHtmlReporter) {
    const config = karmaConfig.jasmineHtmlReporter;
    if (config.suppressAll) {
      this.onSpecComplete = () => void 0;
      this.onRunComplete = () => void 0;
    }
    if (config.suppressFailed) {
      this.specFailure = () => void 0;
    }
  }

  var adapterIndex;
  var jasmineMajorVersion = parseInt(jasmineCore.version().split('.')[0], 10);

  if (jasmineMajorVersion >= 7) {
    var coreIndex = requireFileIndex(
      files,
      JASMINE_CORE_FILE_PATTERN,
      'the jasmine-core browser runtime'
    );
    files.splice(
      coreIndex,
      1,
      createPattern(jasmineCore.files.path + '/jasmine.js')
    );

    var bootIndex = requireFileIndex(
      files,
      KARMA_JASMINE_BOOT_PATTERN,
      'karma-jasmine boot.js'
    );
    files.splice(bootIndex, 1);
  }

  adapterIndex = requireFileIndex(
    files,
    KARMA_JASMINE_ADAPTER_PATTERN,
    'karma-jasmine adapter.js'
  );
  insertReporterFiles(files, adapterIndex);
};

initReporter.$inject = ['config', 'baseReporterDecorator'];

module.exports = {
  'reporter:kjhtml': ['type', initReporter]
};
