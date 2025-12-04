const grid=document.getElementById('places-grid');
const detail=document.getElementById('detail');
const listView=document.getElementById('list-view');
const detailView=document.getElementById('detail-view');
const back=document.getElementById('back');
const weatherBox=document.getElementById('weather');
const onlineBox=document.getElementById('online');
let userPos=null;

window.addEventListener('load',init);
back.onclick=()=>{history.back();};

function init(){
 updateOnline();
 getGeo();
 loadPlaces();
}

window.addEventListener("online",updateOnline);
window.addEventListener("offline",updateOnline);

function updateOnline(){
 onlineBox.textContent = navigator.onLine ? "Online" : "Offline";
}

function getGeo(){
 if(!navigator.geolocation){
  showMsg("Геолокация не поддерживается");
  return;
 }
 navigator.geolocation.getCurrentPosition(p=>{
  userPos={lat:p.coords.latitude,lon:p.coords.longitude};
  getWeather();
 },()=>{
  showMsg("Геолокация недоступна");
 });
}

async function getWeather(){
 try{
  const u=`https://api.open-meteo.com/v1/forecast?latitude=${userPos.lat}&longitude=${userPos.lon}&current_weather=true`;
  const r=await fetch(u);
  const d=await r.json();
  weatherBox.textContent=`Температура: ${d.current_weather.temperature}°C`;
 }catch{
  weatherBox.textContent="Ошибка погоды";
 }
}

async function loadPlaces(){
 try{
  const r=await fetch('data/places.json');
  const data=await r.json();
  render(data);
 }catch{
  showMsg("Ошибка загрузки мест");
 }
}

function render(list){
 grid.innerHTML="";
 list.forEach(p=>{
   const div=document.createElement('div');
   div.className="card";
   let dist="—";
   if(userPos) dist=calc(userPos.lat,userPos.lon,p.lat,p.lon).toFixed(1)+" км";
   const fav=isFav(p.id)?"★":"☆";
   div.innerHTML=`
    <img src="${p.image}" width="100%">
    <h3>${p.name}</h3>
    <p>${p.desc}</p>
    <p>Расстояние: ${dist}</p>
    <button class="btn fav">${fav}</button>
    <button class="btn more">Подробнее</button>
   `;
   div.querySelector(".fav").onclick=()=>toggleFav(p.id);
   div.querySelector(".more").onclick=()=>openDetail(p);
   grid.appendChild(div);
 });
}

function openDetail(p){
 history.pushState({id:p.id},"","?place="+p.id);
 listView.style.display="none";
 detailView.style.display="block";
 detail.innerHTML=`
  <h2>${p.name}</h2>
  <img src="${p.image}" width="100%">
  <p>${p.desc}</p>
 `;
}

window.onpopstate=()=>{
 detailView.style.display="none";
 listView.style.display="block";
};

function calc(lat1,lon1,lat2,lon2){
 const R=6371;
 const dLat=(lat2-lat1)*Math.PI/180;
 const dLon=(lon2-lon1)*Math.PI/180;
 const a=
 Math.sin(dLat/2)**2+
 Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
 return 2*R*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

function toggleFav(id){
 let f=JSON.parse(localStorage.getItem("fav")||"[]");
 if(f.includes(id)) f=f.filter(x=>x!==id);
 else f.push(id);
 localStorage.setItem("fav",JSON.stringify(f));
 loadPlaces();
}

function isFav(id){
 let f=JSON.parse(localStorage.getItem("fav")||"[]");
 return f.includes(id);
}

function showMsg(m){
 weatherBox.textContent=m;
}
