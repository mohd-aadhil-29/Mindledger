import { useEffect, useState } from 'react'
import { Activity, ArrowRight, Brain, Check, Clock3, Coins, LoaderCircle, ShieldCheck, Sparkles } from 'lucide-react'
import { keyId, type Person, type Session, type Skill } from './model'

type Mission={skill:Skill;title:string;tag:string;instruction:string;placeholder:string;minWords:number}
type Evaluation={score:number;xpEarned:number;feedback:string;strength:string;nextStep:string}
const missions:Mission[]=[
 {skill:'Memory',title:'Memory Recall',tag:'RECALL',instruction:'Without consulting notes, recall three details or ideas you remember from something you learned recently. Explain each in your own words.',placeholder:'Write the three details you can recall…',minWords:18},
 {skill:'Creativity',title:'Creative Thinking',tag:'IDEAS',instruction:'Imagine an ordinary object: a paperclip. List five different, specific uses for it. Try to make at least two ideas surprising.',placeholder:'List five distinct uses…',minWords:18},
 {skill:'Reasoning',title:'Critical Thinking',tag:'ARGUE BOTH SIDES',instruction:'Consider the claim “Every meeting should be an email.” Make a reasonable argument against it and give one concrete example.',placeholder:'Build your counterargument…',minWords:20}
]

