import { instanceToPlain } from "class-transformer";
import { NextFunction, Response } from "express";
import { PaginationQueryFilter } from "helpers/pagination-query";
import { AuthenticatedRequest } from "modules/auth/auth.types";
import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { OrderByEnum } from "./enums/order-by.enum";
import { OutlierFilter } from "./enums/outlier-filter.enum";
import { FarmsService } from "./farms.service";

export class FarmsController {
  private readonly farmsService: FarmsService;

  constructor() {
    this.farmsService = new FarmsService();
  }

  public async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmsService.createFarm(req.body as CreateFarmInputDto, req.user);

      res.status(201).send(instanceToPlain(farm));
    } catch (error) {
      next(error);
    }
  }

  public async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const farm = await this.farmsService.findAllFarms(
        req.query.orderBy as OrderByEnum,
        req.query.outlierFilter as OutlierFilter,
        req.pagination as PaginationQueryFilter,
        req.user,
      );

      res.status(201).send(instanceToPlain(farm));
    } catch (error) {
      next(error);
    }
  }
}
