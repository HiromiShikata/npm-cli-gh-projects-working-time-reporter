"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlProjectItemRepository = void 0;
const axios_1 = __importDefault(require("axios"));
const BaseGitHubRepository_1 = require("./BaseGitHubRepository");
class GraphqlProjectItemRepository extends BaseGitHubRepository_1.BaseGitHubRepository {
    constructor() {
        super(...arguments);
        this.fetchItemId = async (projectId, owner, repositoryName, issueNumber) => {
            const graphqlQuery = {
                query: `query GetProjectItemID( $owner: String!, $name: String!, $issueNumber: Int!) {
  repository(owner: $owner, name: $name) {
    issue(number: $issueNumber) {
      projectItems(first: 2) {
        nodes {
          id
          project {
            id
          }
        }
      }
    }
  }
}`,
                variables: {
                    projectID: projectId,
                    owner: owner,
                    name: repositoryName,
                    issueNumber: issueNumber,
                },
            };
            try {
                const response = await (0, axios_1.default)({
                    url: 'https://api.github.com/graphql',
                    method: 'post',
                    headers: {
                        Authorization: `Bearer ${this.ghToken}`,
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(graphqlQuery),
                });
                const projectItems = response.data.data.repository.issue.projectItems.nodes;
                const projectItemId = projectItems.find((item) => item.project.id === projectId)?.id;
                return projectItemId;
            }
            catch (error) {
                console.error('Error fetching GitHub Project V2 ID:', error);
                return undefined;
            }
        };
        this.fetchProjectItems = async (projectId) => {
            const graphqlQueryString = `
    query GetProjectItems($after: String, $projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      items(first: 100, after: $after) {
        totalCount
        pageInfo {
          endCursor
          startCursor
        }
        nodes {
          content {
            ... on Issue {
              number
              title
              state
              number
              url
              repository {
                nameWithOwner
              }
            }
            ... on PullRequest {
              number
              title
              state
              number
              url
              repository {
                nameWithOwner
              }
            }
          }
        }
      }
    }
  }
}
`;
            const callGraphql = async (projectId, after) => {
                const graphqlQuery = {
                    query: graphqlQueryString,
                    variables: {
                        projectId: projectId,
                        after: after,
                    },
                };
                const response = await (0, axios_1.default)({
                    url: 'https://api.github.com/graphql',
                    method: 'post',
                    headers: {
                        Authorization: `Bearer ${this.ghToken}`,
                        'Content-Type': 'application/json',
                    },
                    data: JSON.stringify(graphqlQuery),
                });
                return response.data.data;
            };
            const issues = [];
            let after = null;
            let totalCount = 1;
            while (issues.length < totalCount) {
                const data = await callGraphql(projectId, after);
                const projectItems = data.node.items.nodes;
                projectItems
                    // .filter(item => item.content.repository !== undefined)
                    .forEach((item) => {
                    issues.push({
                        nameWithOwner: item.content.repository.nameWithOwner,
                        number: item.content.number,
                        title: item.content.title,
                        state: item.content.state === 'MERGED'
                            ? 'MERGED'
                            : item.content.state === 'CLOSED'
                                ? 'CLOSED'
                                : item.content.state === 'OPEN'
                                    ? 'OPEN'
                                    : 'OPEN',
                        url: item.content.url,
                    });
                });
                totalCount = data.node.items.totalCount;
                const pageInfo = data.node.items.pageInfo;
                after = pageInfo.endCursor;
            }
            return issues;
        };
        this.getProjectItemFieldsFromIssueUrl = async (issueUrl) => {
            const { owner, repo, issueNumber } = this.extractIssueFromUrl(issueUrl);
            return this.getProjectItemFields(owner, repo, issueNumber);
        };
        this.getProjectItemFields = async (owner, repositoryName, issueNumber) => {
            const graphqlQueryString = `
query GetProjectFields($owner: String!, $repository: String!, $issueNumber: Int!){
  repository(owner: $owner, name: $repository) {
    issue(number: $issueNumber) {
      projectItems(first: 2) {
        nodes {
          id
          fieldValues(first: 10) {
            totalCount
            nodes {
              __typename
              ... on ProjectV2ItemFieldDateValue {
                date
                field {
                  ... on ProjectV2Field {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldSingleSelectValue {
                name
                field {
                  ... on ProjectV2SingleSelectField {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldUserValue {
                users {
                  totalCount
                  nodes {
                    login
                  }
                }
                field {
                  ... on ProjectV2Field {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldRepositoryValue {
                repository {
                  name
                }
                field {
                  __typename
                  ... on ProjectV2Field {
                    name
                  }
                }
              }
              ... on ProjectV2ItemFieldTextValue {
                text
              }
            }
          }
        }
      }
    }
  }
}

`;
            const graphqlQuery = {
                query: graphqlQueryString,
                variables: {
                    owner: owner,
                    repository: repositoryName,
                    issueNumber: issueNumber,
                },
            };
            const response = await (0, axios_1.default)({
                url: 'https://api.github.com/graphql',
                method: 'post',
                headers: {
                    Authorization: `Bearer ${this.ghToken}`,
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(graphqlQuery),
            });
            const data = response.data.data;
            const issueFields = [];
            if (!data.repository.issue) {
                return issueFields;
            }
            const projectItems = data.repository.issue.projectItems.nodes[0].fieldValues.nodes;
            projectItems.forEach((item) => {
                issueFields.push({
                    fieldName: item.field?.name ?? '',
                    fieldValue: item.date ??
                        item.name ??
                        item.text ??
                        item.repository?.name ??
                        item.user?.login ??
                        '',
                });
            });
            return issueFields;
        };
    }
}
exports.GraphqlProjectItemRepository = GraphqlProjectItemRepository;
//# sourceMappingURL=GraphqlProjectItemRepository.js.map