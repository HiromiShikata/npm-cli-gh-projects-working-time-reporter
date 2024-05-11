import * as cheerio from 'cheerio';
import { BaseGitHubRepository } from './BaseGitHubRepository';
type Issue = {
    url: string;
    title: string;
    status: string;
    assignees: string[];
    labels: string[];
    project: string;
    statusTimeline: IssueStatusTimeline[];
};
type IssueStatusTimeline = {
    time: string;
    author: string;
    from: string;
    to: string;
};
type IssueInProgressTimeline = {
    issueUrl: string;
    author: string;
    start: string;
    end: string;
};
export declare class CheerioIssueRepository extends BaseGitHubRepository {
    getIssue: (issueUrl: string) => Promise<Issue>;
    getStatusTimelineEvents: (issueUrl: string) => Promise<IssueStatusTimeline[]>;
    protected getTitleFromCheerioObject: ($: cheerio.CheerioAPI) => string;
    protected getStatusFromCheerioObject: ($: cheerio.CheerioAPI) => string;
    protected getAssigneesFromCheerioObject: ($: cheerio.CheerioAPI) => string[];
    protected getLabelsFromCheerioObject: ($: cheerio.CheerioAPI) => string[];
    protected getProjectFromCheerioObject: ($: cheerio.CheerioAPI) => string;
    protected getStatusTimelineEventsFromCheerioObject: ($: cheerio.CheerioAPI, issueUrl: string) => IssueStatusTimeline[];
    getInProgressTimeline: (issueUrl: string) => Promise<IssueInProgressTimeline[]>;
}
export {};
