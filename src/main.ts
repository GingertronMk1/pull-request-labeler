import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { Minimatch } from "minimatch";

async function run() {
  try {
    const context = github.context;
    const pullRequest = context.payload.pull_request;
    // console.log(context.payload);
    if (!pullRequest) {
      throw new Error("No pull request information found");
    }
    const {
      issue: { number: issue_number },
      repo: { owner, repo },
    } = context;
    const repoToken = core.getInput("repo-token", { required: true });
    const configPath = core.getInput("configuration-path", {
      required: true,
    });

    const config = yaml.safeLoad(fs.readFileSync(configPath), "utf8");

    const octokit = github.getOctokit(repoToken);

    const hr = pullRequest.head.ref;
    const br = pullRequest.base.ref;

    await addBranchLabels(config.head, hr, octokit, issue_number, owner, repo);
    await addBranchLabels(config.base, br, octokit, issue_number, owner, repo);


    const files = await getChangedFiles(octokit, issue_number, owner, repo);
    console.log(files);
    await addFileLabels(config.files, files, octokit, issue_number, owner, repo);

    if (config.files) {
      // this will be more difficult
      config.files.forEach((element, index) => {});
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

async function addBranchLabels(
  yamlArray: object[],
  comp: string,
  octokit: any, // I don't know what the specific type of an octokit is - apparently not an object
  issue_number: number,
  owner: string,
  repo: string
) {
  if (yamlArray) {
    // If the array exists
    yamlArray.forEach((element) => {
      // Iterate through it
      for (const label in element) {
        // It'll be an array of objects so iterate through that
        element[label].forEach((pattern) => {
          var mm = new Minimatch(pattern);
          if(mm.match(comp)) {
            octokit.issues.addLabels({
              issue_number,
              owner,
              repo,
              labels: [label],
            }); // Add labels
          };
        })
      }
    })
  }
}

async function addFileLabels(
  config: object[],
  files: string[],
  octokit: any,
  issue_number: number,
  owner: string,
  repo: string
) {
  if(config) {
    config.forEach((element) => {
      for(const label in element) {
        element[label].forEach((pattern) => {
          var mm = new Minimatch(pattern);
          files.forEach((file) => {
            if(mm.match(file)) {
              octokit.issues.addLabels({
                issue_number,
                owner,
                repo,
                labels: [label],
              }); // Add labels
            }
          })
        })
      }
    })
  }
}

async function getChangedFiles(
  client: any,
  prNumber: number,
  owner: string,
  repo: string
): Promise<string[]> {
  const listFilesOptions = client.pulls.listFiles.endpoint.merge({
    owner: owner,
    repo: repo,
    pull_number: prNumber
  });

  const listFilesResponse = await client.paginate(listFilesOptions);
  const changedFiles = listFilesResponse.map(f => f.filename);

  core.debug("found changed files:");
  for (const file of changedFiles) {
    core.debug("  " + file);
  }

  return changedFiles;
}


run();
