import { BaseGitHubRepository } from './BaseGitHubRepository';
export declare class GraphqlProjectItemRepository extends BaseGitHubRepository {
    fetchItemId: (projectId: string, owner: string, repositoryName: string, issueNumber: number) => Promise<string | undefined>;
    fetchProjectItems: (projectId: string) => Promise<{
        nameWithOwner: string;
        number: number;
        title: string;
        state: 'OPEN' | 'CLOSED' | 'MERGED';
        url: string;
    }[]>;
    getProjectItemFieldsFromIssueUrl: (issueUrl: string) => Promise<{
        fieldName: string;
        fieldValue: string;
    }[]>;
    getProjectItemFields: (owner: string, repositoryName: string, issueNumber: number) => Promise<{
        fieldName: string;
        fieldValue: string;
    }[]>;
}
