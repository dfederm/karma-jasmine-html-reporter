# Contributing

## Development Setup

1. Clone the repository
2. Run `npm install` to install dependencies

## Running Tests

Tests require a browser.

```bash
# Run tests
npm test
```

This should show console output like:

```
> karma-jasmine-html-reporter@2.2.0 test
> karma start test/karma.conf.js

27 01 2026 14:59:02.668:WARN [karma]: No captured browser, open http://localhost:9876/
27 01 2026 14:59:02.684:INFO [karma-server]: Karma v6.4.4 server started at http://localhost:9876/
```

Navigate to that localhost url and manually test.

## Testing with Different Jasmine Versions

This package supports jasmine-core versions 4.x, 5.x, and 6.x. To test compatibility with different versions, install the desired version temporarily without saving to package.json:

```bash
# Test with Jasmine 4
npm install jasmine-core@4 --no-save
npm test

# Test with Jasmine 5
npm install jasmine-core@5 --no-save
npm test

# Test with Jasmine 6
npm install jasmine-core@6 --no-save
npm test
```

## Version Compatibility Notes

- **Jasmine 4.x/5.x**: Uses `HtmlReporter` with `QueryString` and `HtmlSpecFilter`
- **Jasmine 6.x**: Uses `HtmlReporterV2` with `HtmlReporterV2Urls` (new reporter with progress bar, performance tab, etc.)

The boot.js file detects the Jasmine version at runtime and uses the appropriate reporter.
