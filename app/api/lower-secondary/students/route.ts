import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { ensureSchema, sql } from "@/lib/db";

async function teacherViewer() {
  const { userId } = await auth(); if (!userId) return null;
  const clerk=await clerkClient(); const user=await clerk.users.getUser(userId);
  return user.publicMetadata.role==="teacher"?{userId,clerk}:null;
}
function requestedStage(request:Request,bodyStage?:unknown){const value=Number(bodyStage??new URL(request.url).searchParams.get("stage")??7);return value===8||value===9?value:7;}
export async function GET(request:Request){
  const viewer=await teacherViewer(); if(!viewer)return NextResponse.json({error:"Teacher access is required."},{status:403});
  const stage=requestedStage(request); await ensureSchema(); const [users,enrolled]=await Promise.all([viewer.clerk.users.getUserList({limit:100}),sql`SELECT student_id FROM lower_secondary_enrollments WHERE teacher_id=${viewer.userId} AND stage=${stage}`]);
  const ids=new Set(enrolled.map(row=>String(row.student_id)));
  return NextResponse.json(users.data.filter(user=>user.publicMetadata.role==="student").map(user=>({id:user.id,name:[user.firstName,user.lastName].filter(Boolean).join(" ")||user.username||"Student",username:user.username,enrolled:ids.has(user.id)})));
}
export async function POST(request:Request){
  const viewer=await teacherViewer(); if(!viewer)return NextResponse.json({error:"Teacher access is required."},{status:403});
  const body=await request.json(); const stage=requestedStage(request,body.stage); const requested=Array.from(new Set<string>(Array.isArray(body.studentIds)?body.studentIds.map(String):[]));
  const users=await viewer.clerk.users.getUserList({limit:100}); const valid=new Set(users.data.filter(user=>user.publicMetadata.role==="student").map(user=>user.id)); const studentIds=requested.filter(id=>valid.has(id));
  await ensureSchema(); await sql`DELETE FROM lower_secondary_enrollments WHERE teacher_id=${viewer.userId} AND stage=${stage}`;
  for(const studentId of studentIds)await sql`INSERT INTO lower_secondary_enrollments (teacher_id,student_id,stage) VALUES (${viewer.userId},${studentId},${stage})`;
  return NextResponse.json({saved:true,enrolled:studentIds.length,stage});
}
