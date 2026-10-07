import React, {useMemo, useState} from "react";



import {createRoot} from "react-dom/client";



import {pdf} from "@react-pdf/renderer";



import {Search, LayoutDashboard, ClipboardCheck, FileText, UserRound, LogOut, ChevronRight, Users, BriefcaseBusiness, Sparkles, Download, Pencil, Trash2, ShieldCheck, Clock3, CheckCircle2, AlertCircle, X, ExternalLink, Filter, Target, GraduationCap} from "lucide-react";



import exams from "./data/exams.json";



import TeacherReportPDF from "./components/TeacherReportPDF.jsx";



import "./styles/app.css";







const DEMO_TEACHER={username:"teacher001",password:"Teacher@123",name:"Demo Teacher",school:"Teacher Tribe Demo Centre",email:"teacher@teachertribe.in",state:"Punjab"};







const DEMO_STUDENTS=[



 {id:"STU-1001",name:"Aarav Sharma",fatherName:"Rajesh Sharma",dob:"2007-08-14",gender:"Male",state:"Punjab",category:"General",quota:"General",education:"Class 12",stream:"PCM",percentage:82,previousAttempts:true,attempts:1},



 {id:"STU-1002",name:"Simran Kaur",fatherName:"Gurpreet Singh",dob:"2005-03-22",gender:"Female",state:"Punjab",category:"OBC",quota:"OBC-NCL",education:"Graduation",stream:"Commerce",percentage:71,previousAttempts:false,attempts:0},



 {id:"STU-1003",name:"Rahul Verma",fatherName:"Sanjay Verma",dob:"2002-11-05",gender:"Male",state:"Delhi",category:"SC",quota:"SC",education:"Graduation",stream:"Engineering",percentage:68,previousAttempts:true,attempts:2},



 {id:"STU-1004",name:"Mehak Gupta",fatherName:"Amit Gupta",dob:"2009-01-17",gender:"Female",state:"Punjab",category:"General",quota:"General",education:"Class 10",stream:"General",percentage:88,previousAttempts:false,attempts:0},



 {id:"STU-1005",name:"Arjun Singh",fatherName:"Manpreet Singh",dob:"1999-05-10",gender:"Male",state:"Haryana",category:"EWS",quota:"EWS",education:"Postgraduation",stream:"Science",percentage:76,previousAttempts:true,attempts:1}



];







const EXAM_TYPES=["All","Government Exams","Academic Exams","Civil Service Exams","Competitive & Entrance Exams","Professional Exams","International Exams","PSU / Recruitment","Teaching / Eligibility","Defence / Armed Forces","State Government","Research / Scientific"];



const JOB_TYPES=["All Job Types","Banking & Finance","Civil Services & Administration","Engineering & Technology","Medical & Health Sciences","Teaching & Education","Defence & Armed Forces","Railways","Public Sector Undertakings (PSUs)","Law & Judiciary","State Government Services","Commerce, Finance & Accountancy","Police, Investigation & Intelligence","Agriculture & Allied Sciences","Research, Space & Scientific Organisations","Specialized Ministries & Central Departments","Design, Architecture & Planning","Management & Business","Humanities, Social Sciences & Languages","Hospitality, Aviation & Tourism","Skilled Trades, Apprenticeships & Vocational Careers","SSC & Central Government","Insurance","Land & Revenue / Land Records","Food Safety & Consumer Affairs","Forest & Environment","Statistics & Economics","Science & Laboratory","Municipal / Panchayat","Healthcare Administration","Other Government Jobs"];



const CATS=["All",...Array.from(new Set(exams.map(e=>e.subcategory))).filter(Boolean).sort()];



const examType=(e)=>{



 if(e.examType) return e.examType;



 const t=[e.category,e.subcategory,e.name,e.purpose].map(x=>String(x||"")).join(" ").toLowerCase();



 if(e.category==="Academic Exams") return "Academic Exams";



 if(e.category==="Professional Exams") return "Professional Exams";



 if(e.category==="International Exams") return "International Exams";



 if(/defence|armed forces|army|navy|air force|afcat|nda|cds|capf|agniveer|coast guard/.test(t)) return "Defence / Armed Forces";



 if(/teaching|ctet|tet|kvs|nvs|dsssb|teacher|professor/.test(t)) return "Teaching / Eligibility";



 if(/psu|bhel|ongc|iocl|bpcl|gail|ntpc|powergrid|sail|bel|hal|nhpc|npcil/.test(t)) return "PSU / Recruitment";



 if(/research|scientific|isro|drdo|barc|icmr|csir|tifr|iiser|dst|dbt/.test(t)) return "Research / Scientific";



 if(/state government|state police|state board|revenue|municipal|panchayat/.test(t)) return "State Government";



 if(/civil service|state civil|psc|upsc|ias|ips|ifs\b|administrative/.test(t)) return "Civil Service Exams";



 if(e.category==="Competitive & Entrance Exams") return "Competitive & Entrance Exams";



 return "Government Exams";



};



const jobType=(e)=>e.jobType||"Other Government Jobs";



const stateFor=(s)=>s||"All";



const PDF_DB="TeacherTribeReports";



