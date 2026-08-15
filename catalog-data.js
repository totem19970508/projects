import{addDoc,arrayUnion,collection,doc,getDoc,getDocs,query,runTransaction,serverTimestamp,setDoc,where}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

export const CATALOG_TYPES={
  parts:{
    LED:{prefix:"LED",codeField:"partNo",codeLabel:"Part No.",specs:["package","colour","wavelength","forwardVoltage"]},
    IC:{prefix:"ICS",codeField:"partNo",codeLabel:"Part No.",specs:["version","package","function"]},
    PSU:{prefix:"PSU",codeField:"modelNo",codeLabel:"Model No.",specs:["inputRange","outputV1","outputV2","powerW"]},
    "Receiver Card":{prefix:"RC",codeField:"modelNo",codeLabel:"Model No.",specs:["maximumLoad","dataGroups","interface","bitDepth"]},
    Capacitor:{prefix:"CAP",codeField:"partNo",codeLabel:"Part No.",specs:["capacitance","voltageRating","tolerance","package"]}
  },
  equipment:{
    "Media Player":{prefix:"MP",codeField:"modelNo",codeLabel:"Model No.",specs:["processor","memory","storage","displayOutput","numberOfPorts","maximumResolution"]},
    Computer:{prefix:"COM",codeField:"modelNo",codeLabel:"Model No.",specs:["cpu","memory","storage","accessory","displayPorts"]},
    Monitor:{prefix:"MON",codeField:"modelNo",codeLabel:"Model No.",specs:["screenSize","resolution","displayInputs","refreshRateHz"]}
  }
};

