import { PaginationQueryFilter } from "helpers/pagination-query";
import { User } from "modules/users/entities/user.entity";
import { Request } from "express";

export type ExtendedRequest = Request & {
  user: User;
  pagination: PaginationQueryFilter;
};
