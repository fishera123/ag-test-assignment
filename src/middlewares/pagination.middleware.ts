import { NextFunction, Response } from "express";
import { buildPaginationFilter } from "helpers/pagination-query";
import { ExtendedRequest } from "types";

export const paginationMiddleware = (req: ExtendedRequest, _: Response, next: NextFunction): void => {
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