const sampleCatalog={
  parts:{
    LED:[
      {brand:"Nationstar",partNo:"TBC-T1515MB-J2I16",description:"Indoor fine-pitch RGB LED",specs:{package:"1515",colour:"RGB",forwardVoltage:"R 2.0 V / G-B 3.0 V"}},
      {brand:"Nationstar",partNo:"TBC-T2020M-J6I16",description:"Indoor RGB LED",specs:{package:"2020",colour:"RGB",forwardVoltage:"R 2.0 V / G-B 3.0 V"}},
      {brand:"Kinglight",partNo:"JT-KF2222IC3SURZGQBW-CB-B2",description:"Outdoor RGB LED",specs:{package:"2222",colour:"RGB"}},
      {brand:"Kinglight",partNo:"JT-KF2727SURZGQBM-CB-CS2",description:"Outdoor RGB LED",specs:{package:"2727",colour:"RGB"}},
      {brand:"Nichia",partNo:"NSSM237BT",description:"Surface-mount RGB LED",specs:{package:"SMD",colour:"RGB"}},
      {brand:"Nichia",partNo:"NESM180BT",description:"Surface-mount LED",specs:{package:"SMD",colour:"RGB"}},
      {brand:"Nationstar",partNo:"TBF-C1010M-S4I16",description:"Micro-pitch RGB LED",specs:{package:"1010",colour:"RGB"}},
      {brand:"Nationstar",partNo:"TBS-T1515MB-S2I16",description:"Fine-pitch RGB LED",specs:{package:"1515",colour:"RGB"}},
      {brand:"Refond",partNo:"RF-WN1515TS-A",description:"Indoor RGB LED",specs:{package:"1515",colour:"RGB"}},
      {brand:"Hongsheng",partNo:"HS-1921RGB-A",description:"Outdoor RGB LED",specs:{package:"1921",colour:"RGB"}}
    ],
    IC:[
      {brand:"Macroblock",partNo:"MBI5252",description:"LED constant-current driver",specs:{version:"A",package:"QFN",function:"PWM LED driver"}},
      {brand:"Chipone",partNo:"ICND2153",description:"LED display driver",specs:{version:"B",function:"PWM LED driver"}},
      {brand:"NovaStar",partNo:"RT5958",description:"Receiver-side driver IC",specs:{version:"1.0",function:"LED control"}},
      {brand:"Macroblock",partNo:"MBI5034",description:"Constant-current LED driver",specs:{package:"SSOP",function:"LED driver"}},
      {brand:"Chipone",partNo:"ICN2038S",description:"16-channel LED driver",specs:{package:"SSOP",function:"LED driver"}},
      {brand:"Sunmoon",partNo:"SM16159SH",description:"Common-cathode LED driver",specs:{function:"LED driver"}},
      {brand:"Fuman",partNo:"FM6126A",description:"PWM LED driver",specs:{function:"LED driver"}},
      {brand:"Dapeng",partNo:"DP5125",description:"LED display driver",specs:{function:"LED driver"}},
      {brand:"Chipone",partNo:"ICND2053",description:"Constant-current sink driver",specs:{function:"LED driver"}},
      {brand:"Texas Instruments",partNo:"TLC5958",description:"48-channel PWM LED driver",specs:{package:"HTSSOP",function:"PWM LED driver"}}
    ],
    PSU:[
      {brand:"Mean Well",modelNo:"RSP-500-5",description:"500 W enclosed power supply",specs:{inputRange:"85–264 VAC",outputV1:"5 V",outputV2:"",powerW:500}},
      {brand:"Chuanglian",modelNo:"A-400AF-5",description:"400 W LED display power supply",specs:{inputRange:"176–264 VAC",outputV1:"5 V",outputV2:"",powerW:400}},
      {brand:"Delta",modelNo:"PMT-24V350W1AA",description:"350 W industrial power supply",specs:{inputRange:"90–132 / 180–264 VAC",outputV1:"24 V",outputV2:"",powerW:350}},
      {brand:"Mean Well",modelNo:"UHP-500-5",description:"500 W slim power supply",specs:{inputRange:"90–264 VAC",outputV1:"5 V",outputV2:"",powerW:500}},
      {brand:"Mean Well",modelNo:"LRS-350-5",description:"350 W enclosed power supply",specs:{inputRange:"90–132 / 180–264 VAC",outputV1:"5 V",outputV2:"",powerW:350}},
      {brand:"Chuanglian",modelNo:"CL-A-200-5",description:"200 W LED display power supply",specs:{inputRange:"176–264 VAC",outputV1:"5 V",outputV2:"",powerW:200}},
      {brand:"Mean Well",modelNo:"EPP-400-12",description:"400 W open-frame power supply",specs:{inputRange:"80–264 VAC",outputV1:"12 V",outputV2:"",powerW:400}},
      {brand:"Mean Well",modelNo:"RSP-750-5",description:"750 W enclosed power supply",specs:{inputRange:"85–264 VAC",outputV1:"5 V",outputV2:"",powerW:750}},
      {brand:"Mornsun",modelNo:"LOF550-20B05",description:"550 W low-profile power supply",specs:{inputRange:"90–264 VAC",outputV1:"5 V",outputV2:"",powerW:550}},
      {brand:"Mean Well",modelNo:"NDR-480-24",description:"480 W DIN-rail power supply",specs:{inputRange:"90–264 VAC",outputV1:"24 V",outputV2:"",powerW:480}}
    ],
    "Receiver Card":[
      {brand:"NovaStar",modelNo:"A5s Plus",description:"LED display receiver card",specs:{maximumLoad:"512 × 512 px",dataGroups:32,interface:"HUB75",bitDepth:"14-bit"}},
      {brand:"NovaStar",modelNo:"MRV336",description:"LED display receiver card",specs:{maximumLoad:"512 × 512 px",dataGroups:32,interface:"HUB75"}},
      {brand:"NovaStar",modelNo:"DH7512-S",description:"High-density receiver card",specs:{maximumLoad:"512 × 512 px",interface:"HUB75"}},
      {brand:"Colorlight",modelNo:"5A-75B",description:"LED receiver card",specs:{maximumLoad:"512 × 512 px",interface:"HUB75"}},
      {brand:"Colorlight",modelNo:"i5A-905",description:"LED receiver card",specs:{maximumLoad:"512 × 512 px",interface:"HUB75"}},
      {brand:"Colorlight",modelNo:"5A-75E",description:"LED receiver card",specs:{maximumLoad:"512 × 512 px",interface:"HUB75"}},
      {brand:"Mooncell",modelNo:"T75",description:"LED display receiver card",specs:{maximumLoad:"512 × 512 px",interface:"HUB75"}},
      {brand:"Mooncell",modelNo:"RT08Q",description:"LED display receiver card",specs:{interface:"HUB75"}},
      {brand:"Linsn",modelNo:"RV908M32",description:"LED receiver card",specs:{dataGroups:32,interface:"HUB75"}},
      {brand:"Huidu",modelNo:"HD-R708",description:"LED receiver card",specs:{interface:"HUB75"}}
    ],
    Capacitor:[
      {brand:"Murata",partNo:"GRM32ER71H106KA12L",description:"Multilayer ceramic capacitor",specs:{capacitance:"10 µF",voltageRating:"50 V",tolerance:"±10%",package:"1210"}},
      {brand:"Panasonic",partNo:"EEU-FR1V102",description:"Aluminium electrolytic capacitor",specs:{capacitance:"1000 µF",voltageRating:"35 V",tolerance:"±20%",package:"Radial"}},
      {brand:"Nichicon",partNo:"UHE1V102MHD",description:"Aluminium electrolytic capacitor",specs:{capacitance:"1000 µF",voltageRating:"35 V",tolerance:"±20%",package:"Radial"}},
      {brand:"Rubycon",partNo:"35ZLH1000MEFC",description:"Low-impedance electrolytic capacitor",specs:{capacitance:"1000 µF",voltageRating:"35 V",tolerance:"±20%",package:"Radial"}},
      {brand:"TDK",partNo:"C3225X7R1H106K250AB",description:"Multilayer ceramic capacitor",specs:{capacitance:"10 µF",voltageRating:"50 V",tolerance:"±10%",package:"1210"}},
      {brand:"KEMET",partNo:"C1206C106K4RACTU",description:"Multilayer ceramic capacitor",specs:{capacitance:"10 µF",voltageRating:"16 V",tolerance:"±10%",package:"1206"}},
      {brand:"Vishay",partNo:"MAL219691214E3",description:"Aluminium electrolytic capacitor",specs:{capacitance:"470 µF",voltageRating:"35 V",tolerance:"±20%",package:"Radial"}},
      {brand:"Samsung",partNo:"CL31A106KBHNNNE",description:"Multilayer ceramic capacitor",specs:{capacitance:"10 µF",voltageRating:"50 V",tolerance:"±10%",package:"1206"}},
      {brand:"Taiyo Yuden",partNo:"UMK325AB7106KM-T",description:"Multilayer ceramic capacitor",specs:{capacitance:"10 µF",voltageRating:"50 V",tolerance:"±10%",package:"1210"}},
      {brand:"Würth Elektronik",partNo:"860020374013",description:"Aluminium electrolytic capacitor",specs:{capacitance:"1000 µF",voltageRating:"25 V",tolerance:"±20%",package:"Radial"}}
    ]
  },
  equipment:{
    "Media Player":[
      {brand:"NovaStar",modelNo:"TB1-4G",description:"Asynchronous multimedia player",specs:{processor:"ARM",memory:"1 GB",storage:"8 GB",displayOutput:"Ethernet",numberOfPorts:1,maximumResolution:"650,000 pixels"}},
      {brand:"NovaStar",modelNo:"TB2-4G",description:"Asynchronous multimedia player",specs:{processor:"ARM",memory:"1 GB",storage:"8 GB",displayOutput:"Ethernet",numberOfPorts:2,maximumResolution:"1,300,000 pixels"}},
      {brand:"NovaStar",modelNo:"TB30",description:"Taurus multimedia player",specs:{processor:"Quad-core ARM",memory:"1 GB",storage:"16 GB",displayOutput:"Ethernet",numberOfPorts:2,maximumResolution:"1,300,000 pixels"}},
      {brand:"NovaStar",modelNo:"TB50",description:"Taurus multimedia player",specs:{processor:"Quad-core ARM",memory:"2 GB",storage:"32 GB",displayOutput:"Ethernet",numberOfPorts:2,maximumResolution:"2,300,000 pixels"}},
      {brand:"NovaStar",modelNo:"TB60",description:"Taurus multimedia player",specs:{processor:"Quad-core ARM",memory:"2 GB",storage:"32 GB",displayOutput:"Ethernet",numberOfPorts:4,maximumResolution:"2,300,000 pixels"}},
      {brand:"Colorlight",modelNo:"A100",description:"Cloud media player",specs:{processor:"ARM",storage:"8 GB",displayOutput:"Ethernet",numberOfPorts:1}},
      {brand:"Colorlight",modelNo:"A200",description:"Cloud media player",specs:{processor:"ARM",storage:"16 GB",displayOutput:"Ethernet",numberOfPorts:2}},
      {brand:"Huidu",modelNo:"HD-A3L",description:"Full-colour asynchronous controller",specs:{processor:"ARM",storage:"8 GB",displayOutput:"Ethernet",numberOfPorts:1}},
      {brand:"Huidu",modelNo:"HD-A4",description:"Full-colour asynchronous controller",specs:{processor:"ARM",storage:"8 GB",displayOutput:"Ethernet",numberOfPorts:2}},
      {brand:"BrightSign",modelNo:"HD225",description:"Digital signage media player",specs:{processor:"ARM",storage:"microSD",displayOutput:"HDMI",numberOfPorts:1,maximumResolution:"3840 × 2160"}}
    ],
    Computer:[
      {brand:"Dell",modelNo:"OptiPlex 7010",description:"Business desktop computer",specs:{cpu:"Intel Core i5",memory:"16 GB",storage:"512 GB SSD",accessory:"Keyboard and mouse",displayPorts:"2 × DisplayPort"}},
      {brand:"HP",modelNo:"Pro Mini 400 G9",description:"Mini business computer",specs:{cpu:"Intel Core i5",memory:"16 GB",storage:"512 GB SSD",accessory:"VESA mount",displayPorts:"DisplayPort / HDMI"}},
      {brand:"Lenovo",modelNo:"ThinkCentre M70q Gen 4",description:"Tiny business computer",specs:{cpu:"Intel Core i5",memory:"16 GB",storage:"512 GB SSD",accessory:"Keyboard and mouse",displayPorts:"DisplayPort / HDMI"}},
      {brand:"Intel",modelNo:"NUC 13 Pro",description:"Compact control computer",specs:{cpu:"Intel Core i7",memory:"32 GB",storage:"1 TB SSD",accessory:"VESA mount",displayPorts:"2 × HDMI / Thunderbolt"}},
      {brand:"ASUS",modelNo:"ExpertCenter D5",description:"Business desktop computer",specs:{cpu:"Intel Core i5",memory:"16 GB",storage:"512 GB SSD",accessory:"Keyboard and mouse",displayPorts:"DisplayPort / HDMI"}},
      {brand:"Acer",modelNo:"Veriton X",description:"Small-form-factor computer",specs:{cpu:"Intel Core i5",memory:"16 GB",storage:"512 GB SSD",accessory:"Keyboard and mouse",displayPorts:"DisplayPort / HDMI"}},
      {brand:"Dell",modelNo:"Precision 3460",description:"Small-form-factor workstation",specs:{cpu:"Intel Core i7",memory:"32 GB",storage:"1 TB SSD",accessory:"Keyboard and mouse",displayPorts:"3 × DisplayPort"}},
      {brand:"HP",modelNo:"Z2 Mini G9",description:"Mini workstation",specs:{cpu:"Intel Core i7",memory:"32 GB",storage:"1 TB SSD",accessory:"VESA sleeve",displayPorts:"DisplayPort"}},
      {brand:"Lenovo",modelNo:"ThinkStation P3 Tiny",description:"Tiny workstation",specs:{cpu:"Intel Core i7",memory:"32 GB",storage:"1 TB SSD",accessory:"VESA mount",displayPorts:"DisplayPort / HDMI"}},
      {brand:"Minisforum",modelNo:"UM790 Pro",description:"Compact control computer",specs:{cpu:"AMD Ryzen 9",memory:"32 GB",storage:"1 TB SSD",accessory:"VESA mount",displayPorts:"HDMI / USB-C"}}
    ],
    Monitor:[
      {brand:"Dell",modelNo:"P2425H",description:"24-inch business monitor",specs:{screenSize:"24 in",resolution:"1920 × 1080",displayInputs:"HDMI / DisplayPort / VGA",refreshRateHz:100}},
      {brand:"Dell",modelNo:"P2725H",description:"27-inch business monitor",specs:{screenSize:"27 in",resolution:"1920 × 1080",displayInputs:"HDMI / DisplayPort / VGA",refreshRateHz:100}},
      {brand:"HP",modelNo:"E24 G5",description:"24-inch business monitor",specs:{screenSize:"24 in",resolution:"1920 × 1080",displayInputs:"HDMI / DisplayPort / USB-C",refreshRateHz:75}},
      {brand:"Lenovo",modelNo:"ThinkVision T24i-30",description:"24-inch business monitor",specs:{screenSize:"24 in",resolution:"1920 × 1080",displayInputs:"HDMI / DisplayPort / VGA",refreshRateHz:60}},
      {brand:"LG",modelNo:"27UP650-W",description:"27-inch 4K monitor",specs:{screenSize:"27 in",resolution:"3840 × 2160",displayInputs:"HDMI / DisplayPort",refreshRateHz:60}},
      {brand:"Samsung",modelNo:"S24A400",description:"24-inch business monitor",specs:{screenSize:"24 in",resolution:"1920 × 1080",displayInputs:"HDMI / DisplayPort",refreshRateHz:75}},
      {brand:"ASUS",modelNo:"ProArt PA278QV",description:"27-inch professional monitor",specs:{screenSize:"27 in",resolution:"2560 × 1440",displayInputs:"HDMI / DisplayPort / Mini DisplayPort",refreshRateHz:75}},
      {brand:"BenQ",modelNo:"PD2705Q",description:"27-inch design monitor",specs:{screenSize:"27 in",resolution:"2560 × 1440",displayInputs:"HDMI / DisplayPort / USB-C",refreshRateHz:60}},
      {brand:"Acer",modelNo:"CB272",description:"27-inch business monitor",specs:{screenSize:"27 in",resolution:"1920 × 1080",displayInputs:"HDMI / VGA",refreshRateHz:75}},
      {brand:"ViewSonic",modelNo:"VG2456",description:"24-inch docking monitor",specs:{screenSize:"24 in",resolution:"1920 × 1080",displayInputs:"HDMI / DisplayPort / USB-C",refreshRateHz:60}}
    ]
  }
};

