import{getApp,getApps,initializeApp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import{getAuth,onAuthStateChanged}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import{collection,deleteDoc,doc,getDocs,getFirestore,serverTimestamp,setDoc}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const config={apiKey:"AIzaSyAmPf0yWWQI35pNGX1FcsVZJhd3ADMhY78",authDomain:"led-db-465b0.firebaseapp.com",projectId:"led-db-465b0",storageBucket:"led-db-465b0.firebasestorage.app",messagingSenderId:"922283607413",appId:"1:922283607413:web:f58b3e9ebd507082b03f3c"};
const app=getApps().length?getApp():initializeApp(config),auth=getAuth(app),db=getFirestore(app);

const reportTypes={
  maintenance:{label:"Maintenance",prefix:"MNT"},
  inspection:{label:"Inspection",prefix:"INS"},
  rental:{label:"Rental",prefix:"RNT"},
  "quality-inspection":{label:"Quality Inspection",prefix:"QIN"},
  report:{label:"General Report",prefix:"RPT"},
  "site-visit":{label:"Site Visit",prefix:"SVR"}
};

function projectPrefix(){const override=new URLSearchParams(location.search).get("project");if(override)return override.trim()+"_";try{const parts=decodeURIComponent(location.pathname).replace(/\/+$/," ").trim().split("/");const folder=/\.html?$/i.test(parts.at(-1))?parts.at(-2):parts.at(-1);return(folder||"root")+"_"}catch{return"project_"}}
function escapeText(value){return String(value??"")}

async function populateSelect({collectionName,elementId,codeField,emptyLabel}){const select=document.getElementById(elementId),snapshot=await getDocs(collection(db,collectionName)),records=snapshot.docs.map(item=>({id:item.id,...item.data()})).sort((a,b)=>String(a.name||"").localeCompare(String(b.name||"")));select.replaceChildren(new Option(emptyLabel,""),...records.map(record=>new Option(`${escapeText(record[codeField]||record.id)} — ${escapeText(record.name||"Unnamed")}`,record[codeField]||record.id)));select.value=""}

function sampleReports(){
  return Object.entries(reportTypes).flatMap(([type,meta],typeIndex)=>
    Array.from({length:20},(_,recordIndex)=>{
      const sequence=recordIndex+1;
      const paddedSequence=String(sequence).padStart(4,"0");
      const reportNo=`${meta.prefix}-${paddedSequence}`;
      return{
        id:reportNo,
        reportNo,
        reportType:type,
        inspectionType:meta.label,
        inspectionTitle:meta.label,
        reportTitle:`Sample ${meta.label} Report ${String(sequence).padStart(2,"0")}`,
        reportDate:`2026-08-${String(sequence).padStart(2,"0")}`,
        createdBy:"Demo User",
        preparedBy:"Demo Engineer",
        reportBy:"Demo User",
        prepareBy:"Demo Engineer",
        factoryName:`factory${String((recordIndex%3)+1).padStart(4,"0")}`,
        customerName:`cust${String((recordIndex%3)+1).padStart(4,"0")}`,
        productReference:`SAMPLE-${String(typeIndex+1).padStart(2,"0")}-${String(sequence).padStart(2,"0")}`,
        productDetail:"Demo LED display product — test data only",
        reportRemarks:"Sample database record for testing. Safe to edit or delete.",
        isSample:true
      };
    })
  );
}

async function seedReportsWhenEmpty(){
  const snapshot=await getDocs(collection(db,"reports"));
  const existing=snapshot.docs.map(item=>({id:item.id,...item.data()}));
  const existingIds=new Set(existing.map(report=>report.reportNo||report.id));
  const samples=sampleReports();
  const missing=samples.filter(report=>!existingIds.has(report.reportNo));
  await Promise.all(missing.map(report=>setDoc(doc(db,"reports",report.id),{...report,createdAt:serverTimestamp(),updatedAt:serverTimestamp()})));
  return [...existing,...missing];
}

function mergeReportsIntoLocalCatalog(reports){
  const key=projectPrefix()+"report_catalog";
  let local=[];
  try{local=JSON.parse(localStorage.getItem(key)||"[]")}catch{local=[]}
  const identity=report=>String(report.reportNo||report.id||"").trim().toUpperCase();
  const merged=new Map(local.map(report=>[identity(report),report]));
  reports.forEach(report=>merged.set(identity(report),{...merged.get(identity(report)),...report}));
  localStorage.setItem(key,JSON.stringify([...merged.values()]));
  window.dispatchEvent(new CustomEvent("report-database-ready"));
}

window.addEventListener("report-saved",event=>{
  const report=event.detail;
  if(!auth.currentUser||!report?.reportNo)return;
  setDoc(doc(db,"reports",report.reportNo),{...report,id:report.reportNo,updatedAt:serverTimestamp()},{merge:true}).catch(error=>console.error("Could not save report to Firestore",error));
});

window.addEventListener("report-deleted",event=>{
  const report=event.detail;
  if(!auth.currentUser||!report?.reportNo)return;
  deleteDoc(doc(db,"reports",report.reportNo)).catch(error=>console.error("Could not delete report from Firestore",error));
});

window.addEventListener("report-database-ready",()=>document.getElementById("reportSearch")?.dispatchEvent(new Event("input",{bubbles:true})),{once:true});

onAuthStateChanged(auth,async user=>{if(!user)return;try{const [reports]=await Promise.all([seedReportsWhenEmpty(),populateSelect({collectionName:"factories",elementId:"factoryName",codeField:"factoryCode",emptyLabel:"Select a factory"}),populateSelect({collectionName:"customers",elementId:"customerName",codeField:"customerCode",emptyLabel:"Select a customer"})]);mergeReportsIntoLocalCatalog(reports)}catch(error){for(const [id,label]of[["factoryName","Factories unavailable"],["customerName","Customers unavailable"]]){const select=document.getElementById(id);select.replaceChildren(new Option(label,""));select.disabled=true}console.error("Could not load report database or master data",error)}});
