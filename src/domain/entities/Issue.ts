export type Issue = {
  nameWithOwner: string;
  author: string;
  number: number;
  title: string;
  state: 'OPEN' | 'CLOSED' | 'MERGED';
  url: string;
  timeline: {
    issueUrl: string;
    author: string;
    start: string;
    end: string;
  }[]
}