const flatten=value=>Array.isArray(value)?value.flatMap(flatten):value&&typeof value==="object"?Object.values(value).flatMap(flatten):[value];
export function normalizeCatalogSearch(value){return String(value??"").toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"")}
export function buildSearchTokens(...values){const tokens=new Set;for(const raw of flatten(values)){const text=String(raw??"").toLowerCase().normalize("NFKD"),words=[...text.split(/[^a-z0-9]+/).filter(Boolean),normalizeCatalogSearch(text)].filter(Boolean);for(const word of words){if(word.length===1)tokens.add(word);for(let start=0;start<word.length;start++)for(let length=2;length<=Math.min(24,word.length-start);length++)tokens.add(word.slice(start,start+length));if(tokens.size>=1500)return[...tokens]}}return[...tokens]}
export const catalogCode=record=>record?.partNo||record?.modelNo||record?.partNumber||record?.recordNo||"";
export function prepareCatalogRecord(record){const prepared={...record,active:record.active!==false};prepared.searchTokens=buildSearchTokens(prepared.recordNo,prepared.type,prepared.brand,catalogCode(prepared),prepared.description,prepared.specs);return prepared}

const slug=value=>String(value).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const identity=record=>[record.type,record.brand,catalogCode(record)].map(value=>normalizeCatalogSearch(value)).join("|");
const numberOf=(recordNo,prefix)=>{const match=String(recordNo||"").match(new RegExp(`^${prefix}-(\\d+)$`,"i"));return match?Number(match[1]):0};
function allocateRecordNo(prefix,used,preferred=""){const preferredNumber=numberOf(preferred,prefix);if(preferredNumber){const value=`${prefix}-${String(preferredNumber).padStart(4,"0")}`;if(!used.has(value)){used.add(value);return value}}let number=1,value="";do value=`${prefix}-${String(number++).padStart(4,"0")}`;while(used.has(value));used.add(value);return value}

