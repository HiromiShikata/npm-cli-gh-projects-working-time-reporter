import { BaseGitHubRepository } from './BaseGitHubRepository';
export declare class RestIssueRepository extends BaseGitHubRepository {
    createComment: (issueUrl: string, comment: string) => Promise<void>;
    createNewIssue: (owner: string, repo: string, title: string, body: string, assignees: string[], labels: string[]) => Promise<void>;
}
