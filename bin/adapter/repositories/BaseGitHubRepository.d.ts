interface Cookie {
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: 'lax' | 'strict' | 'none';
}
export declare class BaseGitHubRepository {
    readonly jsonFilePath: string;
    readonly ghToken: string;
    constructor(jsonFilePath?: string, ghToken?: string);
    protected extractIssueFromUrl: (issueUrl: string) => {
        owner: string;
        repo: string;
        issueNumber: number;
    };
    protected createHeader: () => Promise<object>;
    protected createCookieStringFromFile: () => Promise<string>;
    protected isCookie: (cookie: object) => cookie is Cookie;
    protected generateCookieHeaderFromJson: (cookieData: unknown) => Promise<string>;
}
export {};
