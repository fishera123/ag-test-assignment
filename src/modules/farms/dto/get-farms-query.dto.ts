import { IsEnum, IsNumber, IsOptional } from "class-validator";
import { OrderByEnum } from "../enums/order-by.enum";
import { OutlierFilter } from "../enums/outlier-filter.enum";

export class GetFarmsQueryDto {
  @IsOptional()
  @IsEnum(OrderByEnum)
  public orderBy: OrderByEnum;

  @IsOptional()
  @IsEnum(OutlierFilter)
  public outliers: OutlierFilter;

  @IsNumber()
  @IsOptional()
  public page: number;

  @IsNumber()
  @IsOptional()
  public limit: number;

  constructor(data: Partial<GetFarmsQueryDto>) {
    Object.assign(this, data);
  }
}
