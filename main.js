const $ = (s) => document.querySelector(s);

const PROJECT_EMAIL = 'verify@doubleb.study';

const quoteFallbacks = [
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', source: 'BrainyQuote' },
  { text: 'You do not have to see the whole staircase, just take the first step.', author: 'Martin Luther King Jr.', source: 'The Go Game' },
  { text: 'It always seems impossible until it’s done.', author: 'Nelson Mandela', source: 'Motivation Grid' },
  { text: 'Start where you are. Use what you have. Do what you can.', author: 'Arthur Ashe', source: 'BrainyQuote' },
  { text: 'Rest if you must, but don’t quit.', author: 'Edgar A. Guest', source: 'Keep Inspiring Me' }
];

const defaultAssignments = [
  {name:'Algebra II problem set', className:'Algebra II · P2', due:'Today', dueDate: new Date().toISOString().split('T')[0], status:'not_submitted'},
  {name:'The Odyssey reading notes', className:'English · P5', due:'Tomorrow', dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], status:'not_submitted'},
  {name:'Cell structure lab write-up', className:'Biology · P6', due:'Fri, Sep 27', dueDate: '2026-09-27', status:'submitted'}
];

const STORAGE_KEY_USERS = 'doubleB_users';
const STORAGE_KEY_ACTIVE = 'doubleB_activeUser';

let quotes = [...quoteFallbacks], quoteIndex = 0;
let assignments = JSON.parse(JSON.stringify(defaultAssignments));
let users = {};
let currentUser = null;
let pendingVerificationUser = null;

function iconRefresh(){ if(window.lucide) lucide.createIcons(); }

function showToast(message){
  const toast=$('#toast');
  toast.textContent=message;
  toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),3000);
}

function renderQuotes(){
  let q=quotes[quoteIndex];
  $('#quoteText').textContent=q.text;
  $('#quoteAuthor').textContent='— '+q.author;
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

function getEmailUsername(email){
  if(!email) return '';
  const trimmed = email.trim();
  return trimmed.includes('@') ? trimmed.split('@')[0].toLowerCase() : trimmed.toLowerCase();
}

function formatNameFromUsername(username){
  if(!username) return 'User';
  return username
    .split(/[._-]/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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
      email: 'carlos@example.com',
      password: 'password123',
      emailVerified: true,
      focusMinutes: 40,
      breakMinutes: 10,
      completedSessions: 2,
      completedChallenges: [0],
      assignments: JSON.parse(JSON.stringify(defaultAssignments))
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
  currentUser.focusMinutes = Number($('#focusInput')?.value) || 40;
  currentUser.breakMinutes = Number($('#breakInput')?.value) || 10;
  
  const completed = [];
  document.querySelectorAll('.challenge').forEach((c, idx)=>{
    if(c.classList.contains('done')) completed.push(idx);
  });
  currentUser.completedChallenges = completed;

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
  const authVerificationTag = $('#authVerificationTag');

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
    const dropEmail = $('#dropdownEmail');
    if(dropOrb) dropOrb.textContent = initials;
    if(dropName) dropName.textContent = currentUser.name || currentUser.username;
    if(dropEmail) dropEmail.textContent = currentUser.email || `${currentUser.username}@study.org`;

    if(authVerificationTag){
      if(currentUser.emailVerified){
        authVerificationTag.classList.remove('hidden');
      } else {
        authVerificationTag.classList.add('hidden');
      }
    }

    assignments = Array.isArray(currentUser.assignments) ? currentUser.assignments : JSON.parse(JSON.stringify(defaultAssignments));
    if($('#focusInput')) $('#focusInput').value = currentUser.focusMinutes || 40;
    if($('#breakInput')) $('#breakInput').value = currentUser.breakMinutes || 10;

    if(Array.isArray(currentUser.completedChallenges)){
      document.querySelectorAll('.challenge').forEach((c, idx)=>{
        const isDone = currentUser.completedChallenges.includes(idx);
        c.classList.toggle('done', isDone);
        const circle = c.querySelector('.challenge-number, .check-circle');
        if(circle && isDone){
          circle.outerHTML = '<span class="check-circle"><i data-lucide="check"></i></span>';
        }
      });
    }

    if(currentUser.completedSessions !== undefined && $('#sessionProgress')){
      $('#sessionProgress').innerHTML = `${currentUser.completedSessions}<small>/5</small>`;
      if($('#sessionCountText')) $('#sessionCountText').textContent = `${currentUser.completedSessions} sessions completed`;
    }
  } else {
    // Guest (Not signed in)
    if(notice) notice.classList.remove('hidden');
    if(forms) forms.classList.remove('hidden');
    if(profile) profile.classList.add('hidden');

    if(profileOrb) profileOrb.textContent = 'CB';
    if(profileName) profileName.textContent = 'My space';
    if(welcomeHeading) welcomeHeading.textContent = 'Welcome back, Carlos.';

    assignments = JSON.parse(JSON.stringify(defaultAssignments));
    if($('#focusInput')) $('#focusInput').value = 40;
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

function showVerificationNoticeSuccess(){
  const verifiedNotice = $('#verifiedNotice');
  if(verifiedNotice){
    verifiedNotice.classList.remove('hidden');
    setTimeout(()=>{ verifiedNotice.classList.add('hidden'); }, 7000);
  }
  showToast('User email verified successfully.');
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

function checkUrlVerification(){
  const urlParams = new URLSearchParams(window.location.search);
  if(urlParams.has('verify') || urlParams.has('confirm_email')){
    const targetEmail = urlParams.get('email') || (currentUser?.email);
    if(currentUser){
      currentUser.emailVerified = true;
      saveUserData();
    }
    showVerificationNoticeSuccess();
    updateAuthUI();
  }
}

function startApp(){
  $('#loader').classList.add('hidden');
  $('#app').classList.remove('hidden');
  renderQuotes();
  updateAuthUI();
  formatDate();
  iconRefresh();
  checkUrlVerification();
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
  $('#focusInput').value=40;
  $('#breakInput').value=10;
  saveUserData();
  showToast('Your recommended rhythm is restored.');
};
$('#pauseSession').onclick=()=>{
  paused=!paused;
  $('#pauseSession').innerHTML=paused?'<i data-lucide="play"></i> Resume':'<i data-lucide="pause"></i> Pause';
  iconRefresh();
};
$('#finishSession').onclick=endSession;
$('#closeModal').onclick=()=>$('#modalBackdrop').classList.add('hidden');

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
  showToast('Session saved — you completed another step.');
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

$('#canvasBtn').onclick=()=>showToast('Connect Canvas through a secure school API to import assignments.');

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

/* Challenges Click */
document.querySelectorAll('.challenge').forEach(c=>c.onclick=()=>{
  c.classList.toggle('done');
  const first=c.querySelector('.challenge-number');
  if(first){
    first.outerHTML='<span class="check-circle"><i data-lucide="check"></i></span>';
  }
  saveUserData();
  iconRefresh();
});

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
  const inputVal = $('#loginUsername').value.trim();
  const password = $('#loginPassword').value;
  const usernameKey = getEmailUsername(inputVal);

  const user = users[usernameKey] || Object.values(users).find(u => u.email?.toLowerCase() === inputVal.toLowerCase() || u.username?.toLowerCase() === inputVal.toLowerCase());

  if(user && user.password === password){
    currentUser = user;
    localStorage.setItem(STORAGE_KEY_ACTIVE, currentUser.username);
    updateAuthUI();
    $('#authDropdown').classList.add('hidden');
    $('#loginForm').reset();
    showToast(`Welcome back, ${currentUser.name || currentUser.username}! Your saved data is loaded.`);
  } else {
    showToast('Invalid credentials. (Try "carlos" / "password123", Google sign-in, or Sign up)');
  }
};

/* Sign Up Form - Dispatches verification email */
$('#signupForm').onsubmit=(e)=>{
  e.preventDefault();
  const email = $('#signupEmail').value.trim();
  const rawDisplayName = $('#signupName').value.trim();
  const password = $('#signupPassword').value;

  const username = getEmailUsername(email);
  if(!username){
    showToast('Please enter a valid email address.');
    return;
  }

  const displayName = rawDisplayName || formatNameFromUsername(username);

  const newUser = {
    username: username,
    name: displayName,
    email: email,
    password: password,
    emailVerified: false,
    focusMinutes: 40,
    breakMinutes: 10,
    completedSessions: 0,
    completedChallenges: [],
    assignments: JSON.parse(JSON.stringify(defaultAssignments))
  };

  users[username] = newUser;
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  pendingVerificationUser = newUser;

  // Prepare and open verification email modal
  $('#emailRecipient').textContent = email;
  $('#emailConfirmAddress').textContent = email;
  $('#emailUsernamePreview').textContent = username;
  $('#authDropdown').classList.add('hidden');
  $('#emailVerificationModal').classList.remove('hidden');
  $('#signupForm').reset();

  showToast(`Verification email sent to ${email} from ${PROJECT_EMAIL}.`);
};

/* Confirm Email Button in Verification Email Modal */
$('#confirmEmailBtn').onclick=()=>{
  if(!pendingVerificationUser && !currentUser){
    // Fallback if no pending user in memory
    const activeUsername = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if(activeUsername && users[activeUsername.toLowerCase()]){
      pendingVerificationUser = users[activeUsername.toLowerCase()];
    }
  }

  if(pendingVerificationUser){
    pendingVerificationUser.emailVerified = true;
    users[pendingVerificationUser.username.toLowerCase()] = pendingVerificationUser;
    currentUser = pendingVerificationUser;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_ACTIVE, currentUser.username);
  } else if(currentUser){
    currentUser.emailVerified = true;
    saveUserData();
  }

  $('#emailVerificationModal').classList.add('hidden');
  showVerificationNoticeSuccess();
  updateAuthUI();
};

$('#closeEmailModal').onclick=()=>{
  $('#emailVerificationModal').classList.add('hidden');
};

/* Google Sign-in Handlers */
function openGoogleModal(){
  $('#authDropdown').classList.add('hidden');
  $('#googleAuthModal').classList.remove('hidden');
}

$('#googleSignInBtn').onclick=openGoogleModal;
$('#googleSignUpBtn').onclick=openGoogleModal;
$('#closeGoogleModal').onclick=()=>$('#googleAuthModal').classList.add('hidden');

function authenticateWithGoogle(email, name){
  const username = getEmailUsername(email);
  const displayName = name || formatNameFromUsername(username);

  let user = users[username];
  if(!user){
    user = {
      username: username,
      name: displayName,
      email: email,
      password: 'google_oauth_verified',
      emailVerified: true,
      authProvider: 'google',
      focusMinutes: 40,
      breakMinutes: 10,
      completedSessions: 0,
      completedChallenges: [],
      assignments: JSON.parse(JSON.stringify(defaultAssignments))
    };
    users[username] = user;
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } else {
    user.emailVerified = true;
    user.authProvider = 'google';
    saveUserData();
  }

  currentUser = user;
  localStorage.setItem(STORAGE_KEY_ACTIVE, username);
  $('#googleAuthModal').classList.add('hidden');
  updateAuthUI();
  showToast(`Signed in with Google as ${username}.`);
}

$('#googleAccountCarlos').onclick=()=>{
  authenticateWithGoogle('carlos.baltierrez@gmail.com', 'Carlos Baltierrez');
};

$('#googleCustomBtn').onclick=()=>{
  const customEmail = $('#googleCustomEmail').value.trim();
  if(!customEmail || !customEmail.includes('@')){
    showToast('Please enter a valid Google email address.');
    return;
  }
  authenticateWithGoogle(customEmail);
};

/* Log Out */
$('#logoutBtn').onclick=()=>{
  localStorage.removeItem(STORAGE_KEY_ACTIVE);
  currentUser = null;
  pendingVerificationUser = null;
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
