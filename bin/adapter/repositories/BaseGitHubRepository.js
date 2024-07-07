"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseGitHubRepository = void 0;
const fs_1 = require("fs");
const cookie_1 = require("cookie");
class BaseGitHubRepository {
    constructor(jsonFilePath = './tmp/github.com.cookies.json', ghToken = process.env.GH_TOKEN || 'dummy') {
        this.jsonFilePath = jsonFilePath;
        this.ghToken = ghToken;
        this.extractIssueFromUrl = (issueUrl) => {
            const match = issueUrl.match(/https:\/\/github.com\/([^/]+)\/([^/]+)\/(issues|pull)\/(\d+)/);
            if (!match) {
                throw new Error(`Invalid issue URL: ${issueUrl}`);
            }
            const [, owner, repo, pullOrIssue, issueNumberStr] = match;
            const issueNumber = parseInt(issueNumberStr, 10);
            if (isNaN(issueNumber)) {
                throw new Error(`Invalid issue number: ${issueNumberStr}. URL: ${issueUrl}`);
            }
            return { owner, repo, issueNumber, isIssue: pullOrIssue === 'issues' };
        };
        this.createHeader = async () => {
            const cookie = await this.createCookieStringFromFile();
            const headers = {
                accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'accept-language': 'en-US,en;q=0.9,es-MX;q=0.8,es;q=0.7,ja-JP;q=0.6,ja;q=0.5',
                'cache-control': 'max-age=0',
                'sec-ch-ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Linux"',
                'sec-fetch-dest': 'document',
                'sec-fetch-mode': 'navigate',
                'sec-fetch-site': 'same-origin',
                'sec-fetch-user': '?1',
                'upgrade-insecure-requests': '1',
                Referer: 'https://github.com/orgs/community/discussions/30979',
                'Referrer-Policy': 'no-referrer-when-downgrade',
            };
            return {
                ...headers,
                cookie: cookie,
            };
        };
        this.createCookieStringFromFile = async () => {
            const data = await fs_1.promises.readFile(this.jsonFilePath, {
                encoding: 'utf-8',
            });
            const cookiesData = JSON.parse(data);
            return this.generateCookieHeaderFromJson(cookiesData);
        };
        this.isCookie = (cookie) => {
            return ('name' in cookie &&
                typeof cookie.name === 'string' &&
                'value' in cookie &&
                typeof cookie.value === 'string' &&
                'domain' in cookie &&
                typeof cookie.domain === 'string' &&
                'path' in cookie &&
                typeof cookie.path === 'string' &&
                'expires' in cookie &&
                typeof cookie.expires === 'number' &&
                'httpOnly' in cookie &&
                typeof cookie.httpOnly === 'boolean' &&
                'secure' in cookie &&
                typeof cookie.secure === 'boolean' &&
                'sameSite' in cookie &&
                typeof cookie.sameSite === 'string' &&
                ['lax', 'strict', 'none'].indexOf(cookie.sameSite) !== -1);
        };
        this.generateCookieHeaderFromJson = async (cookieData) => {
            if (!Array.isArray(cookieData)) {
                throw new Error('Invalid cookie array');
            }
            const cookies = cookieData.map((cookieOrig) => {
                const sameSite = typeof cookieOrig !== 'object' ||
                    !('sameSite' in cookieOrig) ||
                    typeof cookieOrig.sameSite !== 'string'
                    ? 'none'
                    : cookieOrig.sameSite.toLowerCase();
                const cookie = {
                    ...cookieOrig,
                    sameSite,
                };
                if (!this.isCookie(cookie)) {
                    throw new Error(`Invalid cookie properties: ${JSON.stringify(cookie)}`);
                }
                return cookie;
            });
            const cookieHeader = cookies
                .map((cookie) => (0, cookie_1.serialize)(cookie.name, cookie.value, {
                domain: cookie.domain,
                path: cookie.path,
                expires: cookie.expires ? new Date(cookie.expires * 1000) : undefined,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure,
                sameSite: cookie.sameSite,
            }))
                .join('; ');
            return cookieHeader;
        };
    }
}
exports.BaseGitHubRepository = BaseGitHubRepository;
//# sourceMappingURL=BaseGitHubRepository.js.map