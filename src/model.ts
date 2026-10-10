export type Segment='Personal'|'Home'|'Corporate'|'School'
export type Role='Individual'|'Parent'|'Child'|'HR Manager/Admin'|'Worker'|'Teacher'|'Student'
export type Skill='Memory'|'Reasoning'|'Writing'|'Creativity'|'Focus'
export type Session={id:string; userId:string; type:'mission'|'focus'|'break'|'game'; skill?:Skill; score:number; creditsEarned:number; xpEarned?:number; date:string; durationMinutes:number; confidence?:number; actual?:number; title:string; response?:string; gameId?:string; difficulty?:number; measurements?:Record<string,number>; completed?:boolean; challengeId?:string}
export type Person={id:string;name:string;email:string;password:string;role:Role;segment:Segment;groupId:string;age?:number;credits:number;xp?:number;skills:Record<Skill,{debt:number;repaid:number}>;sessions:Session[];createdAt:string}
export type Group={id:string;type:'family'|'company'|'class';name:string;code:string;ownerId:string;grade?:string}
export const skills:Skill[]=['Memory','Reasoning','Writing','Creativity','Focus']
export const roleMap:Record<Segment,Role[]>={Personal:['Individual'],Home:['Parent','Child'],Corporate:['HR Manager/Admin','Worker'],School:['Teacher','Student']}
export const groupType=(s:Segment):Group['type']=>s==='Home'?'family':s==='Corporate'?'company':'class'
export const keyId=()=>crypto.randomUUID()
export const daysAgo=(n:number)=>new Date(Date.now()-n*86400000).toISOString()
export const demoUsers:Person[]=[]
export const demoGroups:Group[]=[]
const base=(id:string,name:string,email:string,role:Role,segment:Segment,groupId:string):Person=>({id,name,email,password:'demo1234',role,segment,groupId,credits:26,skills:{Memory:{debt:14,repaid:35},Reasoning:{debt:22,repaid:20},Writing:{debt:37,repaid:18},Creativity:{debt:17,repaid:31},Focus:{debt:29,repaid:23}},sessions:Array.from({length:12},(_,i)=>({id:`${id}-${i}`,userId:id,type:i%4===0?'focus':'mission',skill:skills[i%5],score:58+(i*13)%39,creditsEarned:i%4===0?0:2,date:daysAgo(i),durationMinutes:i%4===0?20:8,confidence:60+(i*7)%35,actual:55+(i*11)%40,title:i%4===0?'Focus session':`${skills[i%5]} practice`})),createdAt:daysAgo(40)})
const parentId='parent-demo', hrId='hr-demo', teacherId='teacher-demo'
demoGroups.push({id:'family-demo',type:'family',name:'Demo Family',code:'FAM-4821',ownerId:parentId},{id:'company-demo',type:'company',name:'Northstar Studio',code:'TEAM-7164',ownerId:hrId},{id:'class-demo',type:'class',name:'Grade 8 — Cedar',code:'CLASS-3092',ownerId:teacherId,grade:'8'})
demoUsers.push(base(parentId,'Morgan Lee','parent@mindledger.demo','Parent','Home','family-demo'),base(hrId,'Alex Rivera','admin@mindledger.demo','HR Manager/Admin','Corporate','company-demo'),base(teacherId,'Jamie Park','teacher@mindledger.demo','Teacher','School','class-demo'))
demoUsers.push(base('child-1','Sam Lee','child1@mindledger.demo','Child','Home','family-demo'),base('child-2','Riley Lee','child2@mindledger.demo','Child','Home','family-demo'))
for(let i=1;i<=5;i++)demoUsers.push(base(`worker-${i}`,['Taylor Reed','Jordan Kim','Casey Morgan','Avery Shah','Quinn Davis'][i-1],`worker${i}@mindledger.demo`,'Worker','Corporate','company-demo'))
for(let i=1;i<=6;i++)demoUsers.push(base(`student-${i}`,['Robin Chen','Skyler Patel','Drew Wilson','Emery Brown','Sage Nguyen','Kai Thompson'][i-1],`student${i}@mindledger.demo`,'Student','School','class-demo'))
