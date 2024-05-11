"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphqlProjectRepository = void 0;
const axios_1 = __importDefault(require("axios"));
class GraphqlProjectRepository {
    constructor() {
        this.fetchProjectId = async (login, projectNumber) => {
            const token = process.env.GH_TOKEN;
            const graphqlQuery = {
                query: `query GetProjectID($login: String!, $number: Int!) {
  organization(login: $login) {
    projectV2(number: $number) {
      id
    }
  }
  user(login: $login){
    projectV2(number: $number){
      id
    }
  }
}`,
                variables: {
                    login: login,
                    number: projectNumber,
                },
            };
            const response = await (0, axios_1.default)({
                url: 'https://api.github.com/graphql',
                method: 'post',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                data: JSON.stringify(graphqlQuery),
            });
            const projectId = response.data.data.organization?.projectV2?.id ||
                response.data.data.user?.projectV2?.id;
            if (!projectId) {
                throw new Error('projectId is not found');
            }
            return projectId;
        };
    }
}
exports.GraphqlProjectRepository = GraphqlProjectRepository;
//# sourceMappingURL=GraphqlProjectRepository.js.map