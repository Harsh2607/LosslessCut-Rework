export interface RequestMessageData {
  code: string;
  id: number;
  context: string; // json
}

export type ResponseMessageData = { id: number } & (
  | {
      error: string;
    }
  | {
      data: unknown;
    }
);
