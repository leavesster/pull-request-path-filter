import {test, expect} from 'vitest';
import {execShellCommand} from "../src/shell";


test('execShellCommand', async () => {
    const result = await execShellCommand('echo "Hello, World!"');
    expect(result).toBe('Hello, World!\n');
});

test("execShellCommand git diff log", async () => {
    const result = await execShellCommand('git diff --name-only 57acc29...4d5ee27');
    const lines = result.trim().split('\n');
    expect(lines, `${lines.join(",")}`).toHaveLength(2)
    expect(lines).toContain('package.json');
    expect(lines).toContain('test/shell.test.ts');
});