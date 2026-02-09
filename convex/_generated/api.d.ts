/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as completions from "../completions.js";
import type * as queries_models from "../queries/models.js";
import type * as queries_overview from "../queries/overview.js";
import type * as queries_sessions from "../queries/sessions.js";
import type * as queries_timeseries from "../queries/timeseries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  completions: typeof completions;
  "queries/models": typeof queries_models;
  "queries/overview": typeof queries_overview;
  "queries/sessions": typeof queries_sessions;
  "queries/timeseries": typeof queries_timeseries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
