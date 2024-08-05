import * as micromatch from "micromatch";
import { expect } from "chai";
import { test } from "vitest";

test("glob", () => {
    const result = micromatch(["foo.txt", "bar.txt", "baz.txt"], "*.txt", {});
    expect(result).to.deep.equal(["foo.txt", "bar.txt", "baz.txt"]);
});