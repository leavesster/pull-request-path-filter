import { describe, expect, test } from "vitest";
import { pathMatch, ignoreFilter } from "../src/index";

describe("path filter", () => {

    let changedFiles = [".github/workflows/test.yml", ".github/workflows/main.yml", "src/index.js"];
    test("positive match", () => {
        {
            let files = pathMatch(changedFiles, ["src/**"]);
            expect(files).to.deep.equal(["src/index.js"]);
        }

        {
            const files = pathMatch(changedFiles, ["**.js"]);
            expect(files).to.deep.equal(["src/index.js"]);
        }
        
        {
            const files = pathMatch(changedFiles, ["*.yml"]);
            expect(files, "* don't match '/'").length(0);
        }
    });

    test("glob ** match", () => {
        const changedFiles = [".github/workflows/test.yml", ".github/workflows/main.yml", "src/index.js"];
        let files = pathMatch(changedFiles, ["**.yml"]);
        expect(files.length).toBe(2);
    });

    test("file match", () => {

        let files = pathMatch(changedFiles, ["index.js"]);
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