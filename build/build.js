const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

const jasminePackagePath = "node_modules/jasmine-core/lib/jasmine-core";
const srcBasePath = "src";

copyFromJasmine("jasmine.css", "jasmine.css");
copyFromJasmine("jasmine-html.js", "html.jasmine.reporter.js");

copyFromJasmine("boot.js", "adapter.js");
console.log(chalk.yellow("Be sure to review 'adapter.js'. There are many manual edits needed."));

function copyFromJasmine(src, dest) {
    let fullSrc = path.join(jasminePackagePath, src);

    let destSubdir;
    let destExt = path.extname(dest);
    switch (destExt) {
        case ".css": {
            destSubdir = "css";
            break;
        }
        case ".js": {
            destSubdir = "lib";
            break;
        }
        default: {
            throw new Error(`Unexpected extension: ${destExt}`);
        }
    }
    let fullDest = path.join(srcBasePath, destSubdir, dest);

    console.log(`Copying [${chalk.cyan(fullSrc)}] to [${chalk.cyan(fullDest)}]`);
    fs.copyFileSync(fullSrc, fullDest);
}