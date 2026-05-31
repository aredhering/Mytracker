import { useState } from "react";

function getMoonPhase(date) {
  const known = new Date(2000, 0, 6);
  const cycle = 29.53058867;
  const diff = (date - known) / (1000 * 60 * 60 * 24);
  const phase = ((diff % cycle) + cycle) % cycle;
  const pct = phase / cycle;
  let name, emoji, illumination;
  if (phase < 1.85)       { name = "New Moon";        emoji = "🌑"; illumination = 0; }
  else if (phase < 7.38)  { name = "Waxing Crescent"; emoji = "🌒"; illumination = Math.round(pct * 50); }
  else if (phase < 9.22)  { name = "First Quarter";   emoji = "🌓"; illumination = 50; }
  else if (phase < 14.77) { name = "Waxing Gibbous";  emoji = "🌔"; illumination = Math.round(pct * 100); }
  else if (phase < 16.61) { name = "Full Moon";       emoji = "🌕"; illumination = 100; }
  else if (phase < 22.15) { name = "Waning Gibbous";  emoji = "🌖"; illumination = Math.round((1-(phase-14.77)/14.77)*100); }
  else if (phase < 23.99) { name = "Last Quarter";    emoji = "🌗"; illumination = 50; }
  else                    { name = "Waning Crescent";  emoji = "🌘"; illumination = Math.round((1-pct)*30); }
  return { name, emoji, illumination: Math.max(0,Math.min(100,illumination)), phaseDays: Math.round(phase) };
}

const MOODS = [
  { label: "Terrible", emoji: "😩", color: "#ef4444" },
  { label: "Rough",    emoji: "😕", color: "#f97316" },
  { label: "Meh",      emoji: "😐", color: "#eab308" },
  { label: "Good",     emoji: "🙂", color: "#84cc16" },
  { label: "Amazing",  emoji: "🤩", color: "#22c55e" },
];

const HABITS = [
  { id: "workout",  label: "30 Min Workout",    icon: "🏋️", color: "#f472b6" },
  { id: "water",    label: "4 Glasses of Water", icon: "💧", color: "#38bdf8" },
  { id: "nojunk",   label: "No Junk Food",       icon: "🥗", color: "#34d399" },
  { id: "cleaning", label: "15 Min Cleaning",    icon: "🧹", color: "#a78bfa" },
];

function getTodayKey() { return new Date().toISOString().slice(0,10); }
function getWeekDays() {
  const today = new Date();
  return Array.from({length:7},(_,i)=>{ const d=new Date(today); d.setDate(today.getDate()-(6-i)); return d.toISOString().slice(0,10); });
}
const DAY_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const getStorage = () => { try { return JSON.parse(localStorage.getItem("dl_log")||"{}"); } catch { return {}; } };
const setStorage = (data) => { try { localStorage.setItem("dl_log", JSON.stringify(data)); } catch {} };

function FloatingPlayer() {
  const [expanded, setExpanded] = useState(false);
  const playerH = expanded ? 300 : 68;

  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:"rgba(6,9,18,0.97)",backdropFilter:"blur(20px)",borderTop:"1px solid #a78bfa33",height:playerH,overflow:"hidden",transition:"height .35s cubic-bezier(.4,0,.2,1)",boxShadow:"0 -8px 40px rgba(0,0,0,.7)"}}>
      <div style={{height:66,display:"flex",alignItems:"center",gap:12,padding:"0 16px"}}>
        <div onClick={()=>setExpanded(e=>!e)} style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#a78bfa44,#a78bfa22)",border:"1px solid #a78bfa55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,cursor:"pointer"}}>
          🎵
        </div>
        <div style={{flex:1,minWidth:0,cursor:"pointer"}} onClick={()=>setExpanded(e=>!e)}>
          <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0"}}>Meditation Music</div>
          <div style={{fontSize:10,color:"#475569",marginTop:1}}>ambient · relaxing · meditative</div>
        </div>
        <div onClick={()=>setExpanded(e=>!e)} style={{color:"#334155",fontSize:14,cursor:"pointer",transform:expanded?"rotate(180deg)":"rotate(0)",transition:"transform .3s"}}>▾</div>
      </div>
      <div style={{padding:"0 16px 16px",height:234}}>
        <iframe
          width="100%"
          height="214"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/209082545&color=%23a78bfa&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&show_artwork=false"
          style={{borderRadius:12}}
        />
      </div>
    </div>
  );
}

