import axios from 'axios';
import { BaseGitHubRepository } from './BaseGitHubRepository';

export class RestIssueRepository extends BaseGitHubRepository {
  createComment = async (issueUrl: string, comment: string) => {
    const { owner, repo, issueNumber } = this.extractIssueFromUrl(issueUrl);
    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      {
        body: comment,
      },
      {
        headers: {
          Authorization: `token ${this.ghToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.status !== 201) {
      throw new Error(`Failed to create comment: ${response.status}`);
    }
  };
}
