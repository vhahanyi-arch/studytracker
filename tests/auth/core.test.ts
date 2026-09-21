import {test} from 'node:test';import assert from 'node:assert/strict';
import {claimTeacher,claimTeacherStatus,completeFirstPassword,requireTeacher,listStudents,createStudent,resetStudentPassword,clerkMessage,type UserRecord,type UserStore} from '@/lib/auth-rules';

type Seed={id:string;username?:string;firstName?:string;lastName?:string;meta?:Record<string,unknown>};
// Seed order is creation order, which is what getUserList({orderBy:'+created_at'}) returns.
function fake(seed:Seed[],fail?:{on:'update'|'create';error:unknown}){
 const users:UserRecord[]=seed.map(s=>({id:s.id,username:s.username??s.id,firstName:s.firstName??null,lastName:s.lastName??null,publicMetadata:{...(s.meta??{})}}));
 const updated:Array<[string,Record<string,unknown>]>=[],created:Record<string,unknown>[]=[];
 const store:UserStore={
  async getUserList({limit,offset=0}){return {data:users.slice(offset,offset+limit)};},
  async getUser(id){const u=users.find(x=>x.id===id);if(!u)throw new Error('not found');return u;},
  async updateUser(id,params){if(fail?.on==='update')throw fail.error;updated.push([id,params]);const u=users.find(x=>x.id===id)!;if(params.publicMetadata)u.publicMetadata=params.publicMetadata as Record<string,unknown>;return {};},
  async createUser(params){if(fail?.on==='create')throw fail.error;created.push(params);const u:UserRecord={id:'u_new',username:String(params.username),publicMetadata:params.publicMetadata as Record<string,unknown>};users.push(u);return u;},
 };
 return {store,users,updated,created};
}
const teacher={role:'teacher'},studentOf=(id:string)=>({role:'student',teacherId:id});
const many=(n:number,meta:(i:number)=>Record<string,unknown>)=>Array.from({length:n},(_,i)=>({id:'u_'+i,meta:meta(i)}));

// ── claim-teacher: the only path that grants teacher privileges ────────────
test('the earliest account claims teacher when none exists',async()=>{
 const f=fake([{id:'u_1'},{id:'u_2'}]);
 assert.equal((await claimTeacher(f.store,'u_1')).ok,true);
 assert.deepEqual(f.updated,[['u_1',{publicMetadata:{role:'teacher'}}]]);
});
test('claiming refuses once any teacher exists',async()=>{
 const f=fake([{id:'u_1',meta:teacher},{id:'u_2'}]);
 const r=await claimTeacher(f.store,'u_1');
 assert.equal(r.ok,false);assert.equal(r.ok===false&&r.status,409);assert.deepEqual(f.updated,[]);
});
test('claiming refuses an account that is not the earliest',async()=>{
 const f=fake([{id:'u_1'},{id:'u_2'}]);
 const r=await claimTeacher(f.store,'u_2');
 assert.equal(r.ok,false);assert.equal(r.ok===false&&r.status,403);assert.deepEqual(f.updated,[]);
});
test('claiming only ever promotes the caller',async()=>{
 const f=fake([{id:'u_1'},{id:'u_2'}]);
 await claimTeacher(f.store,'u_1');
 assert.deepEqual(f.updated.map(([id])=>id),['u_1']);
});
test('claiming preserves the metadata already on the account',async()=>{
 const f=fake([{id:'u_1',meta:{mustChangePassword:true,nickname:'Mo'}}]);
 await claimTeacher(f.store,'u_1');
 assert.deepEqual(f.updated[0][1].publicMetadata,{mustChangePassword:true,nickname:'Mo',role:'teacher'});
});
test('a teacher beyond the first page still blocks the claim',async()=>{
 const f=fake(many(150,i=>i===120?teacher:{}));
 const r=await claimTeacher(f.store,'u_0');
 assert.equal(r.ok,false);assert.equal(r.ok===false&&r.status,409);
});
test('status reports taken, not_first and claimable',async()=>{
 assert.deepEqual(await claimTeacherStatus(fake([{id:'u_1',meta:teacher}]).store,'u_1'),{claimable:false,reason:'taken'});
 assert.deepEqual(await claimTeacherStatus(fake([{id:'u_1'},{id:'u_2'}]).store,'u_2'),{claimable:false,reason:'not_first'});
 assert.deepEqual(await claimTeacherStatus(fake([{id:'u_1'},{id:'u_2'}]).store,'u_1'),{claimable:true,reason:null});
});

