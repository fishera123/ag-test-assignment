import { Expose } from "class-transformer";

export type MetaDataParams = {
  skip?: number | undefined;
  totalRecords: number | string;
  pageSize: number;
  currentPage?: number | undefined;
};

export interface ResponseListMetadataDto {
  totalRecords: string;
  totalPages: string;
  page: string;
  offset: string;
  firstPage: string;
  lastPage: string;
}

export class PagedResult<T> {
  @Expose()
  public result: T;
  @Expose()
  public meta: ResponseListMetadataDto;

  constructor(result: T, paginationMeta: MetaDataParams) {
    this.result = result;
    this.meta = PaginatedResultSerializer.serializeMetadata(paginationMeta);
  }
}

class PaginatedResultSerializer {
  public static serializeMetadata(metaParams: MetaDataParams): ResponseListMetadataDto {
    const totalPages = Math.ceil(Number(metaParams.totalRecords) / metaParams.pageSize);
    const page = metaParams.currentPage ?? 1;

    const skip = metaParams.skip ?? 0;

    return {
      totalRecords: metaParams.totalRecords.toString(),
      totalPages: totalPages.toString(),
      offset: skip.toString(),
      page: page.toString(),
      firstPage: PaginatedResultSerializer.isFirstPage(page),
      lastPage: PaginatedResultSerializer.isLastPage(page, totalPages),
    };
  }

  private static isFirstPage(currentPage: number): string {
    return (currentPage === 1).toString();
  }

  private static isLastPage(currentPage: number, totalPages: number): string {
    return (currentPage === totalPages).toString();
  }
}
