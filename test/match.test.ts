import {isMatch, match} from "micromatch";
import { describe, expect } from "vitest";
import { test } from "vitest";

describe("is match api test", () => {

    test("positive match", () => {
        {
            const result = isMatch("src/a/b/index.js", "index.js");
            expect(result).toBe(false);
        }

        {
            const result = isMatch("src/a/b/index.js", "**.js");
            expect(result).toBe(true);
        }
    });

    test("negative match", () => {
        {
            const result = isMatch("src/a/b/index.js", "!**.ts");
            expect(result).toBe(true);
        }

        // FIXME: !**.js now return true, we need a workaround to make it return false
        {
            const result = isMatch("src/a/b/index.js", "!**.js");
            expect(result).toBe(true);
        }

    });

    test("multiple patterns", () => {
        {
            const result = isMatch("src/index.js", ["**.js", "!**.ts"]);
            expect(result).toBe(true);
        }

    });
});

describe("match api", () => {
    test("nest directory and dot path", () => {
        let changedFiles = [".github/workflows/pr.yml", "README.md", "src/index.js"];    
        const files = match(changedFiles, "**.yml", {dot: true});
        expect(files).to.deep.equal([".github/workflows/pr.yml"]);
    });

    test("multiple patterns and dot path", () => {
        let changedFiles = [".github/workflows/pr.yml", "README.md", "src/index.js"];    
        let paths = ["**.md", "**.yml", "**.js"];
        let files = match(changedFiles, paths, {dot: true});
        expect(files.sort()).to.deep.equal(changedFiles.sort());
    });
});