// ── forced first password change ──────────────────────────────────────────
test('a short first password is refused without touching the account',async()=>{
 const f=fake([{id:'u_1',meta:{mustChangePassword:true}}]);
 const r=await completeFirstPassword(f.store,'u_1','short');
 assert.equal(r.ok===false&&r.status,400);assert.deepEqual(f.updated,[]);
});
test('the endpoint refuses once the flag is cleared',async()=>{
 for(const meta of [{},{mustChangePassword:false},{role:'student'}]){
  const f=fake([{id:'u_1',meta}]);
  const r=await completeFirstPassword(f.store,'u_1','a-long-enough-password');
  assert.equal(r.ok===false&&r.status,409,JSON.stringify(meta));assert.deepEqual(f.updated,[]);
 }
});
test('setting the first password clears the flag and drops other sessions',async()=>{
 const f=fake([{id:'u_1',meta:{mustChangePassword:true,role:'student',teacherId:'t_1'}}]);
 assert.equal((await completeFirstPassword(f.store,'u_1','a-long-enough-password')).ok,true);
 const [id,params]=f.updated[0];
 assert.equal(id,'u_1');
 assert.equal(params.password,'a-long-enough-password');
 assert.equal(params.signOutOfOtherSessions,true);
 assert.deepEqual(params.publicMetadata,{mustChangePassword:false,role:'student',teacherId:'t_1'});
});
test('a rejected password surfaces the reason Clerk gave',async()=>{
 const f=fake([{id:'u_1',meta:{mustChangePassword:true}}],{on:'update',error:{errors:[{longMessage:'Password has been found in an online data breach.'}]}});
 const r=await completeFirstPassword(f.store,'u_1','a-long-enough-password');
 assert.equal(r.ok===false&&r.status,400);
 assert.equal(r.ok===false&&r.error,'Password has been found in an online data breach.');
});

// ── teacher gate ──────────────────────────────────────────────────────────
test('only a teacher passes the gate',async()=>{
 assert.equal((await requireTeacher(fake([{id:'u_1',meta:teacher}]).store,'u_1')).ok,true);
 for(const meta of [{},studentOf('t_1'),{role:'Teacher'},{role:null}]){
  const r=await requireTeacher(fake([{id:'u_1',meta}]).store,'u_1');
  assert.equal(r.ok===false&&r.status,403,JSON.stringify(meta));
 }
});

// ── listing students: the multi-teacher isolation rule ────────────────────
test('a teacher sees only their own students',async()=>{
 const f=fake([{id:'s_1',meta:studentOf('t_1')},{id:'s_2',meta:studentOf('t_2')},{id:'t_2',meta:teacher},{id:'s_3',meta:studentOf('t_1')}]);
 assert.deepEqual((await listStudents(f.store,'t_1')).map(s=>s.id),['s_1','s_3']);
});
test('a student with no teacherId belongs to nobody',async()=>{
 const f=fake([{id:'s_1',meta:{role:'student'}}]);
 assert.deepEqual(await listStudents(f.store,'t_1'),[]);
 assert.deepEqual(await listStudents(f.store,'undefined'),[]);
});
test('listing pages past the first hundred accounts',async()=>{
 const f=fake(many(150,()=>studentOf('t_1')));
 assert.equal((await listStudents(f.store,'t_1')).length,150);
});
test('a student name falls back to the username',async()=>{
 const f=fake([{id:'s_1',username:'ana-k',meta:studentOf('t_1')},{id:'s_2',username:'bo',firstName:'Bo',lastName:'Ng',meta:{...studentOf('t_1'),mustChangePassword:true}}]);
 const [ana,bo]=await listStudents(f.store,'t_1');
 assert.equal(ana.name,'ana-k');assert.equal(ana.mustChangePassword,false);
 assert.equal(bo.name,'Bo Ng');assert.equal(bo.mustChangePassword,true);
});

// ── creating a student ────────────────────────────────────────────────────
for(const [label,body] of [
 ['no first name',{firstName:' ',lastName:'Ng',username:'bo-ng',password:'longenough'}],
 ['no last name',{firstName:'Bo',lastName:'',username:'bo-ng',password:'longenough'}],
 ['username too short',{firstName:'Bo',lastName:'Ng',username:'bo',password:'longenough'}],
 ['password too short',{firstName:'Bo',lastName:'Ng',username:'bo-ng',password:'short'}],
 ['username has a space',{firstName:'Bo',lastName:'Ng',username:'bo ng',password:'longenough'}],
 ['username has punctuation',{firstName:'Bo',lastName:'Ng',username:'bo.ng!',password:'longenough'}],
] as Array<[string,Record<string,unknown>]>)
 test('creating rejects '+label,async()=>{
  const f=fake([]);
  const r=await createStudent(f.store,'t_1',body);
  assert.equal(r.ok===false&&r.status,400);assert.deepEqual(f.created,[]);
 });
