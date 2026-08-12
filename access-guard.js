import{initializeApp}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import{getAuth,onAuthStateChanged,signOut}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";
import{doc,getDoc,getFirestore}from"https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const config={apiKey:"AIzaSyAmPf0yWWQI35pNGX1FcsVZJhd3ADMhY78",authDomain:"led-db-465b0.firebaseapp.com",projectId:"led-db-465b0",storageBucket:"led-db-465b0.firebasestorage.app",messagingSenderId:"922283607413",appId:"1:922283607413:web:f58b3e9ebd507082b03f3c"};
const application=document.documentElement.dataset.application;
const firebaseApp=initializeApp(config),auth=getAuth(firebaseApp),db=getFirestore(firebaseApp);
document.documentElement.style.visibility="hidden";
document.addEventListener("click",async event=>{
  if(!event.target.closest("#signout-button"))return;
  event.preventDefault();event.stopImmediatePropagation();
  await signOut(auth);sessionStorage.removeItem("clearled_authenticated");localStorage.removeItem("clearled_authenticated");location.replace("index.html");
},true);
onAuthStateChanged(auth,async user=>{
  if(!user){location.replace("index.html");return}
  try{
    const snapshot=await getDoc(doc(db,"users",user.uid));
    const profile=snapshot.exists()?snapshot.data():{};
    if(profile.role!=="admin"&&profile.permissions?.[application]!==true){location.replace("applications.html?access=denied");return}
    document.documentElement.style.visibility="visible";
  }catch(error){location.replace("applications.html?access=error")}
});
