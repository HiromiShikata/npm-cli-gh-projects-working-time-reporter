"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheerioIssueRepository = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
const BaseGitHubRepository_1 = require("./BaseGitHubRepository");
class CheerioIssueRepository extends BaseGitHubRepository_1.BaseGitHubRepository {
    constructor() {
        super(...arguments);
        this.getIssue = async (issueUrl) => {
            const headers = await this.createHeader();
            const content = await axios_1.default.get(issueUrl, { headers });
            const $ = cheerio.load(content.data);
            const title = this.getTitleFromCheerioObject($);
            const status = this.getStatusFromCheerioObject($);
            const assignees = this.getAssigneesFromCheerioObject($);
            const labels = this.getLabelsFromCheerioObject($);
            const project = this.getProjectFromCheerioObject($);
            const statusTimeline = await this.getStatusTimelineEvents(issueUrl);
            return {
                url: issueUrl,
                title,
                status,
                assignees,
                labels,
                project,
                statusTimeline,
            };
        };
        this.getStatusTimelineEvents = async (issueUrl) => {
            const headers = await this.createHeader();
            const content = await axios_1.default.get(issueUrl, { headers });
            const $ = cheerio.load(content.data);
            return this.getStatusTimelineEventsFromCheerioObject($, issueUrl);
        };
        this.getTitleFromCheerioObject = ($) => {
            return $('h1 > bdi').text();
        };
        this.getStatusFromCheerioObject = ($) => {
            return $('sidebar-memex-input > details > summary > span').text();
        };
        this.getAssigneesFromCheerioObject = ($) => {
            const assignees = $('div.sidebar-assignee > form > span > p > span > a.assignee > span');
            return assignees.map((_, elem) => $(elem).text()).get();
        };
        this.getLabelsFromCheerioObject = ($) => {
            return $('div.js-issue-labels > a > span')
                .map((_, elem) => $(elem).text())
                .get();
        };
        this.getProjectFromCheerioObject = ($) => {
            return $('collapsible-sidebar-widget > div  a > span').text();
        };
        this.getStatusTimelineEventsFromCheerioObject = ($, issueUrl) => {
            const timelines = $('.TimelineItem-body');
            const res = [];
            for (const timeline of timelines) {
                const author = $(timeline).find('a.author').text();
                if (!author) {
                    continue;
                }
                const time = $(timeline).find('relative-time').attr('datetime');
                if (!time) {
                    console.log(`time is not found in ${issueUrl} ${author}, It may PR.`);
                    continue;
                }
                const eventText = $(timeline).find('strong');
                if (eventText.length != 2) {
                    continue;
                }
                const from = $(eventText[0]).text();
                const to = $(eventText[1]).text();
                res.push({ time, author, from, to });
            }
            return res;
        };
        this.getInProgressTimeline = async (issueUrl) => {
            const events = await this.getStatusTimelineEvents(issueUrl);
            const timelines = events.filter((event) => event.from.toLocaleLowerCase().includes('in progress') ||
                event.to.toLocaleLowerCase().includes('in progress'));
            const report = [];
            let currentInProgress = undefined;
            for (const timeline of timelines) {
                if (timeline.to.toLocaleLowerCase().includes('in progress')) {
                    if (currentInProgress !== undefined) {
                        console.log(`currentInProgress is not undefined. ${JSON.stringify(currentInProgress)}, timeline: ${JSON.stringify(timeline)}`);
                    }
                    currentInProgress = {
                        issueUrl: issueUrl,
                        author: timeline.author,
                        start: timeline.time,
                    };
                    continue;
                }
                if (timeline.from.toLocaleLowerCase().includes('in progress')) {
                    if (currentInProgress === undefined) {
                        console.log(`currentInProgress is undefined. ${currentInProgress}, timeline: ${JSON.stringify(timeline)}`);
                        continue;
                    }
                    report.push({
                        ...currentInProgress,
                        end: timeline.time,
                    });
                    currentInProgress = undefined;
                }
            }
            return report;
        };
    }
}
exports.CheerioIssueRepository = CheerioIssueRepository;
//# sourceMappingURL=CheerioIssueRepository.js.map