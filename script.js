document.addEventListener("DOMContentLoaded",()=>{

const soalBox=document.getElementById("soalBox");
const answersWrap=document.getElementById("answers");
const lockBtn=document.getElementById("lockBtn");
const quizBox=document.querySelector(".quiz-container");

const settingsBtn=document.getElementById("settingsBtn");
const settingsMenu=document.getElementById("settingsMenu");
const closeSettings=document.getElementById("closeSettings");

const secretMenu=document.getElementById("secretMenu");
const closeSecret=document.getElementById("closeSecret");

const creditsBtn=document.getElementById("creditsBtn");
const creditsMenu=document.getElementById("creditsMenu");
const closeCredits=document.getElementById("closeCredits");

const modBtn=document.getElementById("modBtn");
const modMenu=document.getElementById("modMenu");
const closeMod=document.getElementById("closeMod");

const optionBtn=document.getElementById("optionBtn");
const optionMenu=document.getElementById("optionMenu");
const closeOption=document.getElementById("closeOption");

const limboToggle=document.getElementById("limboToggle");

const wrapper=document.querySelector(".wrapper");

let settingsOpen=false;
let limboMode=false;

let limboTimer=null;
let limboInterval=null;

let current=0;
let selected=null;
let selectedValue=null;
let phase="answer";
let isLoading=false;

/* SECRET */
let settingsClickCount=0;
let secretReady=false;
let lastQuestionText="";

/* SHUFFLE */
const shuffle=(arr)=>{
const a=[...arr];

for(let i=a.length-1;i>0;i--){
const j=Math.floor(Math.random()*(i+1));
[a[i],a[j]]=[a[j],a[i]];
}

return a;
};

const NEXT_TEXT=[
"lanjut coy",
"sebaiknya lanjut saja bung",
"lanjut woe lama kali",
"aduh kaka ayo lanjut"
];

const WRONG_TEXT=[
"aduh kaka knp bisa salah?",
"salah woe makana blajar!",
"waduh kok salah?",
"salah coi!"
];

const questions=shuffle([

{text:"Siapa yang buat ini?",answers:["Darrel","Ghazi","Nizam","Hatim"],correct:["Darrel"]},

{text:"berapa lama ini dibuat???",answers:["gatau","11 tahun","3 bulan","5 bulan"],correct:["3 bulan"]},

{text:"siapa yang bantu darrel buat ini?",answers:["ghazi","nizam","feisya","ndak ada"],correct:["ndak ada"]},

{text:"apa yang dilakukan darrel waktu buat ini?",answers:["nolep","main","makan","ha?"],correct:["nolep"]},

{text:"berapa versi sudah darrel buat utk projek ini?",answers:["6","4","9","2"],correct:["4"]},

{text:"berapa lama semua projek ini untuk dibuat?",answers:["2 tahun","10 bulan","1 tahun","5 bulan"],correct:["1 tahun"]},

{text:"menganyam itu seru kan anak-anak?",answers:["tidak"],correct:["tidak"],special:"menganyam itu tidak seru"},

{text:"apa fungsi apel di belakang lemari",answers:["di fermentasi","pajangan","apel?","ga ada yang benar"],correct:["di fermentasi"]},

{text:"guru mana yang masih hidup",answers:["bu nikma","bu dewi","bu ema","bu nur"],correct:["bu nikma"]},

{text:"kalo keliat muka darrel 1 frame harus",answers:["sapa","balik palanya","bilang halo","ga ngapa2in"],correct:["balik palanya"]},

{text:"bapak luki itu aneh",answers:["betul","salah","gatau","bapak yg mn?"],correct:["bapak yg mn?"]},

{text:"apa",answers:["ha?","apasih","gajelas","apa?"],correct:["ha?","apasih","gajelas","apa?"]},

{text:"nama full terpanjang ada di",answers:["feisya","nizam","ghazi","raisa"],correct:["feisya"]},

{text:"berapa jumlah murid sd 81",answers:["1211","1069","67","873"],correct:["1211"]},

{text:"iklan mana yang paling bagus",answers:["logotech","matcha","mobil","tv"],correct:["logotech"]},

{text:"apa fungsi projek ini",answers:["ga ada","utk bu nikma","utk presentasi","gatau"],correct:["utk bu nikma"]},

{text:"apa motivasi darrel buat ini",answers:["tidak ada","kamu","lele","hmmmm"],correct:["tidak ada"]},

{
text:"apa alasan darrel lama buat ini",
answers:["sibuk","mati lampu","malas","kursina rusak"],
correct:["malas"]
}

]);

function loadQuestion(){

if(current>=questions.length)return;

if(isLoading)return;
isLoading=true;

quizBox.classList.add("fade-out");

setTimeout(()=>{

if(limboTimer){
clearTimeout(limboTimer);
limboTimer=null;
}

if(limboInterval){
clearInterval(limboInterval);
limboInterval=null;
}

const q=questions[current];

lastQuestionText=q.text;
settingsClickCount=0;
secretReady=false;

soalBox.textContent=q.text;

answersWrap.innerHTML="";
lockBtn.classList.remove("show");
lockBtn.textContent="Kunci Jawaban";
lockBtn.style.background="#3a7dff";

phase="answer";
selected=null;
selectedValue=null;

shuffle(q.answers).forEach(text=>{

const btn=document.createElement("div");
btn.className="answer-btn";
btn.dataset.answer=text;

const span=document.createElement("span");
span.className="answer-text";
span.textContent=text;
btn.appendChild(span);

if(q.answers.length===1){
btn.classList.add("single-answer");
}

btn.onclick=()=>{

if(phase!=="answer")return;
if(limboMode && answersWrap.classList.contains("limbo-locked"))return;

answersWrap.querySelectorAll(".answer-btn")
.forEach(b=>b.classList.remove("selected"));

btn.classList.add("selected");

selected=btn;
selectedValue=text;

if(text!=="Darrel"){
secretReady=false;
}

lockBtn.classList.add("show");

};

answersWrap.appendChild(btn);

});

quizBox.classList.remove("fade-out");

isLoading=false;

if(limboMode){
startLimboSequence(q);
}

},450);

}

/* LIMBO MODE */

function startLimboSequence(q){

const btns=[...answersWrap.querySelectorAll(".answer-btn")];

if(btns.length===0)return;

answersWrap.classList.add("limbo-locked");

btns.forEach(btn=>{

if(q.correct.includes(btn.dataset.answer)){
btn.classList.add("pulse-correct");
}else{
btn.classList.add("pulse-wrong");
}

});

setTimeout(()=>{

btns.forEach(btn=>{

btn.classList.remove("pulse-correct","pulse-wrong");

const span=btn.querySelector(".answer-text");
if(span)span.classList.add("hidden-text");

});

setTimeout(()=>{

beginShuffleSwap(btns);

},400);

},1500);

}

function beginShuffleSwap(btns){

const positions=btns.map(btn=>({
top:btn.offsetTop,
left:btn.offsetLeft,
width:btn.offsetWidth
}));

let currentOrder=positions.map((_,i)=>i);

function shuffleNoFixedPoints(arr){

if(arr.length<2)return [...arr];

let result;

do{

result=shuffle(arr);

}while(result.some((val,idx)=>val===arr[idx]));

return result;

}

answersWrap.classList.add("limbo-shuffling");

btns.forEach((btn,i)=>{
btn.style.width=positions[i].width+"px";
btn.style.top=positions[i].top+"px";
btn.style.left=positions[i].left+"px";
});

function swapOnce(){

currentOrder=shuffleNoFixedPoints(currentOrder);

btns.forEach((btn,i)=>{
const posIndex=currentOrder[i];
btn.style.top=positions[posIndex].top+"px";
btn.style.left=positions[posIndex].left+"px";
});

}

limboInterval=setInterval(swapOnce,500);

limboTimer=setTimeout(()=>{

clearInterval(limboInterval);
limboInterval=null;

answersWrap.classList.remove("limbo-shuffling");

btns.forEach(btn=>{
btn.style.top="";
btn.style.left="";
btn.style.width="";
});

answersWrap.classList.remove("limbo-locked");

},15000);

}

function revealLimboText(){

if(limboTimer){
clearTimeout(limboTimer);
limboTimer=null;
}

if(limboInterval){
clearInterval(limboInterval);
limboInterval=null;
}

answersWrap.classList.remove("limbo-shuffling","limbo-locked");

document.querySelectorAll(".answer-btn").forEach(btn=>{

btn.style.top="";
btn.style.left="";
btn.style.width="";

const span=btn.querySelector(".answer-text");
if(span)span.classList.remove("hidden-text");

});

}

function animateButton(){

lockBtn.classList.remove("btn-pop");

void lockBtn.offsetWidth;

lockBtn.classList.add("btn-pop");

}

/* SETTINGS */

settingsBtn.onclick=()=>{

if(isLoading)return;

settingsClickCount++;

if(settingsClickCount>4){
settingsClickCount=4;
}

if(settingsClickCount===4){
secretReady=true;
}

if(settingsOpen){
closeSettingsMenu();
}else{
openSettings();
}

};

function openSettings(){

settingsOpen=true;

wrapper.classList.add("screen-fade");

setTimeout(()=>{

wrapper.style.display="none";

settingsMenu.classList.add("show");

},450);

}

function closeSettingsMenu(){

settingsOpen=false;

settingsMenu.style.animation="fadeMenuOut .45s forwards";

setTimeout(()=>{

settingsMenu.classList.remove("show");
settingsMenu.style.animation="";

wrapper.style.display="flex";

setTimeout(()=>{
wrapper.classList.remove("screen-fade");
},10);

},430);

}

closeSettings.onclick=closeSettingsMenu;

/* CREDITS MENU */

creditsBtn.onclick=()=>{

openCredits();

};

function openCredits(){

settingsMenu.style.animation="fadeMenuOut .45s forwards";

setTimeout(()=>{

settingsMenu.classList.remove("show");
settingsMenu.style.animation="";

creditsMenu.style.display="block";

setTimeout(()=>{
creditsMenu.classList.add("show");
},20);

},430);

}

function closeCreditsMenu(){

creditsMenu.classList.remove("show");

setTimeout(()=>{

creditsMenu.style.display="none";

settingsMenu.classList.add("show");

},450);

}

closeCredits.onclick=closeCreditsMenu;

/* MOD MENU */

modBtn.onclick=()=>{

openMod();

};

function openMod(){

settingsMenu.style.animation="fadeMenuOut .45s forwards";

setTimeout(()=>{

settingsMenu.classList.remove("show");
settingsMenu.style.animation="";

modMenu.style.display="block";

setTimeout(()=>{
modMenu.classList.add("show");
},20);

},430);

}

function closeModMenu(){

modMenu.classList.remove("show");

setTimeout(()=>{

modMenu.style.display="none";

settingsMenu.classList.add("show");

},450);

}

closeMod.onclick=closeModMenu;

limboToggle.onclick=()=>{

limboMode=!limboMode;

limboToggle.classList.toggle("on",limboMode);

if(
limboMode &&
phase==="answer" &&
!answersWrap.classList.contains("limbo-locked") &&
!answersWrap.classList.contains("limbo-shuffling")
){

const q=questions[current];

if(q){
startLimboSequence(q);
}

}

};

/* OPTION MENU */

optionBtn.onclick=()=>{

openOption();

};

function openOption(){

settingsMenu.style.animation="fadeMenuOut .45s forwards";

setTimeout(()=>{

settingsMenu.classList.remove("show");
settingsMenu.style.animation="";

optionMenu.style.display="block";

setTimeout(()=>{
optionMenu.classList.add("show");
},20);

},430);

}

function closeOptionMenu(){

optionMenu.classList.remove("show");

setTimeout(()=>{

optionMenu.style.display="none";

settingsMenu.classList.add("show");

},450);

}

closeOption.onclick=closeOptionMenu;

/* SECRET MENU */

function openSecret(){

if(secretMenu.classList.contains("show")) return;

settingsBtn.classList.add("disabled");

wrapper.classList.add("screen-fade");

setTimeout(()=>{

wrapper.style.display="none";

secretMenu.style.display="block";

setTimeout(()=>{
secretMenu.classList.add("show");
},20);

},450);

}

function closeSecretMenu(){

secretMenu.classList.remove("show");

setTimeout(()=>{

secretMenu.style.display="none";

wrapper.style.display="flex";

settingsBtn.classList.remove("disabled");

setTimeout(()=>{
wrapper.classList.remove("screen-fade");
},20);

/* NEXT SOAL */
current++;

if(current<questions.length){

loadQuestion();

}else{

soalBox.textContent="Quiz selesai 👍";
answersWrap.innerHTML="";
lockBtn.style.display="none";

}

},450);

}

closeSecret.onclick=closeSecretMenu;

lockBtn.onclick=()=>{

const q=questions[current];

if(!q)return;

if(phase==="answer"){

if(!selected || !selectedValue)return;

phase="next";

const benar=q.correct.includes(selectedValue);

if(limboMode){
revealLimboText();
}

document.querySelectorAll(".answer-btn").forEach(btn=>{

btn.classList.remove("pulse-correct","pulse-wrong");

if(q.correct.includes(btn.dataset.answer)){
btn.classList.add("correct");
}

if(
btn===selected &&
!q.correct.includes(btn.dataset.answer)
){
btn.classList.add("wrong");
}

});

/* SECRET */
if(
secretReady &&
lastQuestionText==="Siapa yang buat ini?" &&
selectedValue==="Darrel"
){
openSecret();
return;
}

if(benar){

lockBtn.style.background="#00c853";

animateButton();

lockBtn.textContent=
q.special ||
NEXT_TEXT[
Math.floor(
Math.random()*NEXT_TEXT.length
)
];

}else{

lockBtn.style.background="#ff3b3b";

animateButton();

lockBtn.textContent=
WRONG_TEXT[
Math.floor(
Math.random()*WRONG_TEXT.length
)
];

}

}else{

current++;

if(current<questions.length){

loadQuestion();

}else{

soalBox.textContent="Quiz selesai 👍";
answersWrap.innerHTML="";
lockBtn.style.display="none";

}

}

};

loadQuestion();

});