async function ensureCounterFloor(db,collectionName,type,records){const definition=CATALOG_TYPES[collectionName][type],floor=Math.max(0,...records.map(record=>numberOf(record.recordNo,definition.prefix)))+1,ref=doc(db,"_counters",`catalog_${collectionName}_${slug(type)}`);await runTransaction(db,async transaction=>{const snapshot=await transaction.get(ref),current=Number(snapshot.exists()?snapshot.data().next:1);if(current<floor)transaction.set(ref,{next:floor},{merge:true})})}
export async function nextRecordNo(db,collectionName,type){const definition=CATALOG_TYPES[collectionName]?.[type];if(!definition)throw new Error(`Unknown catalog type: ${collectionName}/${type}`);const ref=doc(db,"_counters",`catalog_${collectionName}_${slug(type)}`);return runTransaction(db,async transaction=>{const snapshot=await transaction.get(ref),number=Number(snapshot.exists()?snapshot.data().next:1);transaction.set(ref,{next:number+1},{merge:true});return`${definition.prefix}-${String(number).padStart(4,"0")}`})}
export async function registerCatalogBrand(db,collectionName,type,brand){if(!brand)return;await setDoc(doc(db,"catalogMetadata",`${collectionName}_${slug(type)}`),{collection:collectionName,type,brands:arrayUnion(String(brand).trim()),updatedAt:serverTimestamp()},{merge:true})}

const legacySources=[
  {source:"leds",target:"parts",type:"LED",prefix:"LED",code:data=>data.partNo||data.partNumber||data.part_no||data.modelNo||data.model||"",specs:data=>({package:data.package||data.bodySize||"",colour:data.color||data.colour||"",forwardVoltage:data.forwardVoltage||""})},
  {source:"ics",target:"parts",type:"IC",prefix:"ICS",code:data=>data.partNo||data.partNumber||"",specs:data=>({version:data.version||"",package:data.package||"",function:data.function||"LED driver"})},
  {source:"psus",target:"parts",type:"PSU",prefix:"PSU",code:data=>data.modelNo||data.model||"",specs:data=>({inputRange:data.inputRange||"",outputV1:data.outputV1||data.outputs||"",outputV2:data.outputV2||"",powerW:Number(data.power||data.powerW)||""})}
];

async function migrateLegacyCollections(db){for(const source of legacySources){const snapshot=await getDocs(collection(db,source.source)),documents=[...snapshot.docs].sort((a,b)=>String(source.code(a.data())).localeCompare(String(source.code(b.data())))),used=new Set;for(const [index,item]of documents.entries()){const data=item.data(),definition=CATALOG_TYPES[source.target][source.type],code=source.code(data),preferred=data.recordNo||data.id||item.id,recordNo=allocateRecordNo(definition.prefix,used,preferred),record=prepareCatalogRecord({...data,class:"part",type:source.type,recordNo,[definition.codeField]:code,description:data.description||data.remarks||"",specs:{...source.specs(data),...(data.specs||{})},active:data.active!==false,legacyCollection:source.source,legacyId:item.id,migratedAt:serverTimestamp()}),targetId=`legacy-${source.source}-${item.id.replace(/[^a-zA-Z0-9_-]/g,"_")}`;await setDoc(doc(db,source.target,targetId),record,{merge:true})}}
}

