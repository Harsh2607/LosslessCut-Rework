export const appName = 'LosslessCut';
export const copyrightYear = 2026;

export type AppEvent = {
  eventName: 'export-complete';
  paths?: string[];
} | {
  eventName: 'export-start';
  path: string;
};
