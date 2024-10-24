import {test, expect} from 'vitest';
import {execShellCommand} from "../src/shell";


test('execShellCommand', async () => {
    const result = await execShellCommand('echo "Hello, World!"');
    expect(result).toBe('Hello, World!\n');
});

test("execShellCommand git diff log", async () => {
    const result = await execShellCommand('git diff --name-only 8b12d3f9fc26044ac74bab2180e3277ca26118c1...27f7be7e8bedc990954bc488d3690c86ec550008');
    const lines = result.trim().split('\n');
    expect(lines, `${lines.join(",")}`).toHaveLength(1)
    expect(lines).toContain('package.json');
});