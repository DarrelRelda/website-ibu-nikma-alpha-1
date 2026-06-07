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

const wrapper=document.querySelector(".wrapper");

let settingsOpen=false;

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

if(isLoading)return;
isLoading=true;

quizBox.classList.add("fade-out");

setTimeout(()=>{

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
btn.textContent=text;

if(q.answers.length===1){
btn.classList.add("single-answer");
}

btn.onclick=()=>{

if(phase!=="answer")return;

document.querySelectorAll(".answer-btn")
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

},450);

}

function animateButton(){

lockBtn.classList.remove("btn-pop");

void lockBtn.offsetWidth;

lockBtn.classList.add("btn-pop");

}

/* SETTINGS */
settingsBtn.onclick=()=>{

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

/* SECRET MENU */
function openSecret(){

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

if(phase==="answer"){

if(!selected)return;

phase="next";

const benar=q.correct.includes(selectedValue);

document.querySelectorAll(".answer-btn").forEach(btn=>{

if(q.correct.includes(btn.textContent)){
btn.classList.add("correct");
}

if(btn===selected && !q.correct.includes(btn.textContent)){
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
NEXT_TEXT[Math.floor(Math.random()*NEXT_TEXT.length)];

}else{

lockBtn.style.background="#ff3b3b";

animateButton();

lockBtn.textContent=
WRONG_TEXT[Math.floor(Math.random()*WRONG_TEXT.length)];

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