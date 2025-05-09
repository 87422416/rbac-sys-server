declare global {
  type ResCode = -1 | 0 | 1 | 2;

  type PermissionAction = "post" | "get" | "put" | "delete";

  interface JWTPayload {
    userId: number;
  }

  namespace Express {
    interface Session {
      captcha: string;
      roles: string[];
    }
    interface Request {
      traceId?: string;
      user: JwtPayload;
      session: Session;
    }
  }
}
export interface ResBody {
  code: ResCode;
  data: any;
  msg: string | string[];
  traceId?: string;
}

export {};
