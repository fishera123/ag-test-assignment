import { Request } from "express";
import { User } from "modules/users/entities/user.entity";

export type AuthenticatedRequest = Request & { user: User };
