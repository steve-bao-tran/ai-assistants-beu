// import { Request } from "express";
// import { safeParseInt } from "../../helpers";

// export interface IPagingParams {
//   page?: string | number;
//   size?: string | number;
//   order?: Order;
// }

// export interface IPaginationRequest extends Request {
//   query: IPagingParams;
// }

// export interface IPaginationInfo {
//   page: number;
//   size: number;
//   totalPages: number;
//   total: number;
// }

// export interface IPagingResult<T> {
//   data: T[];
//   pagination: IPaginationInfo;
// }

// export const PAGE_SIZE = 20;

// export function parsePaginationParams(input: any): IPagingParams {

//   input = { ...input };

//   return {
//     page: safeParseInt(input.page, 1),
//     size: safeParseInt(input.size, PAGE_SIZE),
//     order: !input.order ? [["id", "DESC"]] :
//       ((<string> input.order).substring(0, 1) === "-"
//         ? [[(<string> input.order).substring(1), "DESC"]]
//         : [[input.order, "ASC"]])
//   };
// }

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

// export async function filterAll<T extends Model>(
//   modelClass: { new(): T } & typeof Model,
//   queryParams: FindAndCountOptions,
//   pagingParams: IPagingParams): Promise<IPagingResult<T>> {

//   const options = { ...pagingParams };

//   const query = {
//     ... queryParams,
//     order: <Order> options.order,
//   };

//   const data = await modelClass.findAll(query);

//   return {
//     data,
//     pagination: {
//       total: data.length,
//       size: data.length,
//       totalPages: 1,
//       page: 1,
//     }
//   };
// }

// export async function filterPagination<T extends Model>(
//   modelClass: { new(): T } & typeof Model,
//   queryParams: FindAndCountOptions,
//   pagingParams: IPagingParams): Promise<IPagingResult<T>> {

//   if (!pagingParams || !pagingParams.page && !pagingParams.size) {
//     return filterAll(modelClass, queryParams, pagingParams);
//   }

//   const page = (pagingParams && pagingParams.page) ? safeParseInt(pagingParams.page, 1) : 1;

//   const options = {
//     offset: 0,
//     ...pagingParams,
//     page: page > 1 ? page : 1,
//     limit: (pagingParams && pagingParams.size) ? safeParseInt(pagingParams.size, PAGE_SIZE) : PAGE_SIZE,
//   };

//   options.offset = options.offset || ((options.page - 1) * options.limit);

//   const query = {
//     ... <object> queryParams,
//     order: <Order> options.order,
//     limit: options.limit,
//     offset: options.offset
//   };

//   const results = await modelClass.findAndCountAll(query);

//   if (results.rows.length === 0) {
//     return {
//       data: [],
//       pagination: {
//         total: 0,
//         size: options.limit,
//         totalPages: 0,
//         page: options.page || 1,
//       }
//     };
//   }
//   const totalPages = results.count % options.limit > 0
//     ? Math.floor(results.count / options.limit) + 1
//     : results.count / options.limit;

//   return {
//     data: results.rows,
//     pagination: {
//       totalPages,
//       page: options.page || 1,
//       total: results.count,
//       size: options.limit,
//     }
//   };
// }
