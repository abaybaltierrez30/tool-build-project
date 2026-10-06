const $ = (s) => document.querySelector(s);

const quoteFallbacks = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', source: 'BrainyQuote' },
  { text: 'You do not have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.', source: 'The Go Game' },
  { text: 'It always seems impossible until it\u2019s done.', author: 'Nelson Mandela', source: 'Motivation Grid' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe', source: 'BrainyQuote' },
  { text: 'Rest if you must, but don\u2019t quit.', author: 'Edgar A. Guest', source: 'Keep Inspiring Me' }
];

const defaultAssignments = [];

const challengePool = [
  { title: 'Clear the runway', desc: 'Put your phone away for one full focus block' },
  { title: 'Explain it simply', desc: 'Teach one concept back out loud in your own words' },
  { title: 'End on a win', desc: 'Finish your easiest pending task before 5 PM' },
  { title: 'The two-minute start', desc: 'Work on your hardest task for just 2 minutes without stopping' },
  { title: 'Analog brainstorm', desc: 'Sketch your ideas or formulas on paper before typing' },
  { title: 'Hydrate & stretch', desc: 'Drink a glass of water and stretch during your recharge break' },
  { title: 'Zero open tabs', desc: 'Close all unrelated browser tabs before starting your study session' },
  { title: 'Active recall drill', desc: 'Write down everything you remember about a topic from memory' },
  { title: 'Single-task sprint', desc: 'Commit to only one assignment tab until the timer chimes' },
  { title: 'Tidy study station', desc: 'Clear your desk surface except for your notebook and device' },
  { title: 'Feynman recap', desc: "Summarize today's main lesson in three bullet points" },
  { title: 'Pre-flight checklist', desc: 'Write down the exact 3 items you want done today' }
];

let dailyChallenges = [];

const STORAGE_KEY_USERS = 'doubleB_users';
const STORAGE_KEY_ACTIVE = 'doubleB_activeUser';

let quotes = [...quoteFallbacks], quoteIndex = 0;
let assignments = [];
let users = {};
let currentUser = null;

function iconRefresh(){ if(window.lucide) lucide.createIcons(); }

function initDailyChallenges(){
  const shuffled = [...challengePool].sort(() => 0.5 - Math.random());
  dailyChallenges = shuffled.slice(0, 3).map(c => ({ ...c, done: false }));
  if (currentUser && Array.isArray(currentUser.dailyChallenges) && currentUser.dailyChallenges.length) {
    dailyChallenges = currentUser.dailyChallenges.map((challenge, index) => ({
      ...challenge,
      done: Boolean(challenge.done),
      title: challenge.title || challengePool[index % challengePool.length].title,
      desc: challenge.desc || challengePool[index % challengePool.length].desc,
    }));
  }
  renderChallenges();
}

function renderChallenges(){
  const list = $('#challengeList');
  if(!list) return;
  list.innerHTML = dailyChallenges.map((c, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `<button class="challenge ${c.done ? 'done' : ''}" data-challenge-index="${i}" type="button">
      ${c.done ? '<span class="check-circle"><i data-lucide="check"></i></span>' : `<span class="challenge-number">${num}</span>`}
      <span><strong>${c.title}</strong><small>${c.desc}</small></span>
      <i data-lucide="chevron-right"></i>
    </button>`;
  }).join('');
  iconRefresh();
}

function showToast(message){
  const toast=$('#toast');
  toast.textContent=message;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),3000);
}

function renderQuotes(){
  let q=quotes[quoteIndex];
  $('#quoteText').textContent=q.text;
  $('#quoteAuthor').textContent='\u2014 '+q.author;
  $('#quoteSource').textContent=q.source;
  $('#quoteCount').textContent=`${quoteIndex+1} / ${quotes.length}`;
}

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
  if(!list) return;
  if(!assignments || assignments.length === 0){
    list.innerHTML = `<div class="assignment-empty">
      <i data-lucide="inbox"></i>
      <p>No assignments added yet!</p>
    </div>`;
    iconRefresh();
    return;
  }
  list.innerHTML=assignments.map((a,i)=>{
    const effStatus=getEffectiveStatus(a);
    const isOverdue=effStatus==='overdue';
    const isSubmitted=effStatus==='submitted';
    const isNotSubmitted=effStatus==='not_submitted';
    const isUnconfirmed=effStatus==='unconfirmed';
    return `<div class="assignment">
      <button class="assignment-check ${isSubmitted?'checked':''}" data-check="${i}" aria-label="Mark complete">${isSubmitted?'<i data-lucide="check"></i>':''}</button>
      <div><strong>${a.name}</strong><small>${a.className}</small></div>
      <div class="assignment-due">
        <select class="status ${effStatus}" data-status="${i}" aria-label="Assignment status">
          ${isOverdue?'<option value="overdue" disabled selected hidden>OVERDUE</option>':''}
          <option value="not_submitted" ${isNotSubmitted?'selected':''}>NOT SUBMITTED</option>
          <option value="unconfirmed" ${isUnconfirmed?'selected':''}>UNCONFIRMED</option>
          <option value="submitted" ${isSubmitted?'selected':''}>CONFIRMED SUBMITTED</option>
        </select>
        <br>${a.due}
      </div>
    </div>`;
  }).join('');
  iconRefresh();
}

/* User Account & Persistence Functions */
async function loadUsersData(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if(raw){
      users = JSON.parse(raw);
    } else {
      try {
        const res = await fetch('./user_data.json');
        if(res.ok){
          const data = await res.json();
          if(data?.users) users = data.users;
        }
      } catch(err){}
    }
  } catch(e){
    users = {};
  }

  if(!users || typeof users !== 'object') users = {};
  if(!users['carlos']){
    users['carlos'] = {
      username: 'carlos',
      name: 'Carlos',
      password: 'password123',
      focusMinutes: 30,
      breakMinutes: 10,
      completedSessions: 2,
      completedChallenges: [],
      assignments: []
    };
  }

  const activeUsername = localStorage.getItem(STORAGE_KEY_ACTIVE);
  if(activeUsername && users[activeUsername.toLowerCase()]){
    currentUser = users[activeUsername.toLowerCase()];
  } else {
    currentUser = null;
  }
}

function saveUserData(){
  if(!currentUser) return;
  currentUser.assignments = assignments;
  currentUser.focusMinutes = Number($('#focusInput')?.value) || 30;
  currentUser.breakMinutes = Number($('#breakInput')?.value) || 10;
  currentUser.dailyChallenges = dailyChallenges;

  users[currentUser.username.toLowerCase()] = currentUser;
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

function updateAuthUI(){
  const notice = $('#authNotice');
  const forms = $('#authForms');
  const profile = $('#authProfile');
  const profileOrb = $('#profileOrb');
  const profileName = $('#profileName');
  const welcomeHeading = $('#welcomeHeading');

  if(currentUser){
    // Signed in
    if(notice) notice.classList.add('hidden');
    if(forms) forms.classList.add('hidden');
    if(profile) profile.classList.remove('hidden');

    const initials = (currentUser.name || currentUser.username || 'U')
      .split(' ')
      .map(n=>n[0])
      .filter(Boolean)
      .join('')
      .substring(0,2)
      .toUpperCase();

    if(profileOrb) profileOrb.textContent = initials;
    if(profileName) profileName.textContent = currentUser.name || currentUser.username;
    if(welcomeHeading) welcomeHeading.textContent = `Welcome back, ${currentUser.name || currentUser.username}.`;

    const dropOrb = $('#dropdownOrb');
    const dropName = $('#dropdownName');
    const dropUsername = $('#dropdownUsername');
    if(dropOrb) dropOrb.textContent = initials;
    if(dropName) dropName.textContent = currentUser.name || currentUser.username;
    if(dropUsername) dropUsername.textContent = `@${currentUser.username}`;

    assignments = Array.isArray(currentUser.assignments) ? currentUser.assignments : [];
    if($('#focusInput')) $('#focusInput').value = currentUser.focusMinutes || 30;
    if($('#breakInput')) $('#breakInput').value = currentUser.breakMinutes || 10;
  } else {
    // Guest (Not signed in)
    if(notice) notice.classList.remove('hidden');
    if(forms) forms.classList.remove('hidden');
    if(profile) profile.classList.add('hidden');

    if(profileOrb) profileOrb.textContent = 'CB';
    if(profileName) profileName.textContent = 'My space';
    if(welcomeHeading) welcomeHeading.textContent = 'Welcome back, Carlos.';

    assignments = [];
    if($('#focusInput')) $('#focusInput').value = 30;
    if($('#breakInput')) $('#breakInput').value = 10;
  }

  renderAssignments();
  iconRefresh();
}

function showAuthTab(tab){
  const loginBtn = $('#tabLoginBtn');
  const signupBtn = $('#tabSignupBtn');
  const loginForm = $('#loginForm');
  const signupForm = $('#signupForm');

  if(tab === 'signup'){
    loginBtn.classList.remove('active');
    signupBtn.classList.add('active');
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
  } else {
    signupBtn.classList.remove('active');
    loginBtn.classList.add('active');
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
  }
}

function formatDate(){
  $('#today').textContent=new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric'}).format(new Date());
}

function setTheme(theme){
  document.documentElement.dataset.theme=theme;
  localStorage.setItem('doubleBTheme',theme);
  const isDark=theme==='dark';
  $('#themeTrigger').innerHTML=`<i data-lucide="${isDark?'moon':'sun'}"></i><span>${isDark?'Dark':'Light'} mode</span><i data-lucide="chevron-down"></i>`;
  iconRefresh();
}

async function fetchMotivation(){
  $('#loadStatus').textContent='Gathering five fresh sparks of motivation';
  try {
    const response=await fetch('https://zenquotes.io/api/quotes');
    const data=await response.json();
    if(data?.length){
      quotes=data.slice(0,5).map((q,i)=>({text:q.q,author:q.a,source:['BrainyQuote','The Go Game','ZenQuotes','Motivation Grid','Keep Inspiring Me'][i]}));
    }
  } catch(e) {}
}

function startApp(){
  $('#loader').classList.add('hidden');
  $('#app').classList.remove('hidden');
  renderQuotes();
  initDailyChallenges();
  updateAuthUI();
  formatDate();
  iconRefresh();
}

let interval, phase='focus', seconds=0, paused=false;

function updateClock(){
  const min=Math.floor(seconds/60),sec=seconds%60;
  $('#largeTime').textContent=`${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

function setPhase(next){
  phase=next;
  const isBreak=phase==='break';
  $('#sessionView').classList.toggle('break',isBreak);
  $('#sessionPhase').textContent=isBreak?'RECHARGE TIME':'FOCUS TIME';
  $('#sessionMessage').textContent=isBreak?"Remember that it's okay to take breaks. Double-B sets obligatory break times so people can have a time to recharge when doing work.":'Pick one thing. Give it your full attention.';
  seconds=Number($(isBreak?'#breakInput':'#focusInput').value)*60;
  updateClock();
}

function startSession(){
  setPhase('focus');
  $('#app').classList.add('hidden');
  $('#sessionView').classList.remove('hidden');
  clearInterval(interval);
  paused=false;
  $('#pauseSession').innerHTML='<i data-lucide="pause"></i> Pause';
  iconRefresh();
  interval=setInterval(()=>{
    if(!paused){
      seconds--;
      if(seconds<0) setPhase(phase==='focus'?'break':'focus');
      updateClock();
    }
  },1000);
}

function endSession(){
  clearInterval(interval);
  $('#sessionView').classList.add('hidden');
  $('#modalBackdrop').classList.remove('hidden');
}

/* Event Handlers */
$('#nextQuote').onclick=()=>{quoteIndex=(quoteIndex+1)%quotes.length;renderQuotes()};
$('#prevQuote').onclick=()=>{quoteIndex=(quoteIndex-1+quotes.length)%quotes.length;renderQuotes()};
$('#startSession').onclick=startSession;
$('#resetTimer').onclick=()=>{
  $('#focusInput').value=30;
  $('#breakInput').value=10;
  saveUserData();
  showToast('Your recommended rhythm is restored (30 min focus \u00b7 10 min recharge).');
};
$('#pauseSession').onclick=()=>{
  paused=!paused;
  $('#pauseSession').innerHTML=paused?'<i data-lucide="play"></i> Resume':'<i data-lucide="pause"></i> Pause';
  iconRefresh();
};
$('#finishSession').onclick=endSession;
function returnToHomepage(){
  const currentUrl = new URL(window.location.href);
  const fileName = /index\.html?$/i.test(currentUrl.pathname) ? 'index.html' : 'index.html';
  const currentPath = currentUrl.pathname.replace(/\/index\.html?$/i, '');
  const targetUrl = new URL(currentUrl.href);

  if (currentUrl.protocol === 'file:') {
    targetUrl.pathname = `${currentPath.replace(/\/$/, '')}/index.html`;
  } else {
    targetUrl.pathname = `${currentPath.replace(/\/$/, '')}/index.html`;
  }

  targetUrl.search = '';
  targetUrl.hash = '';
  window.location.assign(targetUrl.toString());
}
$('#closeModal').onclick=()=>{
  $('#modalBackdrop').classList.add('hidden');
  $('#sessionView').classList.add('hidden');
  $('#app').classList.remove('hidden');
  returnToHomepage();
};

$('#reflectionForm').onsubmit=(e)=>{
  e.preventDefault();
  $('#modalBackdrop').classList.add('hidden');
  $('#sessionView').classList.add('hidden');
  $('#app').classList.remove('hidden');
  if(currentUser){
    currentUser.completedSessions = (currentUser.completedSessions || 0) + 1;
    saveUserData();
    updateAuthUI();
  }
  showToast('Session saved \u2014 you completed another step.');
  e.target.reset();
};

$('#addAssignment').onclick=()=>$('#assignmentModal').classList.remove('hidden');
document.querySelector('[data-close-assignment]').onclick=()=>$('#assignmentModal').classList.add('hidden');

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
  saveUserData();
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
  saveUserData();
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
      saveUserData();
      renderAssignments();
      const eff=getEffectiveStatus(a);
      showToast(`Status changed to ${eff==='overdue'?'Overdue':'Not Submitted'}.`);
    } else {
      a.status='submitted';
      saveUserData();
      renderAssignments();
      showToast('Status changed to Confirmed Submitted.');
    }
  }
};

/* Theme Dropdown */
$('#themeTrigger').onclick=()=>{
  const options=$('#themeOptions');
  options.classList.toggle('hidden');
  $('#themeTrigger').setAttribute('aria-expanded',String(!options.classList.contains('hidden')));
};
document.querySelectorAll('[data-theme]').forEach(button=>button.onclick=()=>{
  setTheme(button.dataset.theme);
  $('#themeOptions').classList.add('hidden');
});

/* Challenges Click (event delegation) */
const challengeContainer = $('#challengeList');
if(challengeContainer){
  challengeContainer.onclick = (e) => {
    const c = e.target.closest('.challenge');
    if(!c) return;
    const idx = Number(c.dataset.challengeIndex);
    if(isNaN(idx) || !dailyChallenges[idx]) return;
    dailyChallenges[idx].done = !dailyChallenges[idx].done;
    renderChallenges();
    saveUserData();
  };
}

/* Timer Input Changes */
$('#focusInput').onchange = saveUserData;
$('#breakInput').onchange = saveUserData;

/* Auth Dropdown & Tabs */
$('#profileTrigger').onclick=(e)=>{
  e.stopPropagation();
  const dropdown = $('#authDropdown');
  dropdown.classList.toggle('hidden');
  $('#profileTrigger').setAttribute('aria-expanded', String(!dropdown.classList.contains('hidden')));
};

$('#authNotice').onclick=()=>{
  $('#authDropdown').classList.remove('hidden');
  $('#profileTrigger').setAttribute('aria-expanded', 'true');
  showAuthTab('login');
  $('#loginUsername').focus();
};

$('#tabLoginBtn').onclick=()=>showAuthTab('login');
$('#tabSignupBtn').onclick=()=>showAuthTab('signup');
$('#switchToSignupBtn').onclick=()=>showAuthTab('signup');
$('#switchToLoginBtn').onclick=()=>showAuthTab('login');

/* Close dropdowns when clicking outside */
document.addEventListener('click', (e)=>{
  const authMenu = $('#authMenu');
  if(authMenu && !authMenu.contains(e.target) && !e.target.closest('#authNotice')){
    $('#authDropdown').classList.add('hidden');
    $('#profileTrigger').setAttribute('aria-expanded', 'false');
  }
  const themeMenu = $('#themeMenu');
  if(themeMenu && !themeMenu.contains(e.target)){
    $('#themeOptions').classList.add('hidden');
    $('#themeTrigger').setAttribute('aria-expanded', 'false');
  }
});

/* Log In Form */
$('#loginForm').onsubmit=(e)=>{
  e.preventDefault();
  const username = $('#loginUsername').value.trim().toLowerCase();
  const password = $('#loginPassword').value;

  const user = users[username];

  if(user && user.password === password){
    currentUser = user;
    localStorage.setItem(STORAGE_KEY_ACTIVE, currentUser.username);
    updateAuthUI();
    $('#authDropdown').classList.add('hidden');
    $('#loginForm').reset();
    showToast(`Welcome back, ${currentUser.name || currentUser.username}! Your saved data is loaded.`);
  } else {
    showToast('Invalid username or password. (Try "carlos" / "password123" or use the Sign up tab)');
  }
};

/* Sign Up Form */
$('#signupForm').onsubmit=(e)=>{
  e.preventDefault();
  const username = $('#signupUsername').value.trim().toLowerCase();
  const rawDisplayName = $('#signupName').value.trim();
  const password = $('#signupPassword').value;

  if(!username){
    showToast('Please enter a username.');
    return;
  }

  if(users[username]){
    showToast('Username already taken. Please choose another username.');
    return;
  }

  const displayName = rawDisplayName || (username.charAt(0).toUpperCase() + username.slice(1));

  const newUser = {
    username: username,
    name: displayName,
    password: password,
    focusMinutes: 30,
    breakMinutes: 10,
    completedSessions: 0,
    completedChallenges: [],
    assignments: []
  };

  users[username] = newUser;
  currentUser = newUser;
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEY_ACTIVE, username);

  updateAuthUI();
  $('#authDropdown').classList.add('hidden');
  $('#signupForm').reset();
  showToast(`Account created for ${currentUser.name}! Saved locally in private .gitignore storage.`);
};

/* Log Out */
$('#logoutBtn').onclick=()=>{
  localStorage.removeItem(STORAGE_KEY_ACTIVE);
  currentUser = null;
  updateAuthUI();
  $('#authDropdown').classList.add('hidden');
  showToast('Signed out. Sign in anytime to access your saved data.');
};

/* Initialization */
(async()=>{
  setTheme(localStorage.getItem('doubleBTheme')||'light');
  await loadUsersData();
  await fetchMotivation();
  setTimeout(startApp, 1400);
})();