const openPdfDb=()=>new Promise((resolve,reject)=>{const req=indexedDB.open(PDF_DB,1);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("pdfs"))db.createObjectStore("pdfs");};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});



const savePdfBlob=async(id,blob)=>{const db=await openPdfDb();return new Promise((resolve,reject)=>{const tx=db.transaction("pdfs","readwrite");tx.objectStore("pdfs").put(blob,id);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}})};



const deletePdfBlob=async(id)=>{const db=await openPdfDb();return new Promise((resolve,reject)=>{const tx=db.transaction("pdfs","readwrite");tx.objectStore("pdfs").delete(id);tx.oncomplete=()=>{db.close();resolve(true)};tx.onerror=()=>{db.close();reject(tx.error)}})};



const getPdfBlob=async(id)=>{const db=await openPdfDb();return new Promise((resolve,reject)=>{const tx=db.transaction("pdfs","readonly");const req=tx.objectStore("pdfs").get(id);req.onsuccess=()=>{const v=req.result;db.close();resolve(v||null)};req.onerror=()=>{db.close();reject(req.error)}})};



const blobToBase64=async(blob)=>{const buffer=await blob.arrayBuffer();let binary="";const bytes=new Uint8Array(buffer);const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)};



const emailReport=async({reportId,studentName,fileName,blob})=>{try{const pdfBase64=await blobToBase64(blob);const response=await fetch("/api/send-report",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({reportId,studentName,fileName,pdfBase64})});const result=await response.json().catch(()=>({}));if(!response.ok||!result.ok)throw new Error(result.error||"Email delivery failed");return true;}catch(err){console.error("Teacher Tribe report email failed",err);return false;}};



const ageOf=(dob)=>{if(!dob)return null; const d=new Date(dob),n=new Date(); let a=n.getFullYear()-d.getFullYear(); if(n.getMonth()<d.getMonth()||(n.getMonth()===d.getMonth()&&n.getDate()<d.getDate()))a--; return a;};



const level=(e)=>{const v=String(e||"").toLowerCase(); if(/class\s*****10|10th|matric|secondary/.test(v))return 10; if(/class\s*****12|12th|10**\+**2|senior secondary/.test(v))return 12; if(/diploma|iti/.test(v))return 13; if(/graduat|bachelor|degree/.test(v))return 15; if(/postgraduat|master|phd|doctorate/.test(v))return 17; return 0;};



const relaxation=()=>0;



function extractAgeRule(q){



 const range=q.match(/(?:age|aged|between)\D{0,12}(\d{1,2})\s*****[–-]\s*****(\d{1,2})/i);



 if(range)return {min:Number(range[1]),max:Number(range[2])};



 const min=q.match(/(?:minimum age|at least)\D{0,12}(\d{1,2})/i);



 const max=q.match(/(?:maximum age|upper age|up to)\D{0,12}(\d{1,2})/i);



 return {min:min?Number(min[1]):null,max:max?Number(max[1]):null};



}



