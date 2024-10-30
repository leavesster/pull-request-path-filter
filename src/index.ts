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

    core.debug('event: ' + JSON.stringify(github.context.payload.pull_request));

    const {base, head} = github.context.payload.pull_request;
    
    const changedFiles = await getChangedFiles(base.sha, head.sha);
    
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

    core.info('changed files: ' + changedFiles);
    if (paths.length > 0) {
        const pathsArray = transformToArray(paths);
        const files = pathMatch(changedFiles, pathsArray);
        core.info('paths: ' + pathsArray);
        core.info('Matched files: ' + files);
        core.setOutput('changed_files', changedFiles);
        core.setOutput('should_skip', files.length == 0);
        return;
    }

    if (pathsIgnore.length > 0) {
        const pathsIgnoreArray = transformToArray(pathsIgnore);
        const files = ignoreFilter(changedFiles, pathsIgnoreArray);
        core.info('paths-ignore: ' + pathsIgnoreArray);
        core.info('Result files after ignore: ' + files);
        core.setOutput('changed_files', changedFiles);
        core.setOutput('should_skip', files.length == 0);
        return;
    }
}

export function pathMatch(changedFiles: string[], paths_pattern: string[]): string[] {
    const set = new Set<string>();
    for (const p of paths_pattern) {

        if (p.startsWith('!')) {
            const files = micromatch.match(changedFiles, p.substring(1), {dot: true});
            for (const f of files) {
                set.delete(f);
            }
            continue;
        }
        const files = micromatch.match(changedFiles, p, {dot: true});
        for (const f of files) {
            set.add(f);
        }
    }
    return Array.from(set);
}

export function ignoreFilter(changedFiles: string[], paths_pattern: string[]): string[] {
    return micromatch.not(changedFiles, paths_pattern, {dot: true});
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

async function ensureRefAvailable(ref: string): Promise<void> {
    const result = await execShellCommand('git fetch --depth=1 --filter=blob:none --no-tags origin' + ref);
}

async function getChangedFiles(base_ref: string, head_ref: string): Promise<string[]> {
    await ensureRefAvailable(base_ref);
    const result = await execShellCommand('git diff --name-only ' + base_ref + '...' + head_ref);
    const lines = result.trim().split('\n');
    return lines;
}

main();