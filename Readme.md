# Drizzle-orm

Deno port of the [Drizzle-orm](https://github.com/drizzle-team/drizzle-orm) library.

> Note: This is a work in progress and only pg-core and postgres-js are supported at the moment.
checkout the bottom of this readme for all supported mappings.

## Usage

The usage is identical to the original library. The only difference is 
that you need to import the library as shown below.

```ts
import { eq } from "drizzle-orm/expression";
// Maps to
import { eq } from "https://deno.land/x/drizzle-orm/expression.ts";
```

## Example
    
```ts
import { eq } from 'https://deno.land/x/drizzle-orm/expressions.ts';
import postgres, { drizzle } from 'https://deno.land/x/drizzle-orm/postgres.ts';
import { integer, pgTable, serial, text, timestamp, varchar, sql } from 'https://deno.land/x/drizzle-orm/pg-core.ts';
import { InferModel } from 'https://deno.land/x/drizzle-orm/mod.ts';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  fullName: text('full_name').notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  cityId: integer('city_id').references(() => cities.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const cities = pgTable('cities', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
});

export type City = InferModel<typeof cities>;
export type NewCity = InferModel<typeof cities, 'insert'>;

const client = pg(/* connection string */);

const db = drizzle(client);

// Insert
const newUser: NewUser = {
  fullName: 'John Doe',
  phone: '+123456789',
};
const insertedUsers /* : User[] */ = await db.insert(users).values(newUser).returning();
const insertedUser = insertedUsers[0]!;

const newCity: NewCity = {
  name: 'New York',
};
const insertedCities /* : City[] */ = await db.insert(cities).values(newCity).returning();
const insertedCity = insertedCities[0]!;

// Update
const updateResult /* : { updated: Date }[] */ = await db.update(users)
  .set({ cityId: insertedCity.id, updatedAt: new Date() })
  .where(eq(users.id, insertedUser.id))
  .returning({ updated: users.updatedAt });

// Select
const allUsers /* : User[] */ = await db.select().from(users);

// Select custom fields
const upperCaseNames /* : { id: number; name: string }[] */ = await db
  .select({
    id: users.id,
    name: sql<string>`upper(${users.fullName})`,
  })
  .from(users);

// Joins
// You wouldn't BELIEVE how SMART the result type is! 😱
const allUsersWithCities = await db
  .select({
    id: users.id,
    name: users.fullName,
    city: {
      id: cities.id,
      name: cities.name,
    },
  })
  .from(users)
  .leftJoin(cities, eq(users.cityId, cities.id));

// Delete
const deletedNames /* : { name: string }[] */ = await db.delete(users)
  .where(eq(users.id, insertedUser.id))
  .returning({ name: users.fullName });
```

## Supported Mappings
- `drizzle-orm` => https://deno.land/x/drizzle-orm/mod.ts
- `drizzle-orm/pg-core` => https://deno.land/x/drizzle-orm/pg-core.ts
- `drizzle-orm/postgres-js` => https://deno.land/x/drizzle-orm/postgres.ts
    - It also exports postgres client from [postgres-js](https://deno.land/x/postgresjs) as `postgres` and default export.
- `drizzle-orm/expressions` => https://deno.land/x/drizzle-orm/expressions.ts
- `drizzle-orm/sql` => https://deno.land/x/drizzle-orm/sql.ts