test('a created student is stamped with the creating teacher and must change the password',async()=>{
 const f=fake([]);
 const r=await createStudent(f.store,'t_1',{firstName:' Bo ',lastName:'Ng',username:'  BO-NG  ',password:'longenough'});
 assert.equal(r.ok,true);
 assert.equal(f.created[0].username,'bo-ng');
 assert.equal(f.created[0].firstName,'Bo');
 assert.deepEqual(f.created[0].publicMetadata,{role:'student',teacherId:'t_1',mustChangePassword:true});
});
test('a create rejected by Clerk surfaces the reason',async()=>{
 const f=fake([],{on:'create',error:{errors:[{message:'That username is taken.'}]}});
 const r=await createStudent(f.store,'t_1',{firstName:'Bo',lastName:'Ng',username:'bo-ng',password:'longenough'});
 assert.equal(r.ok===false&&r.error,'That username is taken.');
});

// ── resetting a student password: the cross-teacher rule ──────────────────
test('a short reset password is refused without touching the account',async()=>{
 const f=fake([{id:'s_1',meta:studentOf('t_1')}]);
 const r=await resetStudentPassword(f.store,'t_1',{studentId:'s_1',password:'short'});
 assert.equal(r.ok===false&&r.status,400);assert.deepEqual(f.updated,[]);
});
test('a teacher cannot reset a student they do not own',async()=>{
 const f=fake([{id:'s_1',meta:studentOf('t_2')}]);
 const r=await resetStudentPassword(f.store,'t_1',{studentId:'s_1',password:'longenough'});
 assert.equal(r.ok===false&&r.status,404);assert.deepEqual(f.updated,[]);
});
test('a teacher cannot reset another teacher account',async()=>{
 const f=fake([{id:'t_2',meta:teacher}]);
 const r=await resetStudentPassword(f.store,'t_1',{studentId:'t_2',password:'longenough'});
 assert.equal(r.ok===false&&r.status,404);assert.deepEqual(f.updated,[]);
});
// Promoting a student leaves their teacherId behind, so ownership alone would
// still match; it is the role check that stops a teacher reaching a colleague.
test('a promoted student can no longer be reset by their old teacher',async()=>{
 const f=fake([{id:'u_2',meta:{role:'teacher',teacherId:'t_1'}}]);
 const r=await resetStudentPassword(f.store,'t_1',{studentId:'u_2',password:'longenough'});
 assert.equal(r.ok===false&&r.status,404);assert.deepEqual(f.updated,[]);
});
test('a promoted student drops off their old teacher roster',async()=>{
 const f=fake([{id:'u_2',meta:{role:'teacher',teacherId:'t_1'}},{id:'s_1',meta:studentOf('t_1')}]);
 assert.deepEqual((await listStudents(f.store,'t_1')).map(s=>s.id),['s_1']);
});
test('an unknown student id is not found rather than an error',async()=>{
 const f=fake([{id:'s_1',meta:studentOf('t_1')}]);
 for(const studentId of ['s_nope','',undefined]){
  const r=await resetStudentPassword(f.store,'t_1',{studentId,password:'longenough'});
  assert.equal(r.ok===false&&r.status,404,String(studentId));
 }
 assert.deepEqual(f.updated,[]);
});
test('resetting a student re-arms the forced change and keeps the owner',async()=>{
 const f=fake([{id:'s_1',username:'ana-k',meta:{...studentOf('t_1'),mustChangePassword:false}}]);
 const r=await resetStudentPassword(f.store,'t_1',{studentId:'s_1',password:'longenough'});
 assert.equal(r.ok,true);assert.equal(r.ok&&r.data.username,'ana-k');
 const [id,params]=f.updated[0];
 assert.equal(id,'s_1');assert.equal(params.password,'longenough');
 assert.deepEqual(params.publicMetadata,{role:'student',teacherId:'t_1',mustChangePassword:true});
});
test('a reset rejected by Clerk surfaces the reason',async()=>{
 const f=fake([{id:'s_1',meta:studentOf('t_1')}],{on:'update',error:{errors:[{longMessage:'Password is too common.'}]}});
 const r=await resetStudentPassword(f.store,'t_1',{studentId:'s_1',password:'longenough'});
 assert.equal(r.ok===false&&r.status,400);
 assert.equal(r.ok===false&&r.error,'Password is too common.');
});

// ── error unwrapping ──────────────────────────────────────────────────────
test('clerkMessage prefers longMessage, then message, then the error, then the fallback',()=>{
 assert.equal(clerkMessage({errors:[{longMessage:'long',message:'short'}]},'fb'),'long');
 assert.equal(clerkMessage({errors:[{message:'short'}]},'fb'),'short');
 assert.equal(clerkMessage(new Error('boom'),'fb'),'boom');
 assert.equal(clerkMessage({errors:[]},'fb'),'fb');
 assert.equal(clerkMessage(null,'fb'),'fb');
 assert.equal(clerkMessage('a string','fb'),'fb');
});
