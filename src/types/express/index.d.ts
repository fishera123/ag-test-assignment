export {};

declare global {
  namespace Express {
    interface Request {
      [prop: string]: any;
    }
  }
}
