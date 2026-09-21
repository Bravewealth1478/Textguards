'use client';
import {useMemo,useState} from 'react';
import {ShieldCheck,ScanSearch,Sparkles,PenLine,Upload,CheckCircle2,Copy,ArrowRight,ExternalLink,FileText,AlertTriangle} from 'lucide-react';

const SOURCES=[
 {id:'src-1',title:'Social Media and Public Opinion',url:'https://example.org/textguard/demo/social-media-public-opinion',text:'Social media platforms have changed how young people discover news, discuss public issues, and form opinions. The speed of sharing can increase access to information while also making misinformation easier to spread.'},
 {id:'src-2',title:'Digital News Consumption',url:'https://example.org/textguard/demo/digital-news-consumption',text:'Young people increasingly use social media as a source of news and information. Online discussions can shape attitudes toward social, political, and economic issues, especially when users repeatedly encounter similar viewpoints.'},
 {id:'src-3',title:'Misinformation in Online Communities',url:'https://example.org/textguard/demo/misinformation-online-communities',text:'Misinformation can travel quickly through online communities. Repeated exposure to inaccurate claims may affect how users understand events and evaluate public issues.'}
];
const STOP=new Set('the a an and or but of to in on for with from by is are was were this that as at be can may how when young people users social media online news information public issues'.split(' '));
function words(t){return t.trim()?t.trim().split(/\s+/).length:0}
function normalize(t){return t.toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim()}
function grams(t,n=7){const a=normalize(t).split(' ').filter(Boolean);const out=[];for(let i=0;i<=a.length-n;i++)out.push(a.slice(i,i+n).join(' '));return out}
function sentences(t){return t.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean)}
function analyze(input){
 const inputNorm=normalize(input); const inputWords=inputNorm.split(' ').filter(Boolean); const inputSet=new Set(inputWords.filter(w=>!STOP.has(w)&&w.length>3));
 const matches=[];
 for(const src of SOURCES){
  const srcNorm=normalize(src.text); const srcSet=new Set(srcNorm.split(' ').filter(w=>!STOP.has(w)&&w.length>3));
  const shared=[...inputSet].filter(w=>srcSet.has(w));
  const phraseMatches=[]; for(const g of grams(input,5)){if(srcNorm.includes(g)) phraseMatches.push(g)}
  const exactChars=phraseMatches.reduce((n,g)=>n+g.length,0);
  const lexical=inputSet.size?shared.length/inputSet.size:0;
  const phrase=phraseMatches.length?Math.min(.75,phraseMatches.length*.16):0;
  const score=Math.min(100,Math.round((lexical*.42+phrase)*100));
  if(score>4) matches.push({source:src,score,shared,phraseMatches});
 }
 const internal=[]; const ss=sentences(input); for(let i=0;i<ss.length;i++)for(let j=i+1;j<ss.length;j++){const a=new Set(normalize(ss[i]).split(' '));const b=new Set(normalize(ss[j]).split(' '));const inter=[...a].filter(x=>x.length>3&&b.has(x));const union=new Set([...a,...b]).size;const sim=union?inter.length/union:0;if(sim>.55)internal.push({a:ss[i],b:ss[j],score:Math.round(sim*100)})}
 const max=matches.length?Math.max(...matches.map(m=>m.score)):0;
 const covered=Math.min(100,Math.round(matches.reduce((n,m)=>n+m.score,0)/Math.max(1,matches.length)));
 return {matches:matches.sort((a,b)=>b.score-a.score),internal,similarity:covered,originality:100-covered,wordCount:inputWords.length};
}

