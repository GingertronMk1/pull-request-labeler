import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import * as fs from "fs";

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

      const config = yaml.safeLoad(fs.readFileSync(configPath), "utf8");

      const octokit = github.getOctokit(repoToken);

      console.table(JSON.stringify(config));
      const hr = pullRequest.head.ref;
      const br = pullRequest.base.ref;
      console.table({
        headref: hr,
        baseref: br
      });

     await addBranchLabels(config.head, hr, octokit, issue_number, owner, repo);
     await addBranchLabels(config.base, br, octokit, issue_number, owner, repo);

      if (config.files) {
        // this will be more difficult
        config.files.forEach((element, index) => {

        });
      }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

async function addBranchLabels(
  yamlArray: object[],
  comp: string,
  octokit,
  issue_number,
  owner,
  repo
) {
  if(yamlArray) {                                 // If the array exists
    yamlArray.forEach(element => {                // Iterate through it
      for(const prop in element) {                // It'll be an array of objects so iterate through that
        if(element[prop].includes(comp)) {        // If the attribute label equals comp string
          octokit.issues.addLabels({issue_number, owner, repo, labels: [prop] }); // Add labels
        }
      }
      
    });
  }

}


run();
