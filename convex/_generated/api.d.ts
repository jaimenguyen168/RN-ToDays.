/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as http from "../http.js";
import type * as private_storage from "../private/storage.js";
import type * as private_tasks from "../private/tasks.js";
import type * as private_users from "../private/users.js";
import type * as schemas_tasks from "../schemas/tasks.js";
import type * as schemas_users from "../schemas/users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  http: typeof http;
  "private/storage": typeof private_storage;
  "private/tasks": typeof private_tasks;
  "private/users": typeof private_users;
  "schemas/tasks": typeof schemas_tasks;
  "schemas/users": typeof schemas_users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
