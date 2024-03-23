import { plainToInstance } from "class-transformer";
import { NextFunction, Response } from "express";
import { ExtendedRequest } from "types";
import { CreateUserInputDto } from "./dto/create-user.input.dto";
import { CreateUserOutputDto } from "./dto/create-user.output.dto";
import { UsersService } from "./users.service";

export class UsersController {
  private readonly usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  public async create(req: ExtendedRequest, res: Response, next: NextFunction) {
    try {
      const user = await this.usersService.createUser(req.body as CreateUserInputDto);

      res.status(201).send(plainToInstance(CreateUserOutputDto, user, { excludeExtraneousValues: true }));
    } catch (error) {
      next(error);
    }
  }
}
