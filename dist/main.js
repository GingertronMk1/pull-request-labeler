"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
var yaml = __importStar(require("js-yaml"));
var fs = __importStar(require("fs"));
var minimatch_1 = require("minimatch");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var token, configPath, syncLabels, config, payload, pr, prNumber, octokit;
        return __generator(this, function (_a) {
            try {
                token = core.getInput("repo-token", { required: true });
                configPath = core.getInput("configuration-path", {
                    required: true,
                });
                syncLabels = !!core.getInput("sync-labels", { required: false });
                config = yaml.safeLoad(fs.readFileSync(configPath), 'utf8');
                payload = github.context.payload;
                pr = payload.pull_request;
                if (!pr) {
                    throw new Error("No pull request found");
                }
                console.log(pr);
                console.log(config);
                prNumber = pr.number;
                if (!prNumber) {
                    console.log(github.context.payload);
                    console.error("Could not get pull request number from context, exiting");
                    return [2 /*return*/];
                }
                octokit = github.getOctokit(token);
                if (config.head) {
                    // apply labels based upon the name of the head branch
                    octokit.client.addLabels(payload.user.name, payload.base.repo.name, prNumber, ['hello', 'world']);
                }
                if (config.base) {
                    // apply labels based upon the name of the base branch
                }
                if (config.files) {
                    // apply labels based upon the files in question
                }
            }
            catch (error) {
                core.error(error);
                core.setFailed(error.message);
            }
            return [2 /*return*/];
        });
    });
}
function getPrNumber() {
    var pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
        return undefined;
    }
    return pullRequest.number;
}
function getChangedFiles(client, prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var listFilesOptions, listFilesResponse, changedFiles, _i, changedFiles_1, file;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    listFilesOptions = client.pulls.listFiles.endpoint.merge({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        pull_number: prNumber,
                    });
                    return [4 /*yield*/, client.paginate(listFilesOptions)];
                case 1:
                    listFilesResponse = _a.sent();
                    changedFiles = listFilesResponse.map(function (f) { return f.filename; });
                    core.debug("found changed files:");
                    for (_i = 0, changedFiles_1 = changedFiles; _i < changedFiles_1.length; _i++) {
                        file = changedFiles_1[_i];
                        core.debug("  " + file);
                    }
                    return [2 /*return*/, changedFiles];
            }
        });
    });
}
function getLabelGlobs(client, configurationPath) {
    return __awaiter(this, void 0, void 0, function () {
        var configurationContent, configObject;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchContent(client, configurationPath)];
                case 1:
                    configurationContent = _a.sent();
                    configObject = yaml.safeLoad(configurationContent);
                    // transform `any` => `Map<string,StringOrMatchConfig[]>` or throw if yaml is malformed:
                    return [2 /*return*/, getLabelGlobMapFromObject(configObject)];
            }
        });
    });
}
function fetchContent(client, repoPath) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.repos.getContents({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        path: repoPath,
                        ref: github.context.sha,
                    })];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, Buffer.from(response.data.content, response.data.encoding).toString()];
            }
        });
    });
}
function getLabelGlobMapFromObject(configObject) {
    var labelGlobs = new Map();
    for (var label in configObject) {
        if (typeof configObject[label] === "string") {
            labelGlobs.set(label, [configObject[label]]);
        }
        else if (configObject[label] instanceof Array) {
            labelGlobs.set(label, configObject[label]);
        }
        else {
            throw Error("found unexpected type for label " + label + " (should be string or array of globs)");
        }
    }
    return labelGlobs;
}
function toMatchConfig(config) {
    if (typeof config === "string") {
        return {
            any: [config],
        };
    }
    return config;
}
function printPattern(matcher) {
    return (matcher.negate ? "!" : "") + matcher.pattern;
}
function checkGlobs(changedFiles, globs) {
    for (var _i = 0, globs_1 = globs; _i < globs_1.length; _i++) {
        var glob = globs_1[_i];
        core.debug(" checking pattern " + JSON.stringify(glob));
        var matchConfig = toMatchConfig(glob);
        if (checkMatch(changedFiles, matchConfig)) {
            return true;
        }
    }
    return false;
}
function isMatch(changedFile, matchers) {
    core.debug("    matching patterns against file " + changedFile);
    for (var _i = 0, matchers_1 = matchers; _i < matchers_1.length; _i++) {
        var matcher = matchers_1[_i];
        core.debug("   - " + printPattern(matcher));
        if (!matcher.match(changedFile)) {
            core.debug("   " + printPattern(matcher) + " did not match");
            return false;
        }
    }
    core.debug("   all patterns matched");
    return true;
}
// equivalent to "Array.some()" but expanded for debugging and clarity
function checkAny(changedFiles, globs) {
    var matchers = globs.map(function (g) { return new minimatch_1.Minimatch(g); });
    core.debug("  checking \"any\" patterns");
    for (var _i = 0, changedFiles_2 = changedFiles; _i < changedFiles_2.length; _i++) {
        var changedFile = changedFiles_2[_i];
        if (isMatch(changedFile, matchers)) {
            core.debug("  \"any\" patterns matched against " + changedFile);
            return true;
        }
    }
    core.debug("  \"any\" patterns did not match any files");
    return false;
}
// equivalent to "Array.every()" but expanded for debugging and clarity
function checkAll(changedFiles, globs) {
    var matchers = globs.map(function (g) { return new minimatch_1.Minimatch(g); });
    core.debug(" checking \"all\" patterns");
    for (var _i = 0, changedFiles_3 = changedFiles; _i < changedFiles_3.length; _i++) {
        var changedFile = changedFiles_3[_i];
        if (!isMatch(changedFile, matchers)) {
            core.debug("  \"all\" patterns did not match against " + changedFile);
            return false;
        }
    }
    core.debug("  \"all\" patterns matched all files");
    return true;
}
function checkMatch(changedFiles, matchConfig) {
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
function addLabels(client, prNumber, labels) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, client.issues.addLabels({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        issue_number: prNumber,
                        labels: labels,
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function removeLabels(client, prNumber, labels) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(labels.map(function (label) {
                        return client.issues.removeLabel({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            issue_number: prNumber,
                            name: label,
                        });
                    }))];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function JSONprint(json) {
    return console.log(JSON.stringify(json));
}
console.log("Running");
run();
