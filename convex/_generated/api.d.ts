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
import type * as chat from "../chat.js";
import type * as cotacoes from "../cotacoes.js";
import type * as dashboard from "../dashboard.js";
import type * as departments from "../departments.js";
import type * as events from "../events.js";
import type * as files from "../files.js";
import type * as fixMechanicsData from "../fixMechanicsData.js";
import type * as fornecedores from "../fornecedores.js";
import type * as indicadores from "../indicadores.js";
import type * as login from "../login.js";
import type * as notes from "../notes.js";
import type * as people from "../people.js";
import type * as seedDepartmentData from "../seedDepartmentData.js";
import type * as seedMechanicsData from "../seedMechanicsData.js";
import type * as simpleSeed from "../simpleSeed.js";
import type * as subdepartments from "../subdepartments.js";
import type * as testSeed from "../testSeed.js";
import type * as todos from "../todos.js";
import type * as users from "../users.js";

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
  chat: typeof chat;
  cotacoes: typeof cotacoes;
  dashboard: typeof dashboard;
  departments: typeof departments;
  events: typeof events;
  files: typeof files;
  fixMechanicsData: typeof fixMechanicsData;
  fornecedores: typeof fornecedores;
  indicadores: typeof indicadores;
  login: typeof login;
  notes: typeof notes;
  people: typeof people;
  seedDepartmentData: typeof seedDepartmentData;
  seedMechanicsData: typeof seedMechanicsData;
  simpleSeed: typeof simpleSeed;
  subdepartments: typeof subdepartments;
  testSeed: typeof testSeed;
  todos: typeof todos;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