export default function MissionPanel({user,onComplete,notify}:{user:Person;onComplete:(s:Session)=>void;notify:(s:string)=>void}){
 const [chosen,setChosen]=useState<number|null>(null)
 const [response,setResponse]=useState('')
 const [confidence,setConfidence]=useState(65)
 const [saved,setSaved]=useState(false)
 const [evaluating,setEvaluating]=useState(false)
 const [evaluation,setEvaluation]=useState<Evaluation|null>(null)
 useEffect(()=>{if(chosen===null)return;try{const old=JSON.parse(localStorage.getItem(`mindledger.draft.${user.id}.${chosen}`)||'null');if(old){setResponse(old.response||'');setConfidence(old.confidence||65);setSaved(true)}}catch{}},[chosen,user.id])
 const mission=chosen===null?null:missions[chosen]
 const words=response.trim().split(/\s+/).filter(Boolean)
 const distinct=new Set(words.map(w=>w.toLowerCase().replace(/[^a-z]/g,''))).size
 const saveDraft=()=>{localStorage.setItem(`mindledger.draft.${user.id}.${chosen}`,JSON.stringify({response,confidence}));setSaved(true);notify('Mission draft saved on this device.')}
 const complete=async()=>{
  if(!mission||evaluating||evaluation)return
  if(words.length<mission.minWords||distinct<8){notify(`Add a little more detail first: aim for at least ${mission.minWords} words and a few distinct ideas.`);return}
  setEvaluating(true)
  try{
   const responseFromApi=await fetch('/api/mission-evaluate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:mission.title,skill:mission.skill,instruction:mission.instruction,response}),signal:AbortSignal.timeout(35_000)})
   let data:Evaluation&{message?:string}
   try{data=await responseFromApi.json() as Evaluation&{message?:string}}catch{throw new Error('The evaluation reply was interrupted. Your draft is safe; please retry.')}
   if(!responseFromApi.ok)throw new Error(data.message||'AI scoring is unavailable. Your draft is safe; please retry.')
   if(!Number.isInteger(data.score)||data.score<0||data.score>100||!Number.isInteger(data.xpEarned)||data.xpEarned<0||data.xpEarned>10||typeof data.feedback!=='string'||typeof data.strength!=='string'||typeof data.nextStep!=='string')throw new Error('The AI returned an incomplete evaluation. Your draft is safe; please retry.')
   const now=new Date();const challengeId=`mission:${user.id}:${chosen}:${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`
   const xpEarned=user.sessions.some(s=>s.challengeId===challengeId)?0:data.xpEarned
   setEvaluation({...data,xpEarned})
   onComplete({id:keyId(),userId:user.id,type:'mission',skill:mission.skill,score:data.score,creditsEarned:data.score>=55&&xpEarned>0?2:0,xpEarned,date:now.toISOString(),durationMinutes:4,confidence,actual:data.score,title:mission.title,response,challengeId})
   localStorage.removeItem(`mindledger.draft.${user.id}.${chosen}`)
  }catch(e){notify(e instanceof Error?e.message:'AI scoring is unavailable. Your draft is safe; please retry.')}
  finally{setEvaluating(false)}
 }
 return <>
  <div className="section-head"><div><span className="eyebrow">AI-EVALUATED MISSIONS</span><h2>Think it through, your way.</h2><p className="section-sub">Gemini gives a practice rating, specific feedback, and XP based on your response.</p></div>{chosen!==null&&<button className="btn btn-secondary" onClick={()=>{setChosen(null);setEvaluation(null)}}>All missions</button>}</div>
  {chosen===null?<div className="mission-grid">{missions.map((m,i)=><button className="mission-card card" key={m.title} onClick={()=>{setChosen(i);setEvaluation(null)}}><div className="mission-top"><span className={`mission-glyph glyph-${i}`}>{i===0?<Brain size={20}/>:i===1?<Sparkles size={20}/>:<Activity size={20}/>}</span><span className="mission-tag">{m.tag}</span></div><h3>{m.title}</h3><p>{m.instruction}</p><div className="mission-meta"><span><Clock3 size={14}/> 4–6 min</span><span className="credit-reward"><Sparkles size={14}/> Up to 10 XP</span></div><div className="mission-cta">Begin mission <ArrowRight size={15}/></div></button>)}</div>:<div className="mission-work card"><div className="mission-work-head"><span className="mission-tag">{mission!.tag} · {mission!.skill}</span><span className="quiet">4–6 MIN</span></div><h2>{mission!.title}</h2><p>{mission!.instruction}</p>{!evaluation?<><label className="field mission-answer"><span>Your response <small>{words.length} words · {saved?'Draft saved':''}</small></span><textarea value={response} onChange={e=>{setResponse(e.target.value);setSaved(false)}} rows={7} placeholder={mission!.placeholder} disabled={evaluating}/></label><label className="confidence-control"><span>How confident are you in your response? <b>{confidence}%</b></span><input type="range" min="0" max="100" value={confidence} disabled={evaluating} onChange={e=>setConfidence(Number(e.target.value))}/><small>Confidence helps you reflect on how sure you felt.</small></label><div className="scoring-note"><ShieldCheck size={15}/> AI evaluates relevance, detail, reasoning, and clarity. Your response goes to Gemini for scoring and is not shown to supervisors.</div><div className="button-row"><button className="btn btn-secondary" onClick={saveDraft} disabled={evaluating}>Save and resume</button><button className="btn btn-primary" onClick={()=>void complete()} disabled={evaluating}>{evaluating?<><LoaderCircle className="spin" size={15}/> Evaluating…</>:<>Evaluate mission <ArrowRight size={15}/></>}</button></div></>:<div className="mission-feedback"><span className="check-bubble"><Check/></span><h3>AI practice rating · {evaluation.score}/100</h3><p className="mission-feedback-strength">{evaluation.strength}</p><p>{evaluation.feedback}</p><div className="scoring-note mission-next-step"><Sparkles size={15}/>{evaluation.nextStep}</div><div className="credit-earn"><Sparkles size={16}/> +{evaluation.xpEarned} XP{evaluation.score>=55&&evaluation.xpEarned>0&&<> · <Coins size={15}/> +2 Think Credits</>}</div><button className="btn btn-primary" onClick={()=>{setChosen(null);setResponse('');setSaved(false);setEvaluation(null)}}>Choose another mission <ArrowRight size={15}/></button></div>}</div>}
 </>
}
