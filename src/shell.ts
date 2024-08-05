import {exec} from 'child_process';

export function execShellCommand(cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.warn(error);
                reject(error);
                return;
            }
            
            resolve(stdout? stdout : stderr);
        });
    });
}