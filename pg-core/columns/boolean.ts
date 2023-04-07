import { sql } from "../../sql.ts";
import { customType } from "../columns.ts";
import { PgBooleanBuilderInitial } from "https://esm.sh/drizzle-orm@0.23.8/pg-core/columns/boolean";

export function boolean<TName extends string>(
  name: TName
): PgBooleanBuilderInitial<TName> {
  return customType({
    dataType: () => "boolean",
    fromDriver: (value): value is boolean => !!value as boolean,
    toDriver: (value) => {
      return value ? sql`TRUE` : sql`FALSE`;
    },
  })(name) as PgBooleanBuilderInitial<TName>;
}