export default function DailyTracker() {
  const todayKey = getTodayKey();
  const moon = getMoonPhase(new Date());
  const weekDays = getWeekDays();
  const [log, setLog] = useState(getStorage);
  const [activeTab, setActiveTab] = useState("today");

  const saveLog = (nl) => { setLog(nl); setStorage(nl); };
  const todayData = log[todayKey]||{};
  const habits = HABITS.map(h=>({...h,done:!!todayData[h.id]}));
  const mood = todayData.mood??null;
  const sleep = todayData.sleep??"";
  const notes = todayData.notes??"";

  const toggleHabit = (id) => saveLog({...log,[todayKey]:{...todayData,[id]:!todayData[id]}});
  const setMood   = (m) => saveLog({...log,[todayKey]:{...todayData,mood:m}});
  const setSleep  = (v) => saveLog({...log,[todayKey]:{...todayData,sleep:v}});
  const setNotes  = (v) => saveLog({...log,[todayKey]:{...todayData,notes:v}});

  const doneCount = habits.filter(h=>h.done).length;
  const hasMood = mood!==null, hasSleep = sleep!=="", hasNotes = notes.trim()!=="";
  const totalItems = HABITS.length+3;
  const completedItems = doneCount+(hasMood?1:0)+(hasSleep?1:0)+(hasNotes?1:0);
  const completionPct = Math.round((completedItems/totalItems)*100);

  const streak = (()=>{ let s=0; const d=new Date(); while(s<365){ const key=d.toISOString().slice(0,10); const e=log[key]||{}; const any=HABITS.some(h=>e[h.id])||e.mood!=null||e.sleep||e.notes; if(!any&&key!==todayKey)break; if(any)s++; d.setDate(d.getDate()-1); } return s; })();
  const todayFmt = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  return (
    <div style={{minHeight:"100vh",background:"#080b14",fontFamily:"'DM Sans','Segoe UI',sans-serif",color:"#e2e8f0",position:"relative",overflow:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes moonGlow{0%,100%{text-shadow:0 0 20px #fff8,0 0 40px #a5b4fc55}50%{text-shadow:0 0 30px #fffd,0 0 60px #a5b4fc88}}
        @keyframes starTwinkle{0%,100%{opacity:.2}50%{opacity:.9}}
        @keyframes checkPop{0%{transform:scale(.8)}60%{transform:scale(1.18)}100%{transform:scale(1)}}
        .habit-row{transition:background .2s,transform .15s;cursor:pointer;}
        .habit-row:hover{transform:translateX(4px);background:rgba(255,255,255,.07)!important;}
        .mood-btn{transition:transform .15s,box-shadow .15s;cursor:pointer;border:none;}
        .mood-btn:hover{transform:scale(1.13);}
        .tab-pill{transition:all .2s;cursor:pointer;border:none;}
        .sleep-input{background:rgba(255,255,255,.06);border:1.5px solid rgba(255,255,255,.12);border-radius:12px;color:#e2e8f0;font-size:20px;font-family:'DM Sans',sans-serif;font-weight:600;width:100%;padding:11px 16px;outline:none;transition:border-color .2s;}
        .sleep-input:focus{border-color:#a78bfa;}
        .sleep-input::placeholder{color:#ffffff33;font-size:15px;}
        .notes-area{background:rgba(255,255,255,.05);border:1.5px solid rgba(255,255,255,.1);border-radius:14px;color:#e2e8f0;font-size:14px;font-family:'DM Sans',sans-serif;line-height:1.6;width:100%;padding:13px 15px;outline:none;resize:none;min-height:100px;transition:border-color .2s;}
        .notes-area:focus{border-color:#6366f1;}
        .notes-area::placeholder{color:#ffffff2a;}
        ::-webkit-scrollbar{width:4px;height:4px;} ::-webkit-scrollbar-track{background:transparent;} ::-webkit-scrollbar-thumb{background:#ffffff18;border-radius:2px;}
      `}</style>

      {Array.from({length:28}).map((_,i)=>(
        <div key={i} style={{position:"fixed",borderRadius:"50%",width:`${1+(i%3)}px`,height:`${1+(i%3)}px`,background:"#fff",top:`${(i*31+7)%95}%`,left:`${(i*17+11)%97}%`,opacity:.15+(i%5)*.08,animation:`starTwinkle ${2+(i%4)}s ${i*.3}s ease-in-out infinite`,pointerEvents:"none"}}/>
      ))}

      <FloatingPlayer />

      <div style={{maxWidth:460,margin:"0 auto",padding:"0 16px 100px"}}>
        <div style={{paddingTop:32,paddingBottom:16,animation:"fadeUp .5s ease"}}>
          <div style={{fontSize:11,letterSpacing:3,color:"#475569",textTransform:"uppercase",marginBottom:4}}>{todayFmt}</div>
          <div style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:900,lineHeight:1.1,background:"linear-gradient(135deg,#e2e8f0 30%,#a5b4fc 70%,#c4b5fd)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Daily Log</div>
        </div>

        <div style={{display:"flex",gap:10,marginBottom:12,animation:"fadeUp .5s .05s ease both"}}>
          <div style={{flex:1.4,background:"linear-gradient(135deg,#0f172a,#1e1b4b)",border:"1px solid #312e8144",borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:40,animation:"moonGlow 3s ease-in-out infinite",lineHeight:1}}>{moon.emoji}</div>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:700,color:"#e0e7ff"}}>{moon.name}</div>
              <div style={{fontSize:11,color:"#6366f1",marginTop:2}}>{moon.illumination}% illuminated</div>
              <div style={{fontSize:11,color:"#3730a3",marginTop:1}}>Day {moon.phaseDays} of cycle</div>
            </div>
          </div>
          <div style={{flex:1,background:"linear-gradient(135deg,#1c0a00,#431407)",border:"1px solid #9a341255",borderRadius:18,padding:"14px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
            <div style={{fontSize:28}}>🔥</div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:900,color:"#fb923c",lineHeight:1}}>{streak}</div>
            <div style={{fontSize:10,color:"#9a3412",marginTop:2,letterSpacing:1}}>DAY STREAK</div>
          </div>
        </div>

        <div style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.07)",borderRadius:14,padding:"12px 16px",marginBottom:12,animation:"fadeUp .5s .1s ease both"}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}>
            <span style={{fontSize:12,color:"#64748b"}}>Today's progress</span>
            <span style={{fontSize:12,fontWeight:700,color:completionPct===100?"#34d399":"#a78bfa"}}>{completedItems}/{totalItems} complete</span>
          </div>
          <div style={{background:"#ffffff0d",borderRadius:99,height:7,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${completionPct}%`,background:completionPct===100?"linear-gradient(90deg,#34d399,#059669)":"linear-gradient(90deg,#6366f1,#a78bfa,#c4b5fd)",borderRadius:99,transition:"width .6s cubic-bezier(.34,1.56,.64,1)"}}/>
          </div>
        </div>

        <div style={{display:"flex",background:"rgba(255,255,255,.04)",borderRadius:14,padding:4,marginBottom:14,animation:"fadeUp .5s .15s ease both"}}>
          {["today","week"].map(tab=>(
            <button key={tab} className="tab-pill" onClick={()=>setActiveTab(tab)} style={{flex:1,padding:"9px",borderRadius:10,background:activeTab===tab?"rgba(99,102,241,.3)":"transparent",color:activeTab===tab?"#c4b5fd":"#475569",fontWeight:activeTab===tab?700:500,fontSize:13,letterSpacing:.5,boxShadow:activeTab===tab?"0 0 0 1px #6366f133":"none"}}>
              {tab==="today"?"✦ Today":"◈ This Week"}
            </button>
          ))}
        </div>

        {activeTab==="today" && (
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:9}}>Habits</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {habits.map(h=>(
                  <div key={h.id} className="habit-row" onClick={()=>toggleHabit(h.id)} style={{display:"flex",alignItems:"center",gap:13,background:h.done?`${h.color}12`:"rgba(255,255,255,.04)",border:`1.5px solid ${h.done?h.color+"44":"rgba(255,255,255,.07)"}`,borderRadius:14,padding:"12px 15px"}}>
                    <div style={{width:27,height:27,borderRadius:8,border:`2px solid ${h.done?h.color:"#334155"}`,background:h.done?h.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .2s",animation:h.done?"checkPop .3s ease":"none",boxShadow:h.done?`0 0 9px ${h.color}55`:"none"}}>
                      {h.done&&<span style={{color:"#fff",fontSize:13,fontWeight:900}}>✓</span>}
                    </div>
                    <span style={{fontSize:20}}>{h.icon}</span>
                    <span style={{fontSize:13,fontWeight:600,color:h.done?"#e2e8f0":"#94a3b8",flex:1}}>{h.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:9}}>Hours of Sleep 😴</div>
              <div style={{position:"relative"}}>
                <input type="number" min="0" max="24" step=".5" className="sleep-input" value={sleep} onChange={e=>setSleep(e.target.value)} placeholder="Enter hours e.g. 7.5"/>
                {sleep&&<div style={{position:"absolute",right:14,top:"50%",transform:"translateY(-50%)",fontSize:12,fontWeight:700,color:sleep>=7?"#34d399":sleep>=5?"#eab308":"#ef4444"}}>{sleep>=7?"Great 💚":sleep>=5?"Okay 🟡":"Low 🔴"}</div>}
              </div>
              {sleep&&<div style={{marginTop:7,height:5,background:"#ffffff0d",borderRadius:99,overflow:"hidden"}}><div style={{height:"100%",width:`${Math.min(100,(sleep/9)*100)}%`,background:sleep>=7?"linear-gradient(90deg,#34d399,#059669)":sleep>=5?"linear-gradient(90deg,#eab308,#ca8a04)":"linear-gradient(90deg,#ef4444,#b91c1c)",borderRadius:99,transition:"width .4s ease"}}/></div>}
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:9}}>Today's Mood</div>
              <div style={{display:"flex",gap:7}}>
                {MOODS.map((m,i)=>(
                  <button key={m.label} className="mood-btn" onClick={()=>setMood(i)} style={{flex:1,padding:"9px 3px",borderRadius:13,background:mood===i?`${m.color}20`:"rgba(255,255,255,.04)",outline:mood===i?`1.5px solid ${m.color}77`:"1.5px solid transparent",display:"flex",flexDirection:"column",alignItems:"center",gap:4,boxShadow:mood===i?`0 0 10px ${m.color}33`:"none"}}>
                    <span style={{fontSize:22}}>{m.emoji}</span>
                    <span style={{fontSize:9,color:mood===i?m.color:"#475569",fontWeight:600,letterSpacing:.3}}>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:9}}>Notes About Your Day ✍️</div>
              <textarea className="notes-area" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="How did today feel? What happened? Anything on your mind..."/>
              {notes&&<div style={{textAlign:"right",fontSize:11,color:"#334155",marginTop:4}}>{notes.length} chars</div>}
            </div>

            {completionPct===100&&(
              <div style={{textAlign:"center",padding:"16px",background:"linear-gradient(135deg,#052e1666,#14532d33)",border:"1px solid #16a34a44",borderRadius:18}}>
                <div style={{fontSize:28}}>🌟</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:900,color:"#4ade80",marginTop:4}}>Full day complete!</div>
                <div style={{fontSize:12,color:"#16a34a",marginTop:3}}>You're absolutely crushing it.</div>
              </div>
            )}
          </div>
        )}

        {activeTab==="week" && (
          <div style={{animation:"fadeUp .3s ease"}}>
            <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:18,padding:"14px",marginBottom:14}}>
              <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:12}}>Completion by Day</div>
              <div style={{display:"flex",gap:5,alignItems:"flex-end",height:70}}>
                {weekDays.map(day=>{
                  const e=log[day]||{}; const done=HABITS.filter(h=>e[h.id]).length;
                  const comp=done+(e.mood!=null?1:0)+(e.sleep?1:0)+(e.notes?.trim()?1:0);
                  const total=HABITS.length+3; const pct=comp/total; const isT=day===todayKey;
                  const dow=new Date(day+"T12:00:00").getDay();
                  return (
                    <div key={day} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5}}>
                      <div style={{width:"100%",height:60,borderRadius:7,overflow:"hidden",background:"rgba(255,255,255,.05)",border:isT?"1.5px solid #6366f155":"1px solid rgba(255,255,255,.05)",position:"relative"}}>
                        <div style={{position:"absolute",bottom:0,left:0,right:0,height:`${pct*100}%`,background:pct===1?"linear-gradient(to top,#34d399,#6ee7b7)":pct>=.5?"linear-gradient(to top,#6366f1,#a5b4fc)":pct>0?"linear-gradient(to top,#f59e0b,#fcd34d)":"transparent",transition:"height .5s ease"}}/>
                      </div>
                      <span style={{fontSize:9,color:isT?"#a5b4fc":"#475569",fontWeight:isT?700:400}}>{DAY_SHORT[dow]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:9}}>Habit Breakdown</div>
            {[...HABITS,{id:"mood",label:"Mood logged",icon:"😊",color:"#f59e0b"},{id:"sleep",label:"Sleep logged",icon:"😴",color:"#818cf8"},{id:"notes",label:"Notes written",icon:"✍️",color:"#34d399"}].map(h=>{
              const weekDone=weekDays.filter(d=>h.id==="mood"?log[d]?.mood!=null:h.id==="sleep"?!!log[d]?.sleep:h.id==="notes"?!!(log[d]?.notes?.trim()):!!log[d]?.[h.id]).length;
              return (
                <div key={h.id} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:11,padding:"11px 13px",marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"center"}}>
                    <span style={{fontSize:13}}>{h.icon} <span style={{fontSize:12,fontWeight:500,color:"#94a3b8"}}>{h.label}</span></span>
                    <span style={{fontWeight:700,color:h.color,fontSize:13}}>{weekDone}/7</span>
                  </div>
                  <div style={{background:"#ffffff09",borderRadius:99,height:4}}>
                    <div style={{height:"100%",width:`${(weekDone/7)*100}%`,background:`linear-gradient(90deg,${h.color}77,${h.color})`,borderRadius:99,transition:"width .5s ease"}}/>
                  </div>
                </div>
              );
            })}

            <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:9,marginTop:14}}>Mood History</div>
            <div style={{display:"flex",gap:7}}>
              {weekDays.map(day=>{
                const m=log[day]?.mood; const dow=new Date(day+"T12:00:00").getDay(); const isT=day===todayKey;
                return (
                  <div key={day} style={{flex:1,textAlign:"center",background:"rgba(255,255,255,.03)",border:`1px solid ${isT?"#6366f155":"rgba(255,255,255,.06)"}`,borderRadius:11,padding:"9px 3px"}}>
                    <div style={{fontSize:18,lineHeight:1,marginBottom:3}}>{m!=null?MOODS[m].emoji:"·"}</div>
                    <div style={{fontSize:9,color:isT?"#a5b4fc":"#475569"}}>{DAY_SHORT[dow]}</div>
                  </div>
                );
              })}
            </div>

            {weekDays.some(d=>log[d]?.notes?.trim()) && (
              <>
                <div style={{fontSize:10,letterSpacing:2,color:"#475569",textTransform:"uppercase",marginBottom:9,marginTop:14}}>Recent Notes</div>
                {[...weekDays].reverse().filter(d=>log[d]?.notes?.trim()).slice(0,3).map(day=>{
                  const dow=new Date(day+"T12:00:00").getDay();
                  return (
                    <div key={day} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"11px 13px",marginBottom:8}}>
                      <div style={{fontSize:10,color:"#6366f1",marginBottom:5,letterSpacing:1}}>{DAY_SHORT[dow]} · {day}</div>
                      <div style={{fontSize:13,color:"#94a3b8",lineHeight:1.5,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{log[day].notes}</div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}