export default function Home(){
 const [text,setText]=useState(''); const [tab,setTab]=useState('plagiarism'); const [report,setReport]=useState(null); const [copied,setCopied]=useState(false); const [fileName,setFileName]=useState('');
 const count=useMemo(()=>words(text),[text]);
 const run=()=>{if(text.trim())setReport(tab==='plagiarism'?analyze(text):null)};
 const copy=async()=>{await navigator.clipboard?.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1200)};
 const upload=e=>{const f=e.target.files?.[0];if(!f)return;setFileName(f.name); if(f.type==='text/plain'){const r=new FileReader();r.onload=()=>setText(String(r.result||''));r.readAsText(f)}else alert('For this prototype, TXT upload is active. DOCX/PDF ingestion is the next backend layer.');};
 return <main>
  <header><div className="brand"><div className="mark">T</div><span>TextGuard</span></div><nav><a onClick={()=>setTab('plagiarism')}>Plagiarism</a><a onClick={()=>setTab('humanizer')}>Humanizer</a><a onClick={()=>setTab('paraphrase')}>Paraphraser</a><a>How it works</a></nav><button className="ghost">Sign in</button></header>
  <section className="hero"><div className="eyebrow"><ShieldCheck size={16}/> ORIGINALITY, CLARITY, CONTROL</div><h1>Know your text.<br/><em>Before you submit.</em></h1><p>TextGuard checks your writing against available sources, surfaces matching evidence, and keeps rewriting tools separate from originality decisions.</p><div className="heroActions"><button className="primary" onClick={()=>document.getElementById('workspace').scrollIntoView({behavior:'smooth'})}>Check a document <ArrowRight size={17}/></button><span><CheckCircle2 size={16}/> Evidence first. No invented scores.</span></div></section>
  <section className="stats"><div><b>STRICT</b><span>Phrase & similarity evidence</span></div><div><b>SMART</b><span>Readable analysis</span></div><div><b>CONTROLLED</b><span>Meaning-aware rewriting</span></div></section>
  <section id="workspace" className="workspace"><div className="sectionHead"><div><div className="eyebrow">WORKSPACE</div><h2>One document. Three tools.</h2></div><span className="wordCount">{count.toLocaleString()} words</span></div>
   <div className="tabs">{[['plagiarism','Plagiarism Check',ScanSearch],['humanizer','AI Humanizer',Sparkles],['paraphrase','Paraphraser',PenLine]].map(([id,label,Icon])=><button className={tab===id?'active':''} onClick={()=>{setTab(id);setReport(null)}} key={id}><Icon size={17}/>{label}</button>)}</div>
   <div className="editor"><div className="editorTop"><span>{tab==='plagiarism'?'Strict originality check':tab==='humanizer'?'Make writing sound natural':'Rewrite without losing meaning'}</span><label className="upload"><Upload size={15}/> {fileName||'Upload'}<input type="file" accept=".txt,.docx,.pdf" onChange={upload}/></label></div><textarea value={text} onChange={e=>{setText(e.target.value);setReport(null)}} placeholder="Paste your text here..."></textarea><div className="editorBottom"><span>TXT upload active · DOCX/PDF ingestion coming in the backend layer</span><div><button className="textBtn" onClick={()=>setText(SOURCES[0].text)}>Use sample</button><button className="iconBtn" onClick={copy} title="Copy"><Copy size={16}/>{copied?' Copied':''}</button></div></div></div>
   <div className="runRow"><button className="primary" onClick={run} disabled={!text.trim()}>{tab==='plagiarism'?'Run strict plagiarism check':tab==='humanizer'?'Prepare humanizer':'Prepare paraphraser'} <ArrowRight size={17}/></button><span>{tab==='plagiarism'?'Results show checked-source evidence, not a claim about the entire internet.':'Rewriting is kept separate from the plagiarism evidence report.'}</span></div>
   {tab==='plagiarism'&&report&&<Report report={report}/>} {tab!=='plagiarism'&&text.trim()&&<div className="result"><div className="resultIcon"><FileText/></div><div><b>{tab==='humanizer'?'Humanizer workspace ready':'Paraphraser workspace ready'}</b><p>The production version can connect this panel to a server-side model while preserving citations, facts and the user’s intended meaning.</p></div></div>}
  </section>
  <section className="featureGrid"><article><ScanSearch/><h3>Strict plagiarism check</h3><p>Exact phrases, shared wording, source evidence and internal repetition are surfaced separately so the report is auditable.</p></article><article><Sparkles/><h3>Humanizer</h3><p>Designed for readability and natural expression — not for bypassing academic or AI-detection systems.</p></article><article><PenLine/><h3>Controlled paraphraser</h3><p>Light, balanced and substantial rewriting can be added without turning paraphrasing into a plagiarism workaround.</p></article></section>
  <footer><div className="brand"><div className="mark">T</div><span>TextGuard</span></div><span>Originality tools for serious writing.</span></footer>
 </main>
}
function Report({report}){return <div className="report"><div className="reportTop"><div><div className="eyebrow">ORIGINALITY REPORT</div><h3>{report.similarity}% similarity in checked sources</h3><p>{report.wordCount} words analyzed · {report.matches.length} source{report.matches.length===1?'':'s'} with detected overlap</p></div><div className="score"><strong>{report.originality}%</strong><span>not matched</span></div></div><div className="reportGrid"><div><h4>Source evidence</h4>{report.matches.length?<div className="sources">{report.matches.map(m=><div className="source" key={m.source.id}><div><b>{m.source.title}</b><p>{m.phraseMatches.length?`Matched phrases: ${m.phraseMatches.slice(0,2).join(' · ')}`:`Shared terms detected: ${m.shared.slice(0,8).join(', ')}`}</p></div><span>{m.score}%</span><a href={m.source.url} target="_blank" rel="noreferrer"><ExternalLink size={15}/></a></div>)}</div>:<div className="clean"><CheckCircle2/> No meaningful overlap found in the currently checked demo corpus.</div>}</div><div><h4>Important</h4><div className="note"><AlertTriangle size={17}/><p>This report only reflects the sources available to TextGuard in this prototype. It is not a claim that the document is plagiarism-free across the web, journals, books or private databases.</p></div>{report.internal.length>0&&<><h4>Internal repetition</h4><p className="small">{report.internal.length} pair(s) of sentences contain substantial repeated wording.</p></>}</div></div></div>}
