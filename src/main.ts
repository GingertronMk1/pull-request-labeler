import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import * as fs from "fs";
import { Minimatch } from "minimatch";

async function run() {
  try {
    const context = github.context;
    const pullRequest = context.payload.pull_request;
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
    const files = await getChangedFiles(octokit, issue_number, owner, repo);

    await addBranchLabels(config.head, hr, octokit, issue_number, owner, repo);
    await addBranchLabels(config.base, br, octokit, issue_number, owner, repo);

    await addFileLabels(
      config.files,
      files,
      octokit,
      issue_number,
      owner,
      repo
    );
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
  if (yamlArray) {                              // If congi array exists
    const labels: string[] = [];                // Create empty array of labels to push
    yamlArray.forEach((element) => {            // For each object in the config...
      for (const label in element) {            // For each attribute of the object...
        element[label].forEach((pattern) => {   // For each item in the array that is that attribute...
          var mm = new Minimatch(pattern);      // Make a new minimatch
          if (mm.match(comp)) {                 // If the string matches
            labels.push(label);                 // Add the label to push
          }
        });
      }
    });
    return octokit.issues.addLabels({
      issue_number,
      owner,
      repo,
      labels: labels,
    }); // Add labels
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
  if (config) {                                 // If the config exists
    const labels: string[] = [];                // Make an accumulator variable
    config.forEach((element) => {               // For each element in the config
      for (const label in element) {            // For label in config
        element[label].forEach((pattern) => {   // Iterate through the matches associated with it
          var mm = new Minimatch(pattern);      // Create a new minimatcher
          files.forEach((file) => {             // For each file changed
            if (mm.match(file)) {               // If its path matches the glob
              labels.push(label);               // Add the label to the array to be added to the PR
            }
          });
        });
      }
    });

    return octokit.issues.addLabels({
      issue_number,
      owner,
      repo,
      labels: labels,
    }); // Add labels
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

run();
