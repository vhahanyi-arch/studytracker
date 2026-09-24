import {test} from 'node:test';import assert from 'node:assert/strict';
import {project,rubberband,releaseVelocity,criticalSpring,settled} from '@/lib/gesture-physics';

test('a flick projects forward in its own direction',()=>{
 assert.ok(Math.abs(project(1000)-499)<1);
 assert.ok(project(-1000)<0);
 assert.equal(project(0),0);
});

// The drawer decides open or closed from where the flick is going, so a fast
// short flick has to be able to carry past the halfway point.
test('a faster flick lands further away',()=>{
 assert.ok(project(1500)>project(500));
});

test('rubber-banding always follows less than the pointer and never reaches the limit',()=>{
 for(const overshoot of [1,40,300,5000]){
  const moved=rubberband(overshoot,300);
  assert.ok(moved>0&&moved<overshoot);
  assert.ok(moved<300);
 }
 assert.ok(rubberband(-80,300)<0);
 assert.equal(rubberband(0,300),0);
 assert.equal(rubberband(50,0),0);
});

test('release velocity comes from the last 100 ms only',()=>{
 // Fast early on, then held still for 150 ms before letting go.
 const paused=[{x:0,t:0},{x:200,t:50},{x:200,t:120},{x:200,t:200}];
 assert.equal(releaseVelocity(paused),0);
 const steady=[{x:0,t:0},{x:10,t:16},{x:20,t:32},{x:30,t:48}];
 assert.ok(Math.abs(releaseVelocity(steady)-625)<1);
 assert.equal(releaseVelocity([{x:5,t:0}]),0);
});

test('a critically damped spring starts where it is, at the speed it has',()=>{
 const start=criticalSpring(-300,0,800,0.3,0);
 assert.equal(start.value,-300);
 assert.ok(Math.abs(start.velocity-800)<1e-9);
});

test('a critically damped spring never overshoots its target',()=>{
 for(let t=0;t<2;t+=1/120){
  assert.ok(criticalSpring(-300,0,0,0.3,t).value<=1e-9);
 }
});

test('a spring settles within about twice its response',()=>{
 const end=criticalSpring(-300,0,0,0.3,0.6);
 assert.ok(settled(end.value,end.velocity,0));
 const mid=criticalSpring(-300,0,0,0.3,0.1);
 assert.ok(!settled(mid.value,mid.velocity,0));
});
