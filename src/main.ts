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



      const config = yaml.safeLoad(fs.readFileSync(configPath), "utf8");

      const octokit = github.getOctokit(repoToken);

      console.table(JSON.stringify(config));
      const hr = pullRequest.head.ref;
      const br = pullRequest.base.ref;
      console.table({
        headref: hr,
        baseref: br
      });

      /*
      if (config.head) {
        config.head.forEach(element => {
          for(const prop in element) {
            console.table({
              headref: hr,
              prop: prop,
              chprop: element[prop]
            })
            if(prop === hr) {
              octokit.issues.addLabels({issue_number, owner, repo, labels: element[prop] })
            }
          }
        });
      }
      if (config.base) {
        config.base.forEach(element => {
          for(const prop in element) {
            console.table({
              baseref: br,
              prop: prop,
              chprop: element[prop]
            })
            if(prop === br) {
              octokit.issues.addLabels({issue_number, owner, repo, labels: element[prop] })
            }
          }
        });
      }
      */
     await addLabels(config.head, hr, octokit, issue_number, owner, repo);
     await addLabels(config.base, br, octokit, issue_number, owner, repo);

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

async function addLabels(
  yamlArray: object[],
  comp: string,
  octokit,
  issue_number,
  owner,
  repo
) {
  if(yamlArray) {
    yamlArray.forEach(element => {
      for(const prop in element) {
        if(prop === comp) {
          octokit.issues.addLabels({issue_number, owner, repo, labels: element[prop]});
        }
      }
      
    });
  }

}


run();
