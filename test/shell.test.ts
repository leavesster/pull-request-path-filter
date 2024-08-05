import {test, expect} from 'vitest';
import {execShellCommand} from "../src/shell";


test('execShellCommand', async () => {
    const result = await execShellCommand('echo "Hello, World!"');
    expect(result).toBe('Hello, World!\n');
});