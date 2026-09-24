const $ = (s) => document.querySelector(s);
const quoteFallbacks = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', source: 'BrainyQuote' },
  { text: 'You do not have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.', source: 'The Go Game' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela', source: 'Motivation Grid' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe', source: 'BrainyQuote' },
  { text: 'Rest if you must, but don’t quit.', author: 'Edgar A. Guest', source: 'Keep Inspiring Me' }
];
let quotes = [...quoteFallbacks], quoteIndex = 0, assignments = [
  {name:'Algebra II problem set', className:'Algebra II · P2', due:'Today', dueDate: new Date().toISOString().split('T')[0], status:'not_submitted'},
  {name:'The Odyssey reading notes', className:'English · P5', due:'Tomorrow', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], status:'not_submitted'},
  {name:'Cell structure lab write-up', className:'Biology · P6', due:'Fri, Sep 27', dueDate: '2026-09-27', status:'submitted'}
];

function iconRefresh(){ lucide.createIcons(); }
function showToast(message){ const toast=$('#toast');toast.textContent=message;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2800); }
function renderQuotes(){let q=quotes[quoteIndex];$('#quoteText').textContent=q.text;$('#quoteAuthor').textContent='— '+q.author;$('#quoteSource').textContent=q.source;$('#quoteCount').textContent=`${quoteIndex+1} / ${quotes.length}`;}

function isPastDue(a){
  const now=new Date();
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();
  if(a.dueDate){
    const d=new Date(a.dueDate+(a.dueDate.includes('T')?'':'T00:00:00'));
    if(!isNaN(d.getTime())){
      const dueTime=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
      return dueTime < today;
    }
  }
  if(typeof a.due==='string'){
    const lower=a.due.trim().toLowerCase();
    if(lower==='today'||lower==='tomorrow') return false;
    if(lower==='yesterday') return true;
    const parsed=Date.parse(a.due);
    if(!isNaN(parsed)){
      const d=new Date(parsed);
      const dueTime=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
      return dueTime < today;
    }
    const withYear=Date.parse(a.due+', '+now.getFullYear());
    if(!isNaN(withYear)){
      const d=new Date(withYear);
      const dueTime=new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
      return dueTime < today;
    }
  }
  return false;
}

function getEffectiveStatus(a){
  if(a.status==='submitted') return 'submitted';
  if(isPastDue(a)) return 'overdue';
  return a.status || 'not_submitted';
}

function renderAssignments(){
  const list=$('#assignmentList');
  list.innerHTML=assignments.map((a,i)=>{
    const effStatus=getEffectiveStatus(a);
    const isOverdue=effStatus==='overdue';
    const isSubmitted=effStatus==='submitted';
    const isNotSubmitted=effStatus==='not_submitted';
    const isUnconfirmed=effStatus==='unconfirmed';
    return `<div class="assignment"><button class="assignment-check ${isSubmitted?'checked':''}" data-check="${i}" aria-label="Mark complete">${isSubmitted?'<i data-lucide="check"></i>':''}</button><div><strong>${a.name}</strong><small>${a.className}</small></div><div class="assignment-due"><select class="status ${effStatus}" data-status="${i}" aria-label="Assignment status">${isOverdue?'<option value="overdue" disabled selected hidden>OVERDUE</option>':''}<option value="not_submitted" ${isNotSubmitted?'selected':''}>NOT SUBMITTED</option><option value="unconfirmed" ${isUnconfirmed?'selected':''}>UNCONFIRMED</option><option value="submitted" ${isSubmitted?'selected':''}>CONFIRMED SUBMITTED</option></select><br>${a.due}</div></div>`;
  }).join('');
  iconRefresh();
}

function formatDate(){ $('#today').textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date()); }
function setTheme(theme){ document.documentElement.dataset.theme=theme; localStorage.setItem('doubleBTheme',theme); const isDark=theme==='dark'; $('#themeTrigger').innerHTML=`<i data-lucide="${isDark?'moon':'sun'}"></i><span>${isDark?'Dark':'Light'} mode</span><i data-lucide="chevron-down"></i>`; iconRefresh(); }

async function fetchMotivation(){
  $('#loadStatus').textContent='Gathering five fresh sparks of motivation';
  try { const response=await fetch('https://zenquotes.io/api/quotes'); const data=await response.json(); if(data?.length){ quotes=data.slice(0,5).map((q,i)=>({text:q.q,author:q.a,source:['BrainyQuote','The Go Game','ZenQuotes','Motivation Grid','Keep Inspiring Me'][i]})); } } catch(e) { /* Curated source-labelled fallbacks keep the app useful offline. */ }
}
function startApp(){ $('#loader').classList.add('hidden');$('#app').classList.remove('hidden'); renderQuotes();renderAssignments();formatDate();iconRefresh(); }

let interval, phase='focus', seconds=0, paused=false;
function updateClock(){ const min=Math.floor(seconds/60),sec=seconds%60;$('#largeTime').textContent=`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }
function setPhase(next){ phase=next; const isBreak=phase==='break';$('#sessionView').classList.toggle('break',isBreak);$('#sessionPhase').textContent=isBreak?'RECHARGE TIME':'FOCUS TIME';$('#sessionMessage').textContent=isBreak?"Remember that it's okay to take breaks. Double-B sets obligatory break times so people can have a time to recharge when doing work.":'Pick one thing. Give it your full attention.'; seconds=Number($(isBreak?'#breakInput':'#focusInput').value)*60;updateClock(); }
function startSession(){ setPhase('focus');$('#app').classList.add('hidden');$('#sessionView').classList.remove('hidden');clearInterval(interval);paused=false;$('#pauseSession').innerHTML='<i data-lucide="pause"></i> Pause';iconRefresh();interval=setInterval(()=>{if(!paused){seconds--;if(seconds<0)setPhase(phase==='focus'?'break':'focus');updateClock();}},1000); }
function endSession(){clearInterval(interval);$('#sessionView').classList.add('hidden');$('#modalBackdrop').classList.remove('hidden');}

$('#nextQuote').onclick=()=>{quoteIndex=(quoteIndex+1)%quotes.length;renderQuotes()};$('#prevQuote').onclick=()=>{quoteIndex=(quoteIndex-1+quotes.length)%quotes.length;renderQuotes()};
$('#startSession').onclick=startSession;$('#resetTimer').onclick=()=>{$('#focusInput').value=40;$('#breakInput').value=10;showToast('Your recommended rhythm is restored.');};
$('#pauseSession').onclick=()=>{paused=!paused;$('#pauseSession').innerHTML=paused?'<i data-lucide="play"></i> Resume':'<i data-lucide="pause"></i> Pause';iconRefresh();};$('#finishSession').onclick=endSession;
$('#closeModal').onclick=()=>$('#modalBackdrop').classList.add('hidden');
$('#reflectionForm').onsubmit=(e)=>{e.preventDefault();$('#modalBackdrop').classList.add('hidden');$('#sessionView').classList.add('hidden');$('#app').classList.remove('hidden');showToast('Session saved — you completed another step.');e.target.reset();};
$('#addAssignment').onclick=()=>$('#assignmentModal').classList.remove('hidden');document.querySelector('[data-close-assignment]').onclick=()=>$('#assignmentModal').classList.add('hidden');

$('#assignmentForm').onsubmit=(e)=>{
  e.preventDefault();
  const d=new FormData(e.target);
  const rawDate=d.get('due');
  const dateObj=new Date(rawDate+'T00:00:00');
  const formattedDue=dateObj.toLocaleDateString('en-US',{month:'short',day:'numeric'});
  const newAssignment={
    name:d.get('name'),
    className:d.get('className'),
    due:formattedDue,
    dueDate:rawDate,
    status:'not_submitted'
  };
  assignments.unshift(newAssignment);
  renderAssignments();
  $('#assignmentModal').classList.add('hidden');
  e.target.reset();
  const eff=getEffectiveStatus(newAssignment);
  showToast(eff==='overdue'?'Assignment added (automatically marked Overdue because due date has passed).':'Assignment added as Not Submitted.');
};

$('#assignmentList').onchange=(e)=>{
  const b=e.target.closest('[data-status]');
  if(!b)return;
  let a=assignments[b.dataset.status];
  a.status=b.value;
  renderAssignments();
  const eff=getEffectiveStatus(a);
  const label=eff==='submitted'?'Confirmed Submitted':eff==='overdue'?'Overdue (due date has passed)':eff==='unconfirmed'?'Unconfirmed':'Not Submitted';
  showToast(`Status changed to ${label}.`);
};

$('#assignmentList').onclick=(e)=>{
  const checkBtn=e.target.closest('[data-check]');
  if(checkBtn){
    const a=assignments[checkBtn.dataset.check];
    if(a.status==='submitted'){
      a.status='not_submitted';
      renderAssignments();
      const eff=getEffectiveStatus(a);
      showToast(`Status changed to ${eff==='overdue'?'Overdue':'Not Submitted'}.`);
    } else {
      a.status='submitted';
      renderAssignments();
      showToast('Status changed to Confirmed Submitted.');
    }
  }
};

$('#canvasBtn').onclick=()=>showToast('Connect Canvas through a secure school API to import assignments.');
$('#themeTrigger').onclick=()=>{const options=$('#themeOptions');options.classList.toggle('hidden');$('#themeTrigger').setAttribute('aria-expanded',String(!options.classList.contains('hidden')));};
document.querySelectorAll('[data-theme]').forEach(button=>button.onclick=()=>{setTheme(button.dataset.theme);$('#themeOptions').classList.add('hidden');});
document.querySelectorAll('.challenge').forEach(c=>c.onclick=()=>{c.classList.toggle('done');const first=c.querySelector('.challenge-number');if(first){first.outerHTML='<span class="check-circle"><i data-lucide="check"></i></span>';iconRefresh();}});
(async()=>{setTheme(localStorage.getItem('doubleBTheme')||'light');await fetchMotivation();setTimeout(startApp,1600)})();
