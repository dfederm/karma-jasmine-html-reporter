describe("A suite is just a function", function () {
    var a;
    it("and so is a spec", function () {
        a = true;
        expect(a).toBe(true);
    });

    it("this is a second test", function () {
        a = true;
        expect(a).toBe(true);
    });
    it("loads the HTML reporter after the karma-jasmine adapter", function () {
        var scriptSources = Array.prototype.map.call(
            document.scripts,
            function (script) {
                return script.src;
            }
        );

        expect(document.querySelector(".jasmine_html-reporter")).not.toBeNull();
        expect(scriptSources.some(function (source) {
            return /karma-jasmine[\\/]lib[\\/]adapter\.js/.test(source);
        })).toBe(true);
        var hasKarmaJasmineBoot = scriptSources.some(function (source) {
            return /karma-jasmine[\\/]lib[\\/]boot\.js/.test(source);
        });
        var jasmineMajorVersion = parseInt(jasmine.version.split(".")[0], 10);
        expect(hasKarmaJasmineBoot).toBe(jasmineMajorVersion < 7);
    });
});