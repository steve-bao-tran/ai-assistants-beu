import { Request } from "express";
import { Document, Model } from "mongoose";
import { safeParseInt } from "../helpers";

export interface IPagingParams {
  page?: number;
  size?: number;
  nextPageToken?: string;
  sort?: any;
  buildQuery?: (query: Model<any>, limit: number, skip: number) => Model<any>;
  buildQueryCount?: (query: Model<any>) => Model<any>;
}

export interface IPaginationRequest extends Request {
  query: IPagingParams;
}

export interface IPaginationInfo {
  page: number;
  size: number;
  totalPages: number;
  total: number;
  nextPageToken: string;
}

export interface IPagingResult<T> {
  data: T[];
  pagination: IPaginationInfo;
}

export const PAGE_SIZE = 20;
const PREFIX_NEXT_PAGE_TOKEN = "Next_Page_Token";

export function parsePaginationParams(input: any): IPagingParams {

  input = { ...input };

  const result = {
    page: safeParseInt(input.page, 1),
    size: safeParseInt(input.size, PAGE_SIZE),
    sort: input.sort || null,
    buildQuery: input.buildQuery || null,
    buildQueryCount: input.buildQueryCount || null
  };
  if (input.nextPageToken) {
    result.page = decodeNextPage(input.nextPageToken) + 1;
  }

  return result;
}

export function parseSort(fields: string[]) {
  if (!fields || fields.length === 0) { return {}; }
  const data = fields.map(e => {
    const executeRegex = /[^A-Za-z0-9\s]/g.exec(e);
    const orderBy = executeRegex && executeRegex.length > 0 ? executeRegex[0] : "";
    const key = e.replace(orderBy, "");

    return { [key]: orderBy === "-" ? -1 : 1 };
  });
  const result: any = {};
  data.forEach(e => {
    const firstKey = Object.keys(e)[0];
    result[firstKey] = e[firstKey];
  });

  return result;
}

// export function parseOrderParams(input: any): Order {
//   function parseItem(item): OrderItem {
//     return ((<string> item).substring(0, 1) === "-"
//       ? [(<string> item).substring(1), "DESC"]
//       : [item, "ASC"]);
//   }
//   const type = typeof input;
//   if (type === "string") {
//     return [parseItem(input)];
//   }

//   return input.map(parseItem);
// }

export async function filterAll<T extends Document>(
  modelClass: Model<T>,
  queryParams: any,
  pagingParams?: IPagingParams): Promise<IPagingResult<T>> {

  const query = modelClass.find(queryParams);
  if (pagingParams && pagingParams.sort) {
    query.sort(pagingParams.sort);
  }

  const data = await query.exec();

  return {
    data,
    pagination: {
      total: data.length,
      size: data.length,
      totalPages: 1,
      page: 1,
      nextPageToken: null
    }
  };
}

export async function filterPagination<T extends Document>(
  modelClass: Model<T>,
  queryParams: any = {},
  pagingParams: IPagingParams): Promise<IPagingResult<T>> {
  const isNeedCountTotalPage = !pagingParams.nextPageToken
    && pagingParams.page;
  pagingParams = parsePaginationParams(pagingParams);

  if (!pagingParams || !pagingParams.page && !pagingParams.size) {
    return filterAll(modelClass, queryParams, pagingParams);
  }

  const page = (pagingParams && pagingParams.page) ? safeParseInt(pagingParams.page, 1) : 1;

  const options = {
    skip: 0,
    ...pagingParams,
    page: page > 1 ? page : 1,
    limit: (pagingParams && pagingParams.size) ? safeParseInt(pagingParams.size, PAGE_SIZE) : PAGE_SIZE,
  };

  options.skip = options.skip || ((options.page - 1) * options.limit);

  let count;
  let query;

  if (isNeedCountTotalPage) {
    if (pagingParams.buildQueryCount) {
      query = options.buildQueryCount(modelClass);
      count = await query.exec();
    } else {
      count = await modelClass.countDocuments(queryParams);
    }
  }
  if (pagingParams.buildQuery) {
    query = options.buildQuery(modelClass, options.limit, options.skip);
  } else {
    query = modelClass.find(queryParams).skip(options.skip).limit(options.limit);
    if (pagingParams.sort) {
      query.sort(pagingParams.sort);
    }
  }

  const results = await query.exec();

  let totalPages;
  if (count) {
    totalPages = count % options.limit === 0
      ? count / options.limit
      : Math.floor(count / options.limit) + 1;
  }

  if (results.length === 0) {
    return {
      data: [],
      pagination: {
        total: count || results.length,
        size: options.limit,
        totalPages: totalPages || 0,
        page: options.page || 1,
        nextPageToken: null
      }
    };
  }

  return {
    data: results,
    pagination: {
      totalPages,
      page: options.page || 1,
      total: count || results.length,
      size: options.limit,
      nextPageToken: results.length && results.length === options.size ?
        encodeNextPage(PREFIX_NEXT_PAGE_TOKEN, options.page) : null
    }
  };
}

export function encodeNextPage(name: string, page: number) {
  return Buffer.from(name + page.toString()).toString("base64");
}

export function decodeNextPage(hash: string): number {
  return safeParseInt(
    Buffer.from(hash, "base64")
      .toString("ascii")
      .replace(PREFIX_NEXT_PAGE_TOKEN, ""),
    1);
}
