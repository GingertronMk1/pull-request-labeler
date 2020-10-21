import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { Minimatch, IMinimatch } from "minimatch";
import { getOctokitOptions, GitHub } from "@actions/github/lib/utils";

interface MatchConfig {
  all?: string[];
  any?: string[];
}

type StringOrMatchConfig = string | MatchConfig;

async function run() {
  try {
      const pullRequest = github.context.payload.pull_request;
      if(!pullRequest) {
        throw new Error("No pull request information found");
      }

      const { issue: { number: issue_number }, repo: { owner, repo }  } = github.context;
      const repoToken = core.getInput("repo-token", {required: true});
      const configPath = core.getInput("configuration-path", {
        required: true,
      });

      // console.log(github.context.payload.pull_request);

      const config = yaml.safeLoad(fs.readFileSync(configPath), "utf8");

      const octokit = github.getOctokit(repoToken);

      // octokit.issues.addLabels({issue_number, owner, repo, labels: ["Hello", "World"] })
      // console.log(config);
      console.table({
        headref: pullRequest.head.ref,
        baseref: pullRequest.base.ref
      });

      if (config.head) {
        config.head.forEach((element, index) => {
          console.table({
            prhead: pullRequest.head.ref,
            comphead: index
          })
          if(pullRequest.head.ref == index) {
            octokit.issues.addLabels({issue_number, owner, repo, labels: element })
          }
        });
      }

      if (config.base) {
        config.base.forEach((element, index) => {
          console.table({
            prbase: pullRequest.base.ref,
            comphead: index
          })
          if(pullRequest.base.ref == index) {
            octokit.issues.addLabels({issue_number, owner, repo, labels: element })
          }
        });
      }

      if (config.files) {
        config.files.forEach((element, index) => {
          // console.log(index, '=>', element);
        });
      }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function getPrNumber(): number | undefined {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return undefined;
  }

  return pullRequest.number;
}

async function getChangedFiles(client, prNumber: number): Promise<string[]> {
  const listFilesOptions = client.pulls.listFiles.endpoint.merge({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  const listFilesResponse = await client.paginate(listFilesOptions);
  const changedFiles = listFilesResponse.map((f) => f.filename);

  core.debug("found changed files:");
  for (const file of changedFiles) {
    core.debug("  " + file);
  }

  return changedFiles;
}

async function getLabelGlobs(
  client,
  configurationPath: string
): Promise<Map<string, StringOrMatchConfig[]>> {
  const configurationContent: string = await fetchContent(
    client,
    configurationPath
  );

  // loads (hopefully) a `{[label:string]: string | StringOrMatchConfig[]}`, but is `any`:
  const configObject: any = yaml.safeLoad(configurationContent);

  // transform `any` => `Map<string,StringOrMatchConfig[]>` or throw if yaml is malformed:
  return getLabelGlobMapFromObject(configObject);
}

async function fetchContent(client, repoPath: string): Promise<string> {
  const response: any = await client.repos.getContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: repoPath,
    ref: github.context.sha,
  });

  return Buffer.from(response.data.content, response.data.encoding).toString();
}

function getLabelGlobMapFromObject(
  configObject: any
): Map<string, StringOrMatchConfig[]> {
  const labelGlobs: Map<string, StringOrMatchConfig[]> = new Map();
  for (const label in configObject) {
    if (typeof configObject[label] === "string") {
      labelGlobs.set(label, [configObject[label]]);
    } else if (configObject[label] instanceof Array) {
      labelGlobs.set(label, configObject[label]);
    } else {
      throw Error(
        `found unexpected type for label ${label} (should be string or array of globs)`
      );
    }
  }

  return labelGlobs;
}

function toMatchConfig(config: StringOrMatchConfig): MatchConfig {
  if (typeof config === "string") {
    return {
      any: [config],
    };
  }

  return config;
}

function printPattern(matcher: IMinimatch): string {
  return (matcher.negate ? "!" : "") + matcher.pattern;
}

function checkGlobs(
  changedFiles: string[],
  globs: StringOrMatchConfig[]
): boolean {
  for (const glob of globs) {
    core.debug(` checking pattern ${JSON.stringify(glob)}`);
    const matchConfig = toMatchConfig(glob);
    if (checkMatch(changedFiles, matchConfig)) {
      return true;
    }
  }
  return false;
}

function isMatch(changedFile: string, matchers: IMinimatch[]): boolean {
  core.debug(`    matching patterns against file ${changedFile}`);
  for (const matcher of matchers) {
    core.debug(`   - ${printPattern(matcher)}`);
    if (!matcher.match(changedFile)) {
      core.debug(`   ${printPattern(matcher)} did not match`);
      return false;
    }
  }

  core.debug(`   all patterns matched`);
  return true;
}

// equivalent to "Array.some()" but expanded for debugging and clarity
function checkAny(changedFiles: string[], globs: string[]): boolean {
  const matchers = globs.map((g) => new Minimatch(g));
  core.debug(`  checking "any" patterns`);
  for (const changedFile of changedFiles) {
    if (isMatch(changedFile, matchers)) {
      core.debug(`  "any" patterns matched against ${changedFile}`);
      return true;
    }
  }

  core.debug(`  "any" patterns did not match any files`);
  return false;
}

// equivalent to "Array.every()" but expanded for debugging and clarity
function checkAll(changedFiles: string[], globs: string[]): boolean {
  const matchers = globs.map((g) => new Minimatch(g));
  core.debug(` checking "all" patterns`);
  for (const changedFile of changedFiles) {
    if (!isMatch(changedFile, matchers)) {
      core.debug(`  "all" patterns did not match against ${changedFile}`);
      return false;
    }
  }

  core.debug(`  "all" patterns matched all files`);
  return true;
}

function checkMatch(changedFiles: string[], matchConfig: MatchConfig): boolean {
  if (matchConfig.all !== undefined) {
    if (!checkAll(changedFiles, matchConfig.all)) {
      return false;
    }
  }

  if (matchConfig.any !== undefined) {
    if (!checkAny(changedFiles, matchConfig.any)) {
      return false;
    }
  }

  return true;
}

async function addLabels(client, prNumber: number, labels: string[]) {
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: labels,
  });
}

async function removeLabels(client, prNumber: number, labels: string[]) {
  await Promise.all(
    labels.map((label) =>
      client.issues.removeLabel({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        issue_number: prNumber,
        name: label,
      })
    )
  );
}

function JSONprint(json: JSON) {
  return console.log(JSON.stringify(json));
}

run();
