# Contributing

## Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies

## Running Tests

The test suite runs unit tests and launches ChromeHeadless for the browser
integration tests.

```bash
npm test
```

Run `npm run test:unit` or `npm run test:browser` to execute one part of the
suite.

## Testing with Different Jasmine Versions

This package supports jasmine-core versions 4.x through 7.x. To test
compatibility with a specific version, install it temporarily without changing
the package manifest or lockfile:

```bash
# Test with Jasmine 4
npm install jasmine-core@4.6.1 --no-save --no-package-lock
npm test

# Test with Jasmine 5
npm install jasmine-core@5.7.1 --no-save --no-package-lock
npm test

# Test with Jasmine 6
npm install jasmine-core@6.3.0 --no-save --no-package-lock
npm test

# Test with Jasmine 7
npm install jasmine-core@7.0.1 --no-save --no-package-lock
npm test
```

## Version Compatibility Notes

- **Jasmine 4.x/5.x**: Uses `HtmlReporter` with `QueryString` and `HtmlSpecFilter`
- **Jasmine 6.x**: Uses `HtmlReporterV2` with `HtmlReporterV2Urls` (new reporter with progress bar, performance tab, etc.)
- **Jasmine 7.x**: Uses Jasmine's self-booting browser runtime and replaces
  karma-jasmine's incompatible boot file while retaining its Karma adapter

The boot.js file detects the Jasmine version at runtime and uses the appropriate reporter.
