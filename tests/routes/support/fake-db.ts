// Stands in for lib/db.ts: the same tagged-template `sql` and `sql.transaction`
// as @neondatabase/serverless, run on PGlite (Postgres compiled to WebAssembly)
// in memory. The tables come from the DDL in lib/db.ts itself, so the tests
// always run against the schema production gets.
import fs from "node:fs";
import path from "node:path";
import { PGlite } from "@electric-sql/pglite";

let db: PGlite | null = null;

// Neon prepares values as node-postgres does. Scalars reach Postgres as the
// same text either way; arrays, dates and objects are prepared here the same
// way, so array parameters are tested as production sends them.
function arrayLiteral(values: unknown[]): string {
  return "{" + values.map((value) =>
    value === null || value === undefined ? "NULL"
    : Array.isArray(value) ? arrayLiteral(value)
    : '"' + String(prepare(value)).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"',
  ).join(",") + "}";
}
function prepare(value: unknown): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return arrayLiteral(value);
  if (typeof value === "object") return JSON.stringify(value);
  return value;
}

// Lazy, like Neon's: nothing runs until the query is awaited or handed to
// sql.transaction.
class Query implements PromiseLike<Record<string, unknown>[]> {
  constructor(readonly text: string, readonly values: unknown[]) {}
  run(target: Pick<PGlite, "query">) {
    return target.query<Record<string, unknown>>(this.text, this.values.map(prepare)).then((result) => result.rows);
  }
  then<A = Record<string, unknown>[], B = never>(
    onFulfilled?: ((rows: Record<string, unknown>[]) => A | PromiseLike<A>) | null,
    onRejected?: ((error: unknown) => B | PromiseLike<B>) | null,
  ) {
    if (!db) throw new Error("Call freshDatabase() before querying.");
    return this.run(db).then(onFulfilled, onRejected);
  }
}

type Sql = ((strings: TemplateStringsArray, ...values: unknown[]) => Query) & {
  transaction(queries: Query[]): Promise<Record<string, unknown>[][]>;
};

export const sql = ((strings: TemplateStringsArray, ...values: unknown[]) =>
  new Query(strings.reduce((text, part, index) => text + "$" + index + part), values)) as Sql;

sql.transaction = (queries) => {
  if (!db) throw new Error("Call freshDatabase() before querying.");
  return db.transaction(async (tx) => {
    const results: Record<string, unknown>[][] = [];
    for (const query of queries) results.push(await query.run(tx));
    return results;
  });
};

export async function ensureSchema() {}

// An empty database with every table and index from lib/db.ts. The schema is
// built once per test file; later calls empty the tables.
export async function freshDatabase() {
  if (db) {
    const tables = await db.query<{ name: string }>(`SELECT tablename AS name FROM pg_tables WHERE schemaname = 'public'`);
    await db.exec(`TRUNCATE ${tables.rows.map((table) => `"${table.name}"`).join(", ")} CASCADE`);
    return;
  }
  db = new PGlite();
  const source = fs.readFileSync(path.join(__dirname, "..", "..", "..", "lib", "db.ts"), "utf8");
  const ddl = source.slice(source.indexOf("async function applySchema"), source.indexOf("export async function ensureSchema"));
  const statements = [...ddl.matchAll(/sql`([^`]*)`/g)].map((match) => match[1]);
  if (statements.length < 20) throw new Error("Could not read the DDL from lib/db.ts.");
  for (const statement of statements) await db.exec(statement);
}
