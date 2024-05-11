"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestIssueRepository = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseGitHubRepository_1 = require("./BaseGitHubRepository");
class RestIssueRepository extends BaseGitHubRepository_1.BaseGitHubRepository {
    constructor() {
        super(...arguments);
        this.createComment = async (issueUrl, comment) => {
            const { owner, repo, issueNumber } = this.extractIssueFromUrl(issueUrl);
            const response = await axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`, {
                body: comment,
            }, {
                headers: {
                    Authorization: `token ${this.ghToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status !== 201) {
                throw new Error(`Failed to create comment: ${response.status}`);
            }
        };
        this.createNewIssue = async (owner, repo, title, body, assignees, labels) => {
            const response = await axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/issues`, {
                title,
                body,
                assignees,
                labels,
            }, {
                headers: {
                    Authorization: `token ${this.ghToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status !== 201) {
                throw new Error(`Failed to create issue: ${response.status}`);
            }
        };
    }
}
exports.RestIssueRepository = RestIssueRepository;
//# sourceMappingURL=RestIssueRepository.js.map