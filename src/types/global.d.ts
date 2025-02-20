declare global {
  type ResCode = -1 | 0 | 1 | 2;

  type PermissionAction = "post" | "get" | "put" | "delete";

  interface JWTPayload {
    userId: number;
    roles: string[];
  }

  namespace Express {
    interface Request {
      traceId?: string;
      user: JwtPayload;
    }
  }
}
export interface ResBody {
  code: ResCode;
  data: any;
  msg: string | string[];
}

export {};