function analyze(student,e){



 const matches=[],misses=[],warnings=[];



 const a=ageOf(student.dob);



 const q=[e.qualification,e.eligibility].map(x=>String(x||"")).join(" ");



 const displayText=[e.name,e.purpose].map(x=>String(x||"")).join(" ");



 const lower=q.toLowerCase();



 const displayLower=displayText.toLowerCase();



 const d=e.details||{};



 const ageRule=extractAgeRule(d.ageRule||q);



 if(a!==null){



   if(ageRule.min!==null || ageRule.max!==null){



     const min=ageRule.min??0,max=ageRule.max??200;



     if(a>=min && a<=max) matches.push(`Age ${a} falls within the researched age rule of ${ageRule.min??"—"}${ageRule.max!==null?`–${ageRule.max}`:"+"}.`);



     else misses.push(`Age ${a} does not meet the researched age rule of ${ageRule.min??"—"}${ageRule.max!==null?`–${ageRule.max}`:"+"}.`);



   } else if(d.ageRule) warnings.push(`Age rule: ${d.ageRule}`);



   else warnings.push("Age rule was not found in the official source reviewed; verify the current notification before applying.");



 }



 const L=level(student.education);



 const required=[];



 if(/class\s*10|10th|matric|secondary/.test(lower))required.push(10);



 if(/class\s*12|12th|10\+2|senior secondary/.test(lower))required.push(12);



 const graduateOrPostgraduate=/graduate\s+or\s+postgraduate|graduate|postgraduate/.test(lower);



 if(graduateOrPostgraduate)required.push(15);



 else if(/postgraduat|master|phd|doctorate/.test(lower))required.push(17);



 else if(/graduat|bachelor|degree/.test(lower))required.push(15);



 if(required.length){const minReq=Math.min(...required); const reqLabel=minReq===10?"Class 10":minReq===12?"Class 12 / 10+2":minReq===15?"graduation":"postgraduation"; if(L>=minReq)matches.push(`Education level (${student.education}) meets the broad ${reqLabel} requirement in the catalogue.`); else misses.push(`The record indicates a ${reqLabel} baseline; the student record is ${student.education}.`);} else warnings.push("Specific educational level is not explicit in the catalogue record; verify the notification.");



 const stream=String(student.stream||"").toLowerCase();



 const streamRules=[



  [/engineering|b**\.**tech|btech|technical/,/engineering|pcm|science|physics|mathematics/,'engineering/technical'],



  [/science|physics|chemistry|biology|agri|agriculture/,/science|pcm|pcb|biology|agriculture|engineering/,'science/agriculture'],



  [/mbbs|medical|nursing|pharmacy|dental|physiotherapy|ayush|veterinary|optometry/,/medical|biology|pcb|nursing|pharmacy|dental|ayush|veterinary/,'medical/health'],



  [/economics|econometrics/,/economics|commerce|finance|statistics|mathematics/,'economics/finance'],



  [/statistics|mathematical statistics|applied statistics/,/statistics|mathematics|math/,'statistics/mathematics'],



  [/law|llb|legal|judiciary|apo|ada/,/law|llb|legal/,'law'],



  [/commerce|account|finance|ca|cma|cs /,/commerce|account|finance|economics|math/,'commerce/finance'],



  [/design|architecture|nift|nid|uceed|ceed/,/design|architecture|fine arts|fashion/,'design/architecture'],



 ];



 let streamRuleFound=false;



 for(const [need,ok,label] of streamRules){if(need.test(lower)){streamRuleFound=true;if(ok.test(stream))matches.push(`Student stream/subject (${student.stream||"not provided"}) is compatible with the broad ${label} requirement.`);else misses.push(`The catalogue points to a ${label} background; the student stream is ${student.stream||"not provided"}.`);break;}}



 if(!streamRuleFound && student.stream)warnings.push("Stream/subject is recorded but no subject-specific rule is stored for this opportunity.");



 const pctText=String(d.minimumPercentageRule||"");



 const pct=pctText.match(/(?:minimum|at least|minimum of|with)\s*(\d{2})\s*%/i) || lower.match(/(?:minimum|at least|minimum of)\s*(\d{2})\s*%/i);



 if(pct){if(Number(student.percentage||0)>=Number(pct[1]))matches.push(`${student.percentage}% meets the researched minimum of ${pct[1]}%.`);else misses.push(`${student.percentage||0}% is below the researched minimum of ${pct[1]}%.`);} else if(pctText) warnings.push(`Percentage rule: ${pctText}`); else warnings.push("A specific minimum percentage was not found in the official source reviewed; verify the current notification.");



 const attemptMatch=lower.match(/(?:maximum|up to|limit of)\s*(\d+)\s*attempts?/i);



 if(attemptMatch){if(Number(student.attempts||0)<=Number(attemptMatch[1]))matches.push(`Recorded attempts (${student.attempts||0}) are within the stated limit of ${attemptMatch[1]}.`);else misses.push(`Recorded attempts (${student.attempts||0}) exceed the stated limit of ${attemptMatch[1]}.`);} else if(student.previousAttempts)warnings.push(`Previous attempts recorded: ${student.attempts||0}; no attempt limit is stored for this opportunity.`); else matches.push("No previous attempts are recorded in the student profile.");



 if(d.physicalMedical) warnings.push(`Physical / medical: ${d.physicalMedical}`);



 else if(/physical standard|pet|pst|medical standard/.test((lower+" "+displayLower)))warnings.push("Physical/medical requirements are indicated and must be checked against the current notification.");



 if(d.domicileRule) warnings.push(`Domicile / state rule: ${d.domicileRule}`);



 else if(/domicile|resident|state-specific|local candidate/.test(lower) || /state government|state pcs|state police|state revenue|land & revenue|state board/i.test(String(e.subcategory||"")))warnings.push(`State/domicile (${student.state||"not provided"}) may affect eligibility; verify the state-specific notification.`);



 if(d.genderRule) warnings.push(`Gender rule: ${d.genderRule}`);



 if(d.reservationRule) warnings.push(`Reservation: ${d.reservationRule}`);



 else if(student.category)warnings.push(`Reservation category ${student.category}${student.quota&&student.quota!==student.category?` / ${student.quota}`:""} is recorded; apply only the relaxation/reservation rules stated in the current notification.`);



 if(d.nationalityRule) warnings.push(`Nationality: ${d.nationalityRule}`);



 warnings.push(`Source status: ${d.researchStatus||e.sourceType||"portal"}. The current notification is final.`);



 return {eligible:misses.length===0,matches,misses,warnings};



}



function eligible(student,e){return analyze(student,e).eligible;}







