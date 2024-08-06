import * as micromatch from "micromatch";
import { describe, expect } from "vitest";
import { test } from "vitest";
import { pathMatch, ignoreFilter } from "../src/index";

describe("micromatch test", () => {

    test("positive match", () => {
        const result = micromatch.isMatch("src/a/b/index.js", "**.js");
        expect(result).toBe(true);
    });

    test("negative match", () => {
        const result = micromatch.isMatch("src/a/b/index.js", "!**.ts");
        expect(result).toBe(true);
    });

    test("multiple patterns", () => {
        const result = micromatch.isMatch("src/index.js", ["**.js", "!**.ts"]);
        expect(result).toBe(true);
    });

    test("nest directory and dot path", () => {
        let changedFiles = [".github/workflows/pr.yml", "README.md", "src/index.js"];    
        const files = micromatch.match(changedFiles, "**.yml", {dot: true});
        expect(files).to.deep.equal([".github/workflows/pr.yml"]);
    });

    test("multiple patterns and dot path", () => {
        let changedFiles = [".github/workflows/pr.yml", "README.md", "src/index.js"];    
        let paths = ["**.md", "**.yml", "**.js"];
        let files = micromatch.match(changedFiles, paths, {dot: true});
        expect(files.sort()).to.deep.equal(changedFiles.sort());
    });
});

describe("path filter", () => {

    let changedFiles = [".github/workflows/test.yml", ".github/workflows/main.yml", "src/index.js"];
    test("positive match", () => {
        // ** match
        let paths = ["src/**"];
        let files = pathMatch(changedFiles, paths);
        expect(files).to.deep.equal(["src/index.js"]);
        
        paths = ["**.js"];
        files = pathMatch(changedFiles, paths);
        expect(files).to.deep.equal(["src/index.js"]);

        // single * match
        paths = ["*.yml"];
        files = pathMatch(changedFiles, paths);
        expect(files).length(0);
    });

    test("directory match", () => {
        const changedFiles = [".github/workflows/test.yml", ".github/workflows/main.yml", "src/index.js"];
        let paths = ["**.yml"];
        let files = pathMatch(changedFiles, paths);
        expect(files).to.deep.equal([".github/workflows/test.yml", ".github/workflows/main.yml"]);
    });

    test("file match", () => {
        let paths = ["index.js"];
        let files = pathMatch(changedFiles, paths);
        expect(files).to.deep.equal([]);
    });

    test("last positive match override previous negative match", () => {
        let paths = ["!.github/workflows/*", ".github/workflows/test.yml"];
        let files = pathMatch(changedFiles, paths);
        expect(files).to.deep.equal([".github/workflows/test.yml"]);
    });

    test("last negative match override previous positive match", () => {
        let paths = [".github/workflows/test.yml", "!.github/workflows/*"];
        let files = pathMatch(changedFiles, paths);
        expect(files).to.deep.equal([]);
    });
})



describe("ignore paths filter", () => {

    let changedFiles = [".github/workflows/pr.yml", "README.md", "src/index.js"];    
    test("ignore **", () => {
        let ignorePaths = ["**.yml", "**.md"];
        let files = ignoreFilter(changedFiles, ignorePaths);
        expect(files).to.deep.equal(["src/index.js"]);
    });
});