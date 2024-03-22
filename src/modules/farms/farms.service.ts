import { UnprocessableEntityError } from "errors/errors";
import { PagedResult } from "helpers/pagination";
import { PaginationQueryFilter } from "helpers/pagination-query";
import { GoogleMapsService } from "modules/google-maps/google-maps.service";
import { User } from "modules/users/entities/user.entity";
import dataSource from "orm/orm.config";
import { Repository, SelectQueryBuilder } from "typeorm";
import { CreateFarmInputDto } from "./dto/create-farm.input.dto";
import { CreateFarmOutputDto } from "./dto/create-farm.output.dto";
import { Farm } from "./entities/farm.entity";
import { OrderByEnum } from "./enums/order-by.enum";
import { OutlierFilter } from "./enums/outlier-filter.enum";

export class FarmsService {
  private readonly farmsRepository: Repository<Farm>;
  private readonly googleMapsProvider: GoogleMapsService;

  constructor() {
    this.farmsRepository = dataSource.getRepository(Farm);
    this.googleMapsProvider = new GoogleMapsService();
  }

  public async createFarm(data: CreateFarmInputDto, user: User): Promise<CreateFarmOutputDto> {
    const existingFarm = await this.farmsRepository.findOne({ where: { name: data.name } });

    if (existingFarm) throw new UnprocessableEntityError("A farm with the same name already exists");

    const farmObject = new Farm({
      name: data.name,
      address: data.address,
      owner: user,
      size: data.size,
      yield: data.yield,
    });

    farmObject.coordinates = await this.googleMapsProvider.getCoordinates(data.address);

    const [drivingDistance] = await this.googleMapsProvider.getDrivingDistanceMeters(user.coordinates, [farmObject.coordinates]);

    farmObject.drivingDistance = drivingDistance;

    const farm = await this.farmsRepository.save(farmObject);

    return new CreateFarmOutputDto({
      id: farm.id,
      name: farm.name,
      yield: farm.yield,
      size: farm.size,
      address: farm.address,
      drivingDistance: farm.drivingDistance,
      owner: user.email,
      updatedAt: farm.updatedAt,
      createdAt: farm.createdAt,
    });
  }

  public async findAllFarms(
    orderBy: OrderByEnum | undefined,
    outlierFilter: OutlierFilter | undefined,
    pagination: PaginationQueryFilter,
    user: User,
  ): Promise<PagedResult<CreateFarmOutputDto[]>> {
    const filteredFarms: Farm[] = [];
    const [farms, total] = await this.findFarmsAndPaginate(pagination, orderBy);

    if (outlierFilter) {
      filteredFarms.push(...this.filterFarmsByOutlierType(farms, outlierFilter));
    } else {
      filteredFarms.push(...farms);
    }

    return new PagedResult<CreateFarmOutputDto[]>(
      filteredFarms.map(
        farm =>
          new CreateFarmOutputDto({
            id: farm.id,
            name: farm.name,
            yield: farm.yield,
            size: farm.size,
            address: farm.address,
            drivingDistance: farm.drivingDistance,
            owner: user.email,
            updatedAt: farm.updatedAt,
            createdAt: farm.createdAt,
          }),
      ),
      {
        skip: pagination.skip,
        totalRecords: total,
        pageSize: pagination.limit,
        currentPage: pagination.page,
      },
    );
  }

  private findFarmsAndPaginate(
    paginationParams: PaginationQueryFilter,
    orderBy: OrderByEnum | undefined,
  ): Promise<[Farm[], number]> {
    const queryBuilder: SelectQueryBuilder<Farm> = this.farmsRepository.createQueryBuilder("farm");

    if (orderBy) {
      const order = orderBy === OrderByEnum.date ? "DESC" : "ASC";
      queryBuilder.orderBy(`farm.${orderBy}`, order);
    }

    queryBuilder.skip(paginationParams.skip).take(paginationParams.limit);

    return queryBuilder.getManyAndCount();
  }

  private filterFarmsByOutlierType(farms: Farm[], filter: OutlierFilter): Farm[] {
    const averageYield = farms.reduce((sum, farm) => sum + farm.yield, 0) / farms.length;
    const lowerThreshold = averageYield * 0.7;
    const upperThreshold = averageYield * 1.3;

    switch (filter) {
      case OutlierFilter.ShowOnlyOutliers:
        return farms.filter(farm => farm.yield < lowerThreshold || farm.yield > upperThreshold);

      case OutlierFilter.ShowExceptOutliers:
        return farms.filter(farm => farm.yield >= lowerThreshold && farm.yield <= upperThreshold);

      case OutlierFilter.ShowAll:
      default:
        return farms;
    }
  }
}