export async function ensureCatalogData(db){const stateRef=doc(db,"_catalogMigrations","unified-catalog-v1"),state=await getDoc(stateRef);if(state.exists()&&state.data().completed)return state.data();await migrateLegacyCollections(db);const counts={};for(const [collectionName,types]of Object.entries(CATALOG_TYPES)){for(const [type,definition]of Object.entries(types)){const snapshot=await getDocs(query(collection(db,collectionName),where("type","==",type))),records=snapshot.docs.map(item=>({id:item.id,...item.data()})),existing=new Set(records.map(identity)),used=new Set(records.map(record=>record.recordNo).filter(Boolean));for(const [index,sample]of sampleCatalog[collectionName][type].entries()){if(records.length>=10)break;const candidate={...sample,class:collectionName==="parts"?"part":"equipment",type};if(existing.has(identity(candidate)))continue;const recordNo=allocateRecordNo(definition.prefix,used),record=prepareCatalogRecord({...candidate,recordNo,isSample:true,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}),id=`sample-${collectionName}-${slug(type)}-${String(index+1).padStart(2,"0")}`;await setDoc(doc(db,collectionName,id),record,{merge:true});records.push({id,...record});existing.add(identity(record))}counts[`${collectionName}.${type}`]=records.length;const brands=[...new Set(records.map(record=>record.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b));await setDoc(doc(db,"catalogMetadata",`${collectionName}_${slug(type)}`),{collection:collectionName,type,brands,count:records.length,updatedAt:serverTimestamp()},{merge:true});await ensureCounterFloor(db,collectionName,type,records)}}const result={completed:true,counts,completedAt:serverTimestamp()};await setDoc(stateRef,result,{merge:true});return result}

export async function createCatalogRecord(db,collectionName,type,record){const recordNo=record.recordNo||await nextRecordNo(db,collectionName,type),prepared=prepareCatalogRecord({...record,class:collectionName==="parts"?"part":"equipment",type,recordNo,createdAt:serverTimestamp(),updatedAt:serverTimestamp()}),reference=await addDoc(collection(db,collectionName),prepared);await registerCatalogBrand(db,collectionName,type,prepared.brand);return{id:reference.id,...prepared}}
