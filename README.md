# Action Path Filtering

A workaround action for [handling-skipped-but-required-checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/troubleshooting-required-status-checks#handling-skipped-but-required-checks).
Please note that this action is not a perfect solution, it's just a workaround. **It's just work for `pull_request` and `pull_request_target` events, and it's not work for `push` event**.

## Inputs

just like github action's [path and paths-ignore](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions#onpushpull_requestpull_request_targetpathspaths-ignore). The only difference is that you need add `|` at the beginning.

```yaml
name: pull request
on:
  pull_request: # or pull_request_target, this action only works for these two events
    # paths: 
    #   - "src/**" just move to the action's input
jobs:
  path-filter:
    runs-on: ubuntu-latest
    outputs:
      should_skip: ${{ steps.filter.outputs.should_skip }}
    steps:
      - uses: actions/checkout@v4 # better this action use git diff, so you need checkout the code first
        with:
          filter: blob:none # reduce clone size
          fetch-depth: 0 # need full history, the default is 1, which is not enough. if you limit the pull request' commit length, you can set it to your limit.
      - uses: leavesster/pull-request-path-filter@v0.2 # v0.2 is the latest version
        id: "filter"
        with:
          paths: | # notice the `|`, it's required. the left is same as github action's path and paths-ignore
            - "src/**"
  path-echo:
    runs-on: ubuntu-latest
    needs: path-filter
    if: ${{ needs.path-filter.outputs.should_skip != 'true' }} # skip the job still report status check as success.
    steps:
      - run: echo "path hit"
```

## Outputs

### `should_skip`
`should_skip` is a boolean value, it's `true` if the pull request should be skipped, otherwise `false`.

### `changed_files`
`changed_files` is a string list, it's the changed files in the pull request.
