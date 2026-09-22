import {test} from 'node:test';import assert from 'node:assert/strict';
import {needsSchemaApply,SCHEMA_VERSION} from '@/lib/schema-version';

// The stamp is whatever the newest row of schema_version holds, or nothing at
// all when the table has never been created.
const stamp=(version:unknown)=>({version});

test('a database with no stamp has never been migrated',()=>{
 assert.equal(needsSchemaApply(undefined),true);
 assert.equal(needsSchemaApply(null),true);
});

test('a database stamped with the current version is left alone',()=>{
 assert.equal(needsSchemaApply(stamp(SCHEMA_VERSION)),false);
});

test('a database stamped below the current version is brought up',()=>{
 assert.equal(needsSchemaApply(stamp(SCHEMA_VERSION-1)),true);
});

// A deploy that bumps the version migrates the database while lambdas from the
// previous deploy are still warm. Those older instances must not decide the
// schema has run ahead of them and re-apply their own older DDL over it.
test('a database stamped ahead of this build is left alone',()=>{
 assert.equal(needsSchemaApply(stamp(SCHEMA_VERSION+1)),false);
});

// Postgres hands back some integer types as strings over the wire, so the
// comparison has to survive one arriving that way rather than silently
// treating it as unreadable and re-running thirty statements every cold start.
test('a version that arrives as a string still counts',()=>{
 assert.equal(needsSchemaApply(stamp(String(SCHEMA_VERSION))),false);
});

// Anything unreadable has to mean "apply": re-running the DDL is idempotent and
// costs a cold start, while wrongly skipping it leaves the app querying tables
// that were never created.
test('an unreadable version is treated as unmigrated',()=>{
 for(const bad of [undefined,null,'','banana',NaN,{}]) assert.equal(needsSchemaApply(stamp(bad)),true,`for ${String(bad)}`);
});
