import { useEffect, useState } from 'react'
import { Activity, ArrowRight, Clock3, Eye, Focus, RotateCcw, Sparkles, X } from 'lucide-react'
import { keyId, type Person, type Session } from './model'

export default function FocusSessionPanel({user,onComplete}:{user:Person;onComplete:(s:Session)=>void}){
 const [minutes,setMinutes]=useState(20)
 const [seconds,setSeconds]=useState(20*60)
 const [running,setRunning]=useState(false)
 const [started,setStarted]=useState(false)
 const [done,setDone]=useState(false)
 const [guard,setGuard]=useState(false)
 const [guardNotice,setGuardNotice]=useState('')
 const [distractions,setDistractions]=useState(0)
 const [challenge,setChallenge]=useState('')
 const [tapCount,setTapCount]=useState(0)
 const [tapStart,setTapStart]=useState(0)
 const [challengeMode,setChallengeMode]=useState<'idle'|'reaction'|'memory'|'done'>('idle')
 const [sequence,setSequence]=useState<number[]>([])
 const [answer,setAnswer]=useState('')
 const [score,setScore]=useState<number|null>(null)
 useEffect(()=>{const active=guard&&started&&!done;document.body.classList.toggle('screen-guard-active',active);return()=>document.body.classList.remove('screen-guard-active')},[guard,started,done])
 useEffect(()=>{if(!running)return;if(seconds<=0){finish(true);return}const timer=window.setTimeout(()=>setSeconds(s=>s-1),1000);return()=>window.clearTimeout(timer)},[running,seconds])
 useEffect(()=>{
  if(!guard||!started||done)return
  const pause=(message:string)=>{if(!running)return;setRunning(false);setDistractions(n=>n+1);setGuardNotice(message)}
  const onVisibility=()=>{if(document.hidden)pause('Focus paused because this tab was left. Resume to continue the timer.')}
  const onFullscreen=()=>{if(!document.fullscreenElement)pause('Fullscreen ended, so Screen Guard paused this session. Resume to continue.')}
  document.addEventListener('visibilitychange',onVisibility);document.addEventListener('fullscreenchange',onFullscreen)
  return()=>{document.removeEventListener('visibilitychange',onVisibility);document.removeEventListener('fullscreenchange',onFullscreen)}
 },[guard,started,done,running])
 const format=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`
 const begin=async()=>{setGuardNotice('');if(guard&&!document.fullscreenElement){try{await document.documentElement.requestFullscreen()}catch{setGuardNotice('Fullscreen permission was not granted. Allow fullscreen or turn Screen Guard off.');return}}setStarted(true);setRunning(true)}
 const reset=()=>{if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});setRunning(false);setStarted(false);setDone(false);setSeconds(minutes*60);setDistractions(0);setChallengeMode('idle');setScore(null);setAnswer('');setChallenge('');setGuardNotice('')}
 const finish=(auto=false)=>{if(done)return;setRunning(false);setDone(true);const actualScore=Math.max(0,Math.min(100,70+Math.round((minutes>=15?10:5)-distractions*4)));setScore(actualScore);const elapsed=Math.max(1,Math.floor((minutes*60-seconds)/60));onComplete({id:keyId(),userId:user.id,type:'focus',score:actualScore,creditsEarned:0,date:new Date().toISOString(),durationMinutes:auto?minutes:elapsed,title:'Focus session',confidence:Math.max(0,100-distractions*10)});if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{})}
 const launchChallenge=()=>{setChallengeMode('reaction');setChallenge('Wait for the signal, then tap it.');window.setTimeout(()=>{setChallenge('NOW');setTapStart(Date.now())},1200+Math.random()*2500)}
 const tap=()=>{if(challenge==='NOW'){const ms=Date.now()-tapStart;setTapCount(Math.max(0,100-Math.round(ms/12)));setChallenge(`Reaction: ${ms} ms`);setChallengeMode('done')}else if(challenge.includes('ms'))launchChallenge()}
 const beginMemory=()=>{const seq=Array.from({length:4},()=>Math.floor(Math.random()*9)+1);setSequence(seq);setAnswer('');setChallengeMode('memory');setChallenge(seq.join(' · '));window.setTimeout(()=>setChallenge('Now type the digits in order.'),1800)}
 const checkMemory=()=>{const ok=answer.replace(/\D/g,'')===sequence.join('');setTapCount(ok?100:Math.max(20,100-Math.abs(answer.length-sequence.length)*18));setChallenge(ok?'Memory sequence correct.':'Sequence didn’t match. Nice effort.');setChallengeMode('done')}
 return <>
  <div className="section-head"><div><span className="eyebrow">FOCUS SESSION</span><h2>Make a little room to focus.</h2><p className="section-sub">A timer with optional attention challenges. Distraction logs are self-reported; we don’t monitor other apps.</p></div></div>
  <div className="focus-layout"><div className="focus-main card"><div className="focus-main-top"><span className="eyebrow">{running?'SESSION IN PROGRESS':done?'SESSION COMPLETE':'YOUR FOCUS BLOCK'}</span><select aria-label="Focus duration" value={minutes} disabled={started&&!done} onChange={e=>{const next=Number(e.target.value);setMinutes(next);setSeconds(next*60)}}><option value="5">5 minutes</option><option value="10">10 minutes</option><option value="20">20 minutes</option><option value="25">25 minutes</option><option value="45">45 minutes</option></select></div>
   {!started&&<label className="screen-guard-setting"><input type="checkbox" checked={guard} onChange={e=>setGuard(e.target.checked)}/><span><b>Screen Guard</b><small>Use fullscreen and pause if you leave the focus screen.</small></span></label>}
   {guard&&<div className="screen-guard-note">Screen Guard can’t block Alt+Tab or prevent switching apps. If you leave this tab or exit fullscreen, the timer pauses when the browser reports it.</div>}
   {guardNotice&&<div className="guard-alert" role="status">{guardNotice}</div>}
   <div className={`timer-circle ${running?'timer-running':''}`}><span>{format(seconds)}</span><small>{running?'stay with one thing':done?'well done':'one thing at a time'}</small></div>
   <div className="timer-controls">{!started?<button className="btn btn-primary" onClick={()=>void begin()}>Start focus <ArrowRight size={15}/></button>:done?<button className="btn btn-primary" onClick={reset}><RotateCcw size={15}/> New session</button>:<><button className="btn btn-primary" onClick={()=>running?setRunning(false):void begin()}>{running?'Pause':'Resume'}</button><button className="btn btn-secondary" onClick={()=>finish(false)}>Finish early</button><button className="icon-btn" onClick={reset} aria-label="Reset timer"><X size={17}/></button></>}</div>
   <div className="focus-challenge"><div className="card-heading"><div><h3>Optional attention challenge</h3><p>Record how you respond. It’s a small game, not a test.</p></div><span className="metric-icon violet"><Sparkles size={16}/></span></div><div className="challenge-actions"><button className="btn btn-secondary" onClick={launchChallenge} disabled={!running}>Reaction-time tap</button><button className="btn btn-secondary" onClick={beginMemory} disabled={!running}>Working-memory sequence</button></div>{challenge&&<div className={`challenge-prompt ${challenge==='NOW'?'now':''}`} onClick={tap} role="button" tabIndex={0} onKeyDown={e=>e.key==='Enter'&&tap()}>{challengeMode==='memory'&&challenge.includes('digits')?<><input value={answer} onChange={e=>setAnswer(e.target.value)} aria-label="Memory sequence answer"/><button className="btn btn-primary" onClick={e=>{e.stopPropagation();checkMemory()}}>Check</button></>:challenge}</div>}</div>
  </div><div className="focus-side"><div className="card distraction-card"><div className="card-heading"><div><h3>Distraction log</h3><p>Self-reported, plus Screen Guard interruptions</p></div><span className="metric-icon rose"><Eye size={17}/></span></div><p>Notice a distraction? Log it and gently return to your task.</p><div className="distraction-count"><b>{distractions}</b><span>noticed</span></div><button className="btn btn-secondary full-btn" onClick={()=>setDistractions(distractions+1)} disabled={!started||!running}>Log a distraction</button></div><div className="card session-score"><span className="eyebrow">ATTENTION SCORE</span><div className="score-big">{score??tapCount}<small>/100</small></div><p>{score===null?'Your session score appears when you finish.':score>=75?'Steady practice adds up.':'You showed up. Try a shorter block next time.'}</p></div></div></div>
 </>
}
