import * as core from '@actions/core';
import * as github from '@actions/github';
import {exec} from 'child_process';

import {getOctokitOptions, GitHub} from '@actions/github/lib/utils'


async function main() {
    if (!github.context.payload.pull_request) {
        core.error('No pull request found, exiting');
        return;
    }

    const {base_ref, head_ref} = github.context.payload.pull_request;
    const paths = github.getOctokit(core.getInput('paths'));


    const result = await exec("git diff --name-only " + base_ref + "..." + head_ref, (error, stdout, stderr) => { 
        if (error) {
            core.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            core.error(`stderr: ${stderr}`);
            return;
        }
        return stdout;
    });
}