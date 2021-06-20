"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
const Path = require("path");
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
// import * as myExtension from '../extension';
const TEST_SOURCE_PATH = Path.join(__dirname, './test_source');
// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", function () {
    before((d) => {
        return vscode.workspace.openTextDocument(TEST_SOURCE_PATH)
            .then(d);
    });
    // Defines a Mocha unit test
    test("Something 1", function () {
        assert.equal(-1, [1, 2, 3].indexOf(5));
        assert.equal(-1, [1, 2, 3].indexOf(0));
    });
});
//# sourceMappingURL=extension.test.js.map