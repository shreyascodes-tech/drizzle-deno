import { type AnyColumn, type Table } from "./mod.ts";
import { PgArray, PgCustomColumn, PgJson, PgJsonb } from "./pg-core.ts";
import {
  SQLiteBlobJson,
  SQLiteCustomColumn,
} from "https://esm.sh/drizzle-orm@0.23.8/sqlite-core";
import {
  type Assume,
  type DrizzleTypeError,
  type Equal,
  type Or,
  type Simplify,
} from "https://esm.sh/drizzle-orm@0.23.8/utils";
import { z } from "https://deno.land/x/zod@v3.17.3/mod.ts";
declare const literalSchema: z.ZodUnion<
  [z.ZodString, z.ZodNumber, z.ZodBoolean, z.ZodNull]
>;
type Literal = z.infer<typeof literalSchema>;
type Json =
  | Literal
  | {
      [key: string]: Json;
    }
  | Json[];
export declare const jsonSchema: z.ZodType<Json>;
type MapInsertColumnToZod<
  TColumn extends AnyColumn,
  TType extends z.ZodTypeAny
> = TColumn["_"]["notNull"] extends false
  ? z.ZodOptional<z.ZodNullable<TType>>
  : TColumn["_"]["hasDefault"] extends true
  ? z.ZodOptional<TType>
  : TType;
type MapSelectColumnToZod<
  TColumn extends AnyColumn,
  TType extends z.ZodTypeAny
> = TColumn["_"]["notNull"] extends false ? z.ZodNullable<TType> : TType;
type MapColumnToZod<
  TColumn extends AnyColumn,
  TType extends z.ZodTypeAny,
  TMode extends "insert" | "select"
> = TMode extends "insert"
  ? MapInsertColumnToZod<TColumn, TType>
  : MapSelectColumnToZod<TColumn, TType>;
type MaybeOptional<
  TColumn extends AnyColumn,
  TType extends z.ZodTypeAny,
  TMode extends "insert" | "select",
  TNoOptional extends boolean
> = TNoOptional extends true ? TType : MapColumnToZod<TColumn, TType, TMode>;
type GetZodType<TColumn extends AnyColumn> =
  TColumn["_"]["data"] extends infer TType
    ? TColumn extends PgCustomColumn<any> | SQLiteCustomColumn<any>
      ? z.ZodAny
      : TColumn extends PgJson<any> | PgJsonb<any> | SQLiteBlobJson<any>
      ? z.ZodType<Json>
      : TColumn["_"]["config"] extends {
          enum: [string, ...string[]];
        }
      ? Or<
          Equal<[string, ...string[]], TColumn["_"]["config"]["enum"]>,
          Equal<string[], TColumn["_"]["config"]["enum"]>
        > extends true
        ? z.ZodString
        : z.ZodEnum<TColumn["_"]["config"]["enum"]>
      : TColumn extends PgArray<any>
      ? z.ZodArray<
          GetZodType<
            Assume<
              TColumn["_"],
              {
                baseColumn: AnyColumn;
              }
            >["baseColumn"]
          >
        >
      : TType extends number
      ? z.ZodNumber
      : TType extends string
      ? z.ZodString
      : TType extends boolean
      ? z.ZodBoolean
      : TType extends Date
      ? z.ZodDate
      : z.ZodAny
    : never;
type ValueOrUpdater<T, TUpdaterArg> = T | ((arg: TUpdaterArg) => T);
type UnwrapValueOrUpdater<T> = T extends ValueOrUpdater<infer T, any>
  ? T
  : never;
export type Refine<TTable extends Table, TMode extends "select" | "insert"> = {
  [K in keyof TTable["_"]["columns"]]?: ValueOrUpdater<
    z.ZodTypeAny,
    TMode extends "select"
      ? BuildSelectSchema<TTable, {}, true>
      : BuildInsertSchema<TTable, {}, true>
  >;
};
export type BuildInsertSchema<
  TTable extends Table,
  TRefine extends Refine<TTable, "insert"> | {},
  TNoOptional extends boolean = false
> = TTable["_"]["columns"] extends infer TColumns extends Record<
  string,
  AnyColumn
>
  ? {
      [K in keyof TColumns & string]: MaybeOptional<
        TColumns[K],
        K extends keyof TRefine
          ? Assume<UnwrapValueOrUpdater<TRefine[K]>, z.ZodTypeAny>
          : GetZodType<TColumns[K]>,
        "insert",
        TNoOptional
      >;
    }
  : never;
export type BuildSelectSchema<
  TTable extends Table,
  TRefine extends Refine<TTable, "select"> | {},
  TNoOptional extends boolean = false
> = Simplify<{
  [K in keyof TTable["_"]["columns"]]: MaybeOptional<
    TTable["_"]["columns"][K],
    K extends keyof TRefine
      ? Assume<UnwrapValueOrUpdater<TRefine[K]>, z.ZodTypeAny>
      : GetZodType<TTable["_"]["columns"][K]>,
    "select",
    TNoOptional
  >;
}>;
export declare function createInsertSchema<
  TTable extends Table,
  TRefine extends Refine<TTable, "insert"> = {}
>(
  table: TTable,
  /**
   * @param refine Refine schema fields
   */
  refine?: {
    [K in keyof TRefine]: K extends keyof TTable["_"]["columns"]
      ? TRefine[K]
      : DrizzleTypeError<`Column '${K &
          string}' does not exist in table '${TTable["_"]["name"]}'`>;
  }
): z.ZodObject<BuildInsertSchema<TTable, TRefine>>;
export declare function createSelectSchema<
  TTable extends Table,
  TRefine extends Refine<TTable, "select"> = {}
>(
  table: TTable,
  /**
   * @param refine Refine schema fields
   */
  refine?: {
    [K in keyof TRefine]: K extends keyof TTable["_"]["columns"]
      ? TRefine[K]
      : DrizzleTypeError<`Column '${K &
          string}' does not exist in table '${TTable["_"]["name"]}'`>;
  }
): z.ZodObject<BuildSelectSchema<TTable, TRefine>>;
export {};
//# sourceMappingURL=index.d.ts.map