function App(){



 const [logged,setLogged]=useState(false); const [view,setView]=useState("dashboard"); const [role,setRole]=useState("teacher");



 const [teacher]=useState(DEMO_TEACHER); const [query,setQuery]=useState(""); const [student,setStudent]=useState(null);



 const [form,setForm]=useState({id:"",name:"",fatherName:"",dob:"",gender:"Female",state:"Punjab",category:"General",quota:"General",education:"Class 12",stream:"General",percentage:"",previousAttempts:false,attempts:0});



 const [preferences,setPreferences]=useState({examType:"All",jobType:"All Job Types"});



 const [filter,setFilter]=useState("All"); const [reports,setReports]=useState(()=>{try{return JSON.parse(localStorage.getItem("tt_reports")||"[]")}catch{return []}}); const [toast,setToast]=useState(""); const [generating,setGenerating]=useState(false); const [editingReportId,setEditingReportId]=useState(null);



 const showToast=(m)=>{setToast(m);setTimeout(()=>setToast(""),2600)};



 const eligibleJobs=useMemo(()=>{if(!student)return []; return exams.filter(e=>eligible(student,e)).filter(e=>preferences.examType==="All"||examType(e)===preferences.examType).filter(e=>preferences.jobType==="All Job Types"||jobType(e)===preferences.jobType);},[student,preferences]);



 const searchResults=useMemo(()=>DEMO_STUDENTS.filter(s=>(s.id+" "+s.name+" "+s.fatherName).toLowerCase().includes(query.toLowerCase())),[query]);



 const filtered=useMemo(()=>eligibleJobs.filter(e=>filter==="All"||e.subcategory===filter),[eligibleJobs,filter]);







 const fetchStudent=(s)=>{setStudent(s);setForm({...s,percentage:String(s.percentage??""),quota:s.quota||s.category||"General",previousAttempts:Boolean(s.previousAttempts),attempts:Number(s.attempts||0)});setView("eligibility");showToast(`Student ${s.id} fetched`);};



 const fillStudent=()=>{if(!form.name||!form.dob||!form.education){showToast("Please complete Name, DOB and Education.");return;} const s={...form,percentage:Number(form.percentage)||0,attempts:Number(form.attempts)||0,id:form.id||`NEW-${Date.now().toString().slice(-5)}`};setStudent(s);showToast("Student data saved. Eligibility calculated.");};



 const makeReport=async()=>{



  if(!student||generating)return;



  setGenerating(true);



  try{



   const reportId=editingReportId||`TTR-${Date.now().toString().slice(-8)}`;



   const existing=editingReportId?reports.find(x=>x.id===editingReportId):null;



   const blob=await pdf(<TeacherReportPDF student={student} jobs={eligibleJobs} analyses={Object.fromEntries(eligibleJobs.map(j=>[j.id,analyze(student,j)]))} teacher={DEMO_TEACHER} preferences={preferences}/>).toBlob();



   await savePdfBlob(reportId,blob);



   const fileName=`${student.name.replace(/\s+/g,"-")}-Teacher-Tribe-Report.pdf`;



   const emailed=await emailReport({reportId,studentName:student.name,fileName,blob});



   const r={...(existing||{}),id:reportId,studentId:student.id,studentName:student.name,createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString(),count:eligibleJobs.length,status:emailed?"Generated & Emailed":"Generated — Email Failed",fileName,pdfStored:true,emailSent:emailed,emailRecipient:"thryvemeeraki@gmail.com",studentSnapshot:student,preferencesSnapshot:preferences};



   setReports(x=>{const next=editingReportId?x.map(item=>item.id===reportId?r:item):[r,...x]; try{localStorage.setItem("tt_reports",JSON.stringify(next));}catch{} return next});



   const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=r.fileName; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1500);



   setEditingReportId(null); setView("reports"); showToast(emailed?"PDF generated, downloaded, saved and emailed to thryvemeeraki@gmail.com.":"PDF generated and saved, but email delivery failed. Check the Vercel email configuration.");



  }catch(err){console.error(err);showToast("PDF generation failed. Please try again.");}



  finally{setGenerating(false)}



 };



 const editReport=(r)=>{



  if(!r.studentSnapshot){showToast("This older report cannot be edited because its student profile was not saved. Generate it again to enable editing.");return;}



  const s={...r.studentSnapshot};



  setEditingReportId(r.id);



  setStudent(s);



  setForm({...s,percentage:String(s.percentage??""),quota:s.quota||s.category||"General",previousAttempts:Boolean(s.previousAttempts),attempts:Number(s.attempts||0)});



  setPreferences(r.preferencesSnapshot||{examType:"All",jobType:"All Job Types"});



  setFilter("All");



  setView("eligibility");



  showToast(`Editing report ${r.id}`);



 };



 const deleteReport=async(r)=>{



 if(!window.confirm(`Delete the report for ${r.studentName}? This will remove it from history and this browser's data.`))


  try{await deletePdfBlob(r.id);}catch(err){console.error(err);}



  setReports(x=>{const next=x.filter(item=>item.id!==r.id);try{localStorage.setItem("tt_reports",JSON.stringify(next));}catch{}return next;});



  showToast("Report deleted from history.");



 };



 const downloadReport=async(r)=>{try{let blob=await getPdfBlob(r.id);if(blob){const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=r.fileName||`${r.studentName}-Teacher-Tribe-Report.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);return;}if(r.pdfDataUrl){const a=document.createElement("a");a.href=r.pdfDataUrl;a.download=r.fileName||`${r.studentName}-Teacher-Tribe-Report.pdf`;document.body.appendChild(a);a.click();a.remove();return;}showToast("This report file is no longer stored in this browser. Generate it again from Eligibility.");}catch(err){console.error(err);showToast("Unable to retrieve the PDF. Generate the report again.");}};







 if(!logged) return <Login onLogin={(r)=>{setRole(r);setLogged(true)}} role={role} setRole={setRole}/>;







 return <div className="app">



  <aside className="sidebar">



   <div className="brand"><div className="brandmark">T</div><div><b>Teacher Tribe</b><span>Eligibility Intelligence</span></div></div>



   <div className="teacher-mini"><div className="avatar">{teacher.name[0]}</div><div><b>{teacher.name}</b><span>{teacher.username}</span></div></div>



   <nav>



    <button className={view==="dashboard"?"active":""} onClick={()=>setView("dashboard")}><LayoutDashboard/>Dashboard</button>



    {role==="teacher"&&<button className={view==="eligibility"?"active":""} onClick={()=>setView("eligibility")}><ClipboardCheck/>Eligibility</button>}



    <button className={view==="reports"?"active":""} onClick={()=>setView("reports")}><FileText/>Reports <em>{reports.length}</em></button>



    <button className={view==="profile"?"active":""} onClick={()=>setView("profile")}><UserRound/>Teacher Profile</button>



   </nav>



   <div className="sidebar-bottom"><div className="secure"><ShieldCheck/> <span>Protected teacher workspace</span></div><button onClick={()=>setLogged(false)} className="logout"><LogOut/>Logout</button></div>



  </aside>



  <main className="main">



   <header className="topbar"><div><span className="eyebrow">Teacher Workspace</span><h1>{view==="eligibility"?"Student Eligibility":view==="reports"?"Report History":view==="profile"?"Teacher Profile":"Dashboard"}</h1></div><div className="top-actions"><span className="role-pill">{role==="admin"?"Administrator":"Teacher"}</span><button className="profile-chip" onClick={()=>setView("profile")}><span>{teacher.name[0]}</span>{teacher.name}</button></div></header>



   {view==="dashboard"&&(role==="admin"?<AdminDashboard reports={reports} exams={exams}/>:<Dashboard reports={reports} exams={exams} onEligibility={()=>setView("eligibility")}/>)}



   {view==="eligibility"&&<Eligibility editingReportId={editingReportId} query={query} setQuery={setQuery} results={searchResults} fetchStudent={fetchStudent} form={form} setForm={setForm} fillStudent={fillStudent} student={student} jobs={filtered} total={eligibleJobs.length} filter={filter} setFilter={setFilter} preferences={preferences} setPreferences={setPreferences} makeReport={makeReport} generating={generating} />}



   {view==="reports"&&<Reports reports={reports} downloadReport={downloadReport} editReport={editReport} deleteReport={deleteReport} />}



   {view==="profile"&&<Profile teacher={teacher}/>}



   {toast&&<div className="toast"><CheckCircle2/>{toast}</div>}



  </main>



 </div>



}







function Login({onLogin,role,setRole}){



 const [u,setU]=useState("teacher001"),[p,setP]=useState("Teacher@123"),[err,setErr]=useState("");



 const submit=(e)=>{e.preventDefault(); if(role==="teacher"&&u===DEMO_TEACHER.username&&p===DEMO_TEACHER.password)onLogin("teacher"); else if(role==="admin"&&u==="admin001"&&p==="Admin@123")onLogin("admin"); else setErr("Invalid demo credentials.");};



 return <div className="login-shell"><div className="login-orb orb1"/><div className="login-orb orb2"/><section className="login-card">



  <div className="login-brand"><div className="brandmark big">T</div><div><b>Teacher Tribe</b><span>Eligibility Intelligence</span></div></div>



  <div className="login-copy"><span className="eyebrow">Secure workspace</span><h1>Teacher Login</h1><p>Find the right examinations and career opportunities for every student.</p></div>



  <div className="seg"><button className={role==="teacher"?"on":""} onClick={()=>setRole("teacher")}>Teacher</button><button className={role==="admin"?"on":""} onClick={()=>setRole("admin")}>Admin</button></div>



  <form onSubmit={submit}><label>Username<input value={u} onChange={e=>setU(e.target.value)} /></label><label>Password<input type="password" value={p} onChange={e=>setP(e.target.value)} /></label>{err&&<div className="error"><AlertCircle/>{err}</div>}<button className="primary wide">Login <ChevronRight/></button></form>



  <div className="demo-note">Teacher: teacher001 / Teacher@123<br/>Admin: admin001 / Admin@123</div>



 </section></div>



}







function Dashboard({reports,exams,onEligibility}){



 return <div className="content"><section className="hero3d"><div><span className="eyebrow light">EXAMINATION INTELLIGENCE</span><h2>From student data<br/><strong>to precise opportunities.</strong></h2><p>Fill or fetch a student profile, run eligibility, then generate a personalised PDF report.</p><button className="primary" onClick={onEligibility}>Open Eligibility <ChevronRight/></button></div><div className="hero-stack"><div className="floating-card fc1"><BriefcaseBusiness/><b>{exams.length}</b><span>exam & career records</span></div><div className="floating-card fc2"><ClipboardCheck/><b>Eligibility</b><span>rules-based matching</span></div></div></section>



 <div className="stat-grid"><Stat icon={<BriefcaseBusiness/>} n={exams.length} label="Exam / job records"/><Stat icon={<FileText/>} n={reports.length} label="Reports generated"/><Stat icon={<Users/>} n="—" label="Students assessed"/><Stat icon={<Sparkles/>} n={new Set(exams.map(jobType)).size} label="Career categories"/></div>



 <section className="panel"><div className="panel-head"><div><span className="eyebrow">WORKFLOW</span><h3>Teacher reporting flow</h3></div></div><div className="steps">{["Fetch / fill student","Calculate eligibility","Review opportunities","Generate React-PDF","Save to history"].map((x,i)=><div className="step" key={x}><i>0{i+1}</i><b>{x}</b>{i<4&&<ChevronRight/>}</div>)}</div></section>



 </div>



}



const Stat=({icon,n,label})=><div className="stat"><div className="stat-icon">{icon}</div><div><b>{n}</b><span>{label}</span></div></div>;







function Eligibility({query,setQuery,results,fetchStudent,form,setForm,fillStudent,student,jobs,total,filter,setFilter,preferences,setPreferences,makeReport,generating,editingReportId}){



 const update=(k,v)=>setForm(x=>({...x,[k]:v}));



 return <div className="content"><section className="section-intro"><div><span className="eyebrow">STEP 01 · STUDENT INTAKE & INTELLIGENCE</span><h2>Eligibility Intelligence</h2><p>Fetch a student or enter their details, define what they are looking for, then see the opportunities with a transparent match explanation.</p></div>{student&&<span className="student-badge"><CheckCircle2/> {student.name} · {student.id}</span>}</section>



  <div className="elig-grid"><section className="panel intake"><div className="panel-head"><div><span className="eyebrow">STUDENT DATA</span><h3>Find or enter student details</h3><p>Search the existing student record first, or complete the form manually.</p></div></div>



   <div className="searchbox"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search Student ID, name or father's name"/></div>



   <div className="student-results">{results.map(s=><button key={s.id} onClick={()=>fetchStudent(s)}><div className="avatar small">{s.name[0]}</div><div><b>{s.name}</b><span>{s.id} · {s.education} · {s.state}</span></div><ChevronRight/></button>)}</div>



   <div className="divider"><span>OR FILL MANUALLY</span></div>



   <div className="form-grid">



    <Field label="Student ID" value={form.id} onChange={v=>update("id",v)} placeholder="Optional"/><Field label="Student Name *" value={form.name} onChange={v=>update("name",v)}/><Field label="Father's Name" value={form.fatherName} onChange={v=>update("fatherName",v)} placeholder="Optional"/><Field label="Date of Birth *" type="date" value={form.dob} onChange={v=>update("dob",v)}/>



    <Select label="Gender" value={form.gender} onChange={v=>update("gender",v)} opts={["Female","Male","Other"]}/><Select label="Category" value={form.category} onChange={v=>update("category",v)} opts={["General","EWS","OBC","SC","ST","PwBD"]}/><Select label="Quota / Reservation" value={form.quota} onChange={v=>update("quota",v)} opts={["General","EWS","OBC-NCL","SC","ST","PwBD","Ex-Servicemen","Other / Special"]}/>



    <Select label="State / Domicile" value={form.state} onChange={v=>update("state",v)} opts={["Punjab","Haryana","Delhi","Himachal Pradesh","Uttar Pradesh","Rajasthan","Maharashtra","Gujarat","Karnataka","West Bengal","Other"]}/><Select label="Highest Education *" value={form.education} onChange={v=>update("education",v)} opts={["Class 10","Class 12","Diploma","Graduation","Postgraduation"]}/><Field label="Stream / Subject" value={form.stream} onChange={v=>update("stream",v)} placeholder="e.g. PCM, Commerce, Law"/><Field label="Percentage" type="number" value={form.percentage} onChange={v=>update("percentage",v)} placeholder="e.g. 78"/>



    <label className="field"><span>Previous Attempts</span><select value={form.previousAttempts?"Yes":"No"} onChange={e=>update("previousAttempts",e.target.value==="Yes")}><option>No</option><option>Yes</option></select></label>{form.previousAttempts&&<Field label="Number of Previous Attempts" type="number" value={form.attempts} onChange={v=>update("attempts",Math.max(0,Number(v)||0))} placeholder="e.g. 2"/>}



   </div>



   <button className="secondary wide" onClick={fillStudent}><ClipboardCheck/> Calculate Eligibility</button>



  </section>



  <section className="panel profile-preview"><div className="panel-head"><div><span className="eyebrow">STUDENT RECORD</span><h3>{student?student.name:"No student loaded"}</h3></div></div>{student?<><div className="student-profile"><div className="avatar large">{student.name[0]}</div><div><h4>{student.name}</h4><p>{student.fatherName||"Father's name not provided"} · {student.id}</p></div></div><div className="mini-grid"><Mini k="Age" v={ageOf(student.dob)??"—"}/><Mini k="Education" v={student.education}/><Mini k="Category" v={student.category}/><Mini k="Quota" v={student.quota||student.category}/><Mini k="Attempts" v={student.previousAttempts?student.attempts:0}/><Mini k="State" v={student.state}/><Mini k="Stream" v={student.stream}/><Mini k="Marks" v={`${student.percentage||0}%`}/></div><div className="elig-score"><div><span>Eligible opportunities</span><b>{total}</b></div><div className="ring"><span>{Math.min(99,Math.round(total/Math.max(exams.length,1)*100))}%</span></div></div><p className="muted">Filters are preferences. Final eligibility depends on the current official notification and post-specific rules.</p></>:<div className="empty-state"><Users/><b>Fetch or fill a student</b><span>The eligibility results and report action will appear here after student data is ready.</span></div>}</section></div>



  {student&&<section className="panel results-panel"><div className="panel-head"><div><span className="eyebrow">STEP 02 · INTELLIGENCE</span><h3>Eligible examinations & opportunities</h3><p>{total} matches after applying the student's eligibility and requested preferences.</p></div><button className="download-link" onClick={makeReport} disabled={generating}><Download/> {generating?(editingReportId?"Updating PDF…":"Generating PDF…"):(editingReportId?"Update PDF Report":"Generate PDF Report")}</button></div>



   <div className="preference-grid"><div className="preference-box"><Target/><div><span>EXAM TYPE THEY ARE LOOKING FOR</span><Select label="" value={preferences.examType} onChange={v=>setPreferences(x=>({...x,examType:v}))} opts={EXAM_TYPES}/></div></div><div className="preference-box"><BriefcaseBusiness/><div><span>JOB / CAREER TYPE THEY ARE LOOKING FOR</span><Select label="" value={preferences.jobType} onChange={v=>setPreferences(x=>({...x,jobType:v}))} opts={JOB_TYPES}/></div></div></div>



   <div className="filter-heading"><Filter/><span>Catalogue filter</span></div><div className="filter-row">{CATS.slice(0,18).map(c=><button key={c} className={filter===c?"filter active":"filter"} onClick={()=>setFilter(c)}>{c==="All"?"All":c}</button>)}</div>



   <div className="job-grid">{jobs.slice(0,30).map(j=><Job key={j.id} job={j} student={student}/>)} </div>{jobs.length>30&&<div className="more">Showing first 30 of {jobs.length}. The PDF includes all matching records.</div>}{jobs.length===0&&<div className="empty-large compact"><AlertCircle/><h3>No matching opportunities</h3><p>Try another exam type or job preference, or review the student profile and current notification rules.</p></div>}



  </section>}</div>



}







const Field=({label,value,onChange,type="text",placeholder})=><label className="field">{label}<input type={type} value={value??""} placeholder={placeholder} onChange={e=>onChange(e.target.value)}/></label>;



const Select=({label,value,onChange,opts})=><label className="field">{label}<select value={value} onChange={e=>onChange(e.target.value)}>{opts.map(o=><option key={o}>{o}</option>)}</select></label>;



const Mini=({k,v})=><div><span>{k}</span><b>{v}</b></div>;



function Job({job,student}){const a=analyze(student,job); const d=job.details||{}; return <article className="job-card detailed"><div className="job-top"><span>{jobType(job)}</span><span className="dot"/><span>{examType(job)}</span></div><h4>{job.name}</h4><p>{job.body||job.purpose}</p><div className="job-meta"><span>{job.qualification}</span><span>{job.difficulty}</span><span>{job.stages}</span></div><div className="reason-block"><div className="reason-title good">✓ Why this matches</div>{a.matches.slice(0,5).map((x,i)=><div className="reason" key={i}>{x}</div>)}{a.matches.length===0&&<div className="reason muted">No confirmed positive rule was found for the student profile; review the detailed job / exam information below.</div>}</div><div className="job-detail-summary"><b>DETAILED JOB / EXAM INFORMATION</b><span><strong>Age:</strong> {d.ageRule||"Not specified in source reviewed"}</span><span><strong>Qualification:</strong> {job.eligibility||job.qualification||"See official notice"}</span><span><strong>Selection:</strong> {d.selectionProcess||job.stages||"See official notice"}</span><span><strong>Posts:</strong> {d.postsCovered||job.purpose||"See official notice"}</span>{d.payScale&&<span><strong>Pay:</strong> {d.payScale}</span>}{d.vacancyInfo&&<span><strong>Vacancies:</strong> {d.vacancyInfo}</span>}<span><strong>Reservation:</strong> {d.reservationRule||"See current notification"}</span><span><strong>Verified:</strong> {d.verifiedOn||"Catalogue source"}</span></div><div className="job-foot"><span>Review the detailed information and current official notification before applying</span>{job.applyUrl?<a href={job.applyUrl} target="\_blank" rel="noreferrer" className="apply-link">Open official portal <ExternalLink/></a>:<span>No official link</span>}</div></article>}











function AdminDashboard({reports,exams}){



 return <div className="content"><section className="hero3d admin-hero"><div><span className="eyebrow light">ADMIN CONTROL CENTRE</span><h2>Reports generated<br/><strong>across Teacher Tribe.</strong></h2><p>Monitor report generation, student assessments and catalogue coverage from the administrative workspace.</p></div><div className="hero-stack"><div className="floating-card fc1"><FileText/><b>{reports.length}</b><span>reports stored</span></div><div className="floating-card fc2"><BriefcaseBusiness/><b>{exams.length}</b><span>catalogue records</span></div></div></section>



 <div className="stat-grid"><Stat icon={<FileText/>} n={reports.length} label="Reports generated"/><Stat icon={<Users/>} n={new Set(reports.map(r=>r.studentId)).size} label="Students assessed"/><Stat icon={<BriefcaseBusiness/>} n={exams.length} label="Exam / job records"/><Stat icon={<ShieldCheck/>} n="Active" label="System status"/></div>



 <section className="panel"><div className="panel-head"><div><span className="eyebrow">REPORT MONITOR</span><h3>Recent generated reports</h3></div></div>



 {reports.length===0?<div className="empty-large"><FileText/><h3>No reports generated yet</h3><p>When a teacher generates a report, it will appear here for the admin workspace.</p></div>:<div className="report-list">{reports.slice(0,10).map(r=><div className="report-row" key={r.id}><div className="report-icon"><FileText/></div><div className="report-main"><b>{r.studentName}</b><span>{r.studentId} · {r.id}</span></div><div><b>{r.count}</b><span>eligible records</span></div><div><b>{new Date(r.createdAt).toLocaleDateString()}</b><span>generated</span></div><span className="status"><CheckCircle2/> Stored</span></div>)}</div>}



 </section></div>



}







function Reports({reports,downloadReport,editReport,deleteReport}){return <div className="content"><section className="section-intro"><div><span className="eyebrow">REPORTS</span><h2>Generated reports</h2><p>Every PDF generated from Eligibility is stored in this teacher history for later download, editing or deletion.</p></div><div className="history-count"><FileText/><b>{reports.length}</b><span>Total reports</span></div></section>{reports.length===0?<div className="panel empty-large"><FileText/><h3>No reports yet</h3><p>Go to Eligibility, load a student and generate the PDF report.</p></div>:<div className="report-list">{reports.map(r=><div className="report-row" key={r.id}><div className="report-icon"><FileText/></div><div className="report-main"><b>{r.studentName}</b><span>{r.studentId} · {r.id}</span></div><div><b>{r.count}</b><span>eligible records</span></div><div><b>{new Date(r.createdAt).toLocaleDateString()}</b><span>{r.updatedAt?`Updated ${new Date(r.updatedAt).toLocaleDateString()}`:new Date(r.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span></div><span className="status"><CheckCircle2/> PDF Stored</span><div className="history-actions"><button className="history-edit" onClick={()=>editReport(r)} title="Edit report"><Pencil/> Edit</button><button className="history-download" onClick={()=>downloadReport(r)} title="Download report"><Download/> Download PDF</button><button className="history-delete" onClick={()=>deleteReport(r)} title="Delete report"><Trash2/> Delete</button></div></div>)}</div>}</div>}







function Profile({teacher}){return <div className="content"><section className="section-intro"><div><span className="eyebrow">ACCOUNT · TEACHER IDENTITY</span><h2>Teacher Profile</h2><p>Manage the identity that appears on student eligibility reports and in the Teacher Tribe workspace.</p></div><span className="profile-status"><CheckCircle2/> Active account</span></section><section className="profile-hero"><div className="profile-avatar-xl">{teacher.name.split(" ").map(x=>x[0]).slice(0,2).join("")}</div><div className="profile-hero-copy"><span className="eyebrow light">TEACHER ACCOUNT</span><h2>{teacher.name}</h2><p>{teacher.school}</p><div className="profile-tags"><span><ShieldCheck/> Verified workspace</span><span><UserRound/> {teacher.username}</span></div></div><div className="profile-id"><span>PROFILE ID</span><b>TT-TEA-001</b></div></section><div className="profile-layout"><section className="panel profile-details"><div className="panel-head"><div><span className="eyebrow">PERSONAL & ORGANISATION</span><h3>Account details</h3></div><button className="edit-profile">Edit Profile</button></div><div className="detail-grid"><Detail icon={<UserRound/>} label="Teacher Name" value={teacher.name}/><Detail icon={<ShieldCheck/>} label="Username" value={teacher.username}/><Detail icon={<BriefcaseBusiness/>} label="Organisation" value={teacher.school}/><Detail icon={<FileText/>} label="Email" value={teacher.email}/><Detail icon={<Users/>} label="State" value={teacher.state}/><Detail icon={<CheckCircle2/>} label="Account Status" value="Active"/></div></section><aside className="profile-side"><div className="profile-side-card"><div className="side-icon"><ShieldCheck/></div><h4>Secure teacher workspace</h4><p>Your login identity is used to associate student assessments, generated reports and activity history with your account.</p></div><div className="profile-side-card soft"><div className="side-icon"><FileText/></div><h4>Report identity</h4><p>The teacher name and organisation shown here will appear on generated PDF reports.</p></div></aside></div></div>}



const Detail=({icon,label,value})=><div className="detail-item"><div className="detail-icon">{icon}</div><div><span>{label}</span><b>{value}</b></div></div>;







createRoot(document.getElementById("root")).render(<App/>);
