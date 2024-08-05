import * as core from '@actions/core';
import * as github from '@actions/github';
import * as micromatch  from "micromatch";
import { execShellCommand } from './shell';
import yaml from 'js-yaml';

async function main() {
    if (!github.context.payload.pull_request) {
        core.error('No pull request found, exiting');
        return;
    }

    core.debug('event: ' + github.context.payload.pull_request);

    const {base_ref, head_ref} = github.context.payload.pull_request;
    
    const changedFiles = await getChangedFiles(base_ref, head_ref);
    
    if (changedFiles.length === 0) {
        core.info('No files changed, exiting');
        core.setOutput('changed_files', []);
        core.setOutput('should_skip', true);
        return;
    }
    
    
    const paths = core.getInput('paths');
    const pathsIgnore =core.getInput('paths-ignore');

    if (paths.length > 0 && pathsIgnore.length > 0) {
        core.error('Both paths and paths-ignore are set, exiting');
        process.exit(1);
    }

    if (paths.length === 0 && pathsIgnore.length === 0) {
        core.info('No paths or paths-ignore set, exiting');
        core.setOutput('changed_files', changedFiles);
        core.setOutput('should_skip', true);
        process.exit(1);
    }

    if (paths.length > 0) {
        const pathsArray = transformToArray(paths);
        const hit = changedFiles.some(file => micromatch.isMatch(file, pathsArray, {}));
        core.setOutput('changed_files', changedFiles);
        core.setOutput('should_skip', !hit);
        return;
    }

    if (pathsIgnore.length > 0) {
        const pathsIgnoreArray = transformToArray(pathsIgnore);
        const ignoreAll = changedFiles.every(file => micromatch.isMatch(file, pathsIgnoreArray, {}));
        core.setOutput('changed_files', changedFiles);
        core.setOutput('should_skip', ignoreAll);
        return;
    }
}

function transformToArray(raw: string): string[] {
    try {
        const list = yaml.load(raw);
        if (!Array.isArray(list)) {
            core.warning(`${raw} is not an array, returning empty array`);
            return [];
        }
        return list;
    } catch (error) {
        return [];
    }
}

async function getChangedFiles(base_ref: string, head_ref: string): Promise<string[]> {
    const result = await execShellCommand('git diff --name-only ' + base_ref + '...' + head_ref);
    const lines = result.trim().split('\n');
    return lines;
}

main();