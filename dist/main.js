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
        var context, pullRequest, issue_number, _a, owner, repo, repoToken, configPath, config, octokit, hr, br, files, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    context = github.context;
                    pullRequest = context.payload.pull_request;
                    // console.log(context.payload);
                    if (!pullRequest) {
                        throw new Error("No pull request information found");
                    }
                    issue_number = context.issue.number, _a = context.repo, owner = _a.owner, repo = _a.repo;
                    repoToken = core.getInput("repo-token", { required: true });
                    configPath = core.getInput("configuration-path", {
                        required: true,
                    });
                    config = yaml.safeLoad(fs.readFileSync(configPath), "utf8");
                    octokit = github.getOctokit(repoToken);
                    hr = pullRequest.head.ref;
                    br = pullRequest.base.ref;
                    return [4 /*yield*/, addBranchLabels(config.head, hr, octokit, issue_number, owner, repo)];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, addBranchLabels(config.base, br, octokit, issue_number, owner, repo)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, getChangedFiles(octokit, issue_number)];
                case 3:
                    files = _b.sent();
                    console.log(files);
                    if (config.files) {
                        // this will be more difficult
                        config.files.forEach(function (element, index) { });
                    }
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _b.sent();
                    core.error(error_1);
                    core.setFailed(error_1.message);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
function addBranchLabels(yamlArray, comp, octokit, // I don't know what the specific type of an octokit is - apparently not an object
issue_number, owner, repo) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (yamlArray) {
                // If the array exists
                yamlArray.forEach(function (element) {
                    var _loop_1 = function (label) {
                        // It'll be an array of objects so iterate through that
                        element[label].forEach(function (pattern) {
                            var mm = new minimatch_1.Minimatch(pattern);
                            if (mm.match(comp)) {
                                octokit.issues.addLabels({
                                    issue_number: issue_number,
                                    owner: owner,
                                    repo: repo,
                                    labels: [label],
                                }); // Add labels
                            }
                            ;
                        });
                    };
                    // Iterate through it
                    for (var label in element) {
                        _loop_1(label);
                    }
                });
            }
            return [2 /*return*/];
        });
    });
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
                        pull_number: prNumber
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
run();
