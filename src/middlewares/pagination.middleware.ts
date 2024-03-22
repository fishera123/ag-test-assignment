import { NextFunction, Request, Response } from "express";
import { buildPaginationFilter } from "helpers/pagination-query";

export const paginationMiddleware = (req: Request, _: Response, next: NextFunction): void => {
  if (req.method !== "GET") {
    next();
    return;
  }

  const pagination = buildPaginationFilter({
    limit: req.query.limit as string,
    page: req.query.page as string,
  });

  req.pagination = pagination;

  return next();
};
