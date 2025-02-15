declare global {
  type ResCode = -1 | 0 | 1 | 2;

  namespace Express {
    interface Request {
      traceId?: string;
    }
  }
}

export interface ResBody {
  code: ResCode;
  data: any;
  msg: string | string[];
}

export {};
