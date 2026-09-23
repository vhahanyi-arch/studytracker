// The schema stamp, kept apart from lib/db.ts so it can be reasoned about and
// tested without opening a database connection -- importing lib/db.ts
// constructs a Neon client at module load and needs a live DATABASE_URL.

// Bumped whenever the DDL in applySchema changes. A database carrying this
// version has already had every one of those statements run against it, so a
// cold start can skip the lot after a single query. Without the stamp every
// cold lambda issued thirty sequential round trips to Neon before it could
// serve its first request.
// 2: physics_exam_jobs, for extractions running in the background.
export const SCHEMA_VERSION = 2;

/**
 * Whether the DDL still needs applying, given the newest stamp in the table.
 *
 * Anything unreadable counts as needing the DDL: re-running it is idempotent
 * and costs a cold start, while wrongly skipping it leaves the application
 * querying tables that were never created.
 */
export function needsSchemaApply(stamp: { version?: unknown } | undefined | null) {
  if (!stamp) return true;
  const version = Number(stamp.version);
  return !Number.isFinite(version) || version < SCHEMA_VERSION;
}
