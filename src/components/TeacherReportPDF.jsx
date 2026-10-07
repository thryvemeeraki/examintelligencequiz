import React from "react";
import {Document,Page,Text,View,StyleSheet,Link} from "@react-pdf/renderer";
const s=StyleSheet.create({
 page:{padding:34,fontFamily:"Helvetica",color:"#4A2A20",fontSize:9},
 cover:{backgroundColor:"#542A1D",color:"#FFFDF9",padding:48,justifyContent:"space-between"},
 brand:{fontSize:11,letterSpacing:2,color:"#D98A5B"}, title:{fontSize:30,fontWeight:700,marginTop:30,lineHeight:1.12}, subtitle:{fontSize:12,color:"#E1D2C7",marginTop:14,lineHeight:1.5},
 section:{fontSize:16,fontWeight:700,color:"#542A1D",marginBottom:10}, small:{fontSize:8,color:"#8A7469"}, card:{border:"1pt solid #E5D9CF",borderRadius:8,padding:12,marginBottom:10},
 row:{flexDirection:"row",justifyContent:"space-between",gap:8}, cell:{flex:1}, label:{fontSize:7,color:"#8C786D",textTransform:"uppercase",marginBottom:3}, value:{fontSize:10,fontWeight:700},
 job:{padding:10,borderBottom:"1pt solid #E7D9CC",marginBottom:5}, jobname:{fontSize:11,fontWeight:700,color:"#51291E"}, jobmeta:{fontSize:7,color:"#806D62",marginTop:3}, reason:{fontSize:7,color:"#735E52",marginTop:4,lineHeight:1.35}, link:{fontSize:7,color:"#A85B3E",marginTop:5,textDecoration:"none"},
 detailBox:{marginTop:7,border:"1pt solid #E2D6CB",borderRadius:5,padding:8,backgroundColor:"#F6EEE5"}, detailTitle:{fontSize:7,fontWeight:700,color:"#674536",textTransform:"uppercase",letterSpacing:.7,marginBottom:4}, detail:{fontSize:7,color:"#77655A",marginTop:3,lineHeight:1.35}, detailKey:{fontWeight:700,color:"#5A382C"},
 footer:{position:"absolute",bottom:22,left:34,right:34,borderTop:"1pt solid #E7D9CC",paddingTop:5,fontSize:7,color:"#9A857A"}
});
const list=(items,style,max=8)=>items?.slice(0,max).map((x,i)=><Text key={i} style={style}>• {x}</Text>);
const field=(label,value)=><Text style={s.detail} key={label}><Text style={s.detailKey}>{label}: </Text>{value||"Not specified in source reviewed"}</Text>;
export default function TeacherReportPDF({student,jobs,analyses,teacher,preferences}){
 const generated=new Date().toLocaleDateString();
 return <Document title={`${student.name} — Teacher Tribe Eligibility Report`} author="Teacher Tribe">
  <Page size="A4" style={[s.page,s.cover]}>
   <View><Text style={s.brand}>TEACHER TRIBE · EXAM INTELLIGENCE</Text><Text style={s.title}>Eligibility & Career Opportunity Report</Text><Text style={s.subtitle}>A researched, personalised decision-support report using the Teacher Tribe examination catalogue and verified authority sources where available.</Text></View>
   <View><Text style={{fontSize:10,color:"#C8B0A0"}}>Prepared for</Text><Text style={{fontSize:20,marginTop:6}}>{student.name}</Text><Text style={{fontSize:10,color:"#E1D2C7",marginTop:4}}>{student.id}</Text><Text style={{fontSize:9,color:"#C8B0A0",marginTop:20}}>Counsellor / Teacher: {teacher.name}</Text><Text style={{fontSize:8,color:"#C8B0A0",marginTop:4}}>{generated}</Text></View>
  </Page>
  <Page size="A4" style={s.page}>
   <Text style={s.section}>1. Student Profile</Text>
   <View style={s.card}>
    <View style={s.row}>{[["Name",student.name],["Father's Name",student.fatherName||"Not provided"],["Student ID",student.id]].map(x=><View style={s.cell} key={x[0]}><Text style={s.label}>{x[0]}</Text><Text style={s.value}>{x[1]}</Text></View>)}</View>
    <View style={[s.row,{marginTop:12}]}>{[["DOB",student.dob],["Age",String(new Date().getFullYear()-new Date(student.dob).getFullYear())],["Gender",student.gender],["Category",student.category],["State",student.state],["Education",student.education]].map(x=><View style={s.cell} key={x[0]}><Text style={s.label}>{x[0]}</Text><Text style={s.value}>{x[1]}</Text></View>)}</View>
    <View style={[s.row,{marginTop:12}]}>{[["Stream / Subject",student.stream||"Not provided"],["Percentage",`${student.percentage||0}%`],["Quota / Reservation",student.quota||student.category||"Not provided"]].map(x=><View style={s.cell} key={x[0]}><Text style={s.label}>{x[0]}</Text><Text style={s.value}>{x[1]}</Text></View>)}</View>
   </View>
   <Text style={s.section}>2. Eligibility Summary</Text>
   <View style={s.card}><View style={s.row}><View style={s.cell}><Text style={s.label}>Potential matches</Text><Text style={{fontSize:24,fontWeight:700}}>{jobs.length}</Text></View><View style={s.cell}><Text style={s.label}>Exam preference</Text><Text style={s.value}>{preferences?.examType||"All"}</Text></View><View style={s.cell}><Text style={s.label}>Job preference</Text><Text style={s.value}>{preferences?.jobType||"All Job Types"}</Text></View></View><Text style={[s.small,{marginTop:10}]}>Each opportunity below contains researched eligibility and career information available to Teacher Tribe. Where a rule is not published in the source reviewed, the report says so instead of inventing a value.</Text></View>
   <Text style={s.section}>3. Recommended Opportunities</Text>
   {jobs.map((j,i)=>{const a=analyses?.[j.id]||{};const d=j.details||{};return <View style={s.job} key={j.id} wrap={false}>
    <Text style={s.jobname}>{i+1}. {j.name}</Text>
    <Text style={s.jobmeta}>{j.body} · {j.jobType||"Career"} · {j.examType||j.category}</Text>
    <Text style={s.jobmeta}>{j.qualification} · {j.stages}</Text>
    <Text style={[s.reason,{marginTop:6,fontWeight:700}]}>✓ Why this matches</Text>{list(a.matches,s.reason,8)}{a.matches?.length===0&&<Text style={s.reason}>• Review the detailed job / exam information below for the researched requirements.</Text>}
    <View style={s.detailBox} wrap={false}><Text style={s.detailTitle}>DETAILED JOB / EXAM INFORMATION</Text>{field("Posts / roles",d.postsCovered||j.purpose)}{field("Age eligibility",d.ageRule||(j.ageMin!=null||j.ageMax!=null?`${j.ageMin??""}${j.ageMax!=null?`–${j.ageMax}`:"+"}`:null))}{field("Educational qualification",j.eligibility||j.qualification)}{field("Minimum percentage",d.minimumPercentageRule)}{field("Selection process",d.selectionProcess||j.stages)}{field("Reservation / age relaxation",d.reservationRule)}{field("Domicile / state rule",d.domicileRule)}{field("Gender rule",d.genderRule)}{field("Nationality",d.nationalityRule)}{field("Physical / medical",d.physicalMedical)}{field("Pay / salary",d.payScale)}{field("Vacancies",d.vacancyInfo)}{field("Research status",d.researchStatus)}{field("Verified / reviewed",d.verifiedOn)}{field("Research notes",d.researchNotes)}{d.verificationSource&&<Link src={d.verificationSource} style={s.link}>View researched source ↗</Link>}</View>
    {j.applyUrl&&<Link src={j.applyUrl} style={s.link}>Open official application / portal ↗</Link>}
   </View>})}
   <Text style={s.footer}>Teacher Tribe · Generated {generated} · Official notification/application portal is final. Research data is versioned by source/date and should be rechecked before an application is submitted. This is not an official eligibility certificate.</Text>
  </Page>
 </Document>
}
