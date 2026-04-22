let prodChart, distChart, finChart;
let animalEditIdx = null;
let animalView = 'list';
let healthTab = 'all';

function initCharts() {
  const pCtx = document.getElementById('prodChart')?.getContext('2d');
  const dCtx = document.getElementById('distChart')?.getContext('2d');
  const fCtx = document.getElementById('finChart')?.getContext('2d');

  if (pCtx && !prodChart) {
    prodChart = new Chart(pCtx, {
      type: 'line',
      data: { labels: [], datasets: [] },
      options: { responsive: true, maintainAspectRatio: false, tension: 0.4, plugins: { legend: { position: 'top' } } }
    });
  }
  if (dCtx && !distChart) {
    distChart = new Chart(dCtx, {
      type: 'doughnut',
      data: { labels: [], datasets: [] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }
  if (fCtx && !finChart) {
    finChart = new Chart(fCtx, {
      type: 'bar',
      data: { labels: ['Income', 'Expenses'], datasets: [] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
}

function getTodayStr() {
    return new Date().toLocaleDateString('en-CA');
}

function isDue(d) { return d && new Date(d) <= new Date(); }

function updateDashboardStats() {
  initCharts();
  const todayStr = getTodayStr();

  const dAnim = document.getElementById('dashAnim');
  if(dAnim) dAnim.textContent = animals.length;

  const tMilk = prod.filter(p => p.type === 'Milk' && p.date === todayStr).reduce((s, p) => s + p.qty, 0);
  const tEggs = prod.filter(p => p.type === 'Eggs' && p.date === todayStr).reduce((s, p) => s + p.qty, 0);
  
  const dMilk = document.getElementById('dashMilk');
  if(dMilk) dMilk.textContent = tMilk.toLocaleString();
  const dEggs = document.getElementById('dashEggs');
  if(dEggs) dEggs.textContent = tEggs.toLocaleString();

  const overdue = health.filter(r => isDue(r.nextDue));
  const dHealth = document.getElementById('dashHealth');
  if(dHealth) dHealth.textContent = overdue.length;
  
  const dAlert = document.getElementById('dashAlert');
  if(dAlert) {
    dAlert.style.display = overdue.length ? 'flex' : 'none';
    const alertCnt = document.getElementById('alertCount');
    if(alertCnt) alertCnt.textContent = overdue.length + ' animals need attention';
  }

  const hBadge = document.getElementById('healthCountBadge');
  if(hBadge) {
      hBadge.textContent = overdue.length;
      hBadge.style.display = overdue.length ? 'inline-block' : 'none';
  }

  const income = fin.filter(r => r.type === 'Income').reduce((s, r) => s + r.amount, 0);
  const expense = fin.filter(r => r.type === 'Expense').reduce((s, r) => s + r.amount, 0);
  const dRev = document.getElementById('dashRev');
  if(dRev) dRev.textContent = 'KSh ' + (income / 1000).toFixed(1) + 'k';

  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toLocaleDateString('en-CA');
  }).reverse();

  const milkData = last7Days.map(date => prod.filter(p => p.type === 'Milk' && p.date === date).reduce((s, p) => s + p.qty, 0));
  const eggData = last7Days.map(date => prod.filter(p => p.type === 'Eggs' && p.date === date).reduce((s, p) => s + p.qty, 0));

  if(prodChart) {
    prodChart.data.labels = last7Days.map(d => d.split('-').slice(1).join('/'));
    prodChart.data.datasets = [
      { label: 'Milk (L)', data: milkData, borderColor: '#3b82f6', backgroundColor: '#3b82f622', fill: true },
      { label: 'Eggs (Qty)', data: eggData, borderColor: '#f59e0b', backgroundColor: '#f59e0b22', fill: true }
    ];
    prodChart.update();
  }

  const types = ['Cattle', 'Poultry', 'Goat', 'Sheep'];
  const typeCounts = types.map(t => animals.filter(a => a.type === t).length);
  if(distChart) {
    distChart.data.labels = types;
    distChart.data.datasets = [{
      data: typeCounts,
      backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6']
    }];
    distChart.update();
  }

  if(finChart) {
    finChart.data.datasets = [{
      data: [income, expense],
      backgroundColor: ['#10b981', '#ef4444']
    }];
    finChart.update();
  }

  const recentList = document.getElementById('recentActivityList');
  if (recentList) {
    const combined = [
      ...animals.slice(0, 3).map(a => ({ type: 'Animal', text: 'New animal: ' + a.name, date: new Date() })),
      ...health.slice(0, 3).map(h => ({ type: 'Health', text: h.type + ': ' + h.animal, date: new Date(h.date) })),
      ...prod.slice(0, 3).map(p => ({ type: 'Prod', text: 'Log: ' + p.qty + p.unit + ' ' + p.type, date: new Date(p.date) })),
      ...fin.slice(0, 3).map(f => ({ type: 'Fin', text: f.type + ': ' + f.cat, date: new Date(f.date) }))
    ].sort((a,b) => b.date - a.date).slice(0, 10);

    recentList.innerHTML = combined.map(a => `
      <div style="padding: 12px 0; border-bottom: 1px solid var(--border); font-size: 13px;">
        <span style="font-weight: 700; color: var(--primary); font-size: 11px; text-transform: uppercase;">${a.type}</span>
        <div style="margin-top: 2px; color: var(--dark);">${a.text}</div>
      </div>
    `).join('');
  }
}


let users = JSON.parse(localStorage.getItem('slm_users') || '[]');
let currentUser = JSON.parse(localStorage.getItem('slm_active_user') || 'null');

function showAuth(view) {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('signupPage').style.display = 'none';
    document.getElementById('appShell').style.display = 'none';

    if (view === 'login') {
        document.getElementById('loginPage').style.display = 'flex';
    } else if (view === 'signup') {
        document.getElementById('signupPage').style.display = 'flex';
    } else if (view === 'landing') {
        document.getElementById('landingPage').style.display = 'flex';
    } else if (view === 'app') {
        document.getElementById('appShell').style.display = 'block';
        updateDashboardStats();
    }
}

function doSignup() {
    const name = document.getElementById('sName').value.trim();
    const email = document.getElementById('sEmail').value.trim().toLowerCase();
    const pass = document.getElementById('sPass').value;

    if (!name || !email || !pass) return alert('Please fill in all fields');
    if (users.find(u => u.email === email)) return alert('Email already registered');

    const newUser = { name, email, pass, role: 'Farm Manager' };
    users.push(newUser);
    localStorage.setItem('slm_users', JSON.stringify(users));
    
    alert('Account created successfully! Please sign in.');
    showAuth('login');
}

function doLogin() {
    const email = document.getElementById('lEmail').value.trim().toLowerCase();
    const pass = document.getElementById('lPass').value;

    const user = users.find(u => u.email === email && u.pass === pass);

    if (user) {
        currentUser = user;
        localStorage.setItem('slm_active_user', JSON.stringify(user));
        loadUserData();
        showAuth('app');
    } else {
        document.getElementById('loginErr').style.display = 'block';
        setTimeout(() => document.getElementById('loginErr').style.display = 'none', 4000);
    }
}

function doLogout() {
    currentUser = null;
    localStorage.removeItem('slm_active_user');
    showAuth('landing');
}

let animals = [], health = [], prod = [], fin = [];

function loadUserData() {
    if (!currentUser) return;
    const prefix = 'slm_' + currentUser.email + '_';
    
    animals = JSON.parse(localStorage.getItem(prefix + 'animals') || '[]');
    health  = JSON.parse(localStorage.getItem(prefix + 'health') || '[]');
    prod    = JSON.parse(localStorage.getItem(prefix + 'prod') || '[]');
    fin     = JSON.parse(localStorage.getItem(prefix + 'fin') || '[]');

    document.querySelector('.user-name').textContent = currentUser.name.toUpperCase();
    document.querySelector('.user-role').textContent = currentUser.role;
    document.querySelector('.user-av').textContent = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();

    renderAnimals(); renderHealth(); renderProd(); renderFin();
}

function saveData() {
    if (!currentUser) return;
    const prefix = 'slm_' + currentUser.email + '_';
    localStorage.setItem(prefix + 'animals', JSON.stringify(animals));
    localStorage.setItem(prefix + 'health', JSON.stringify(health));
    localStorage.setItem(prefix + 'prod', JSON.stringify(prod));
    localStorage.setItem(prefix + 'fin', JSON.stringify(fin));
}

const pageMeta = {
  dashboard:  { title:'Dashboard',          sub:'Farm overview',                     btn:'+ Add Animal', action: () => openAnimalModal() },
  animals:    { title:'Animals Registry',   sub:'Manage all livestock records',      btn:'+ Add Animal', action: () => openAnimalModal() },
  health:     { title:'Health Records',     sub:'Vaccinations, treatments & visits', btn:'+ Add Record', action: () => openHealthModal() },
  production: { title:'Production',         sub:'Milk, eggs & yield tracking',       btn:'+ Log Output', action: () => openProdModal() },
  finance:    { title:'Finance',            sub:'Income, expenses & profit',         btn:'+ Add Record', action: () => openFinModal('Income') },
};

let currentPage = 'dashboard';

function goTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('pg-' + page).classList.add('active');
  const navItems = document.querySelectorAll('.nav-item');
  const index = ['dashboard','animals','health','production','finance'].indexOf(page);
  if (navItems[index]) navItems[index].classList.add('active');
  
  const m = pageMeta[page];
  document.getElementById('pageTitle').textContent = m.title;
  document.getElementById('pageSubtitle').textContent = m.sub;
  document.getElementById('topActionBtn').textContent = m.btn;
  currentPage = page;
  if (page === 'finance') renderFin();
  if (page === 'dashboard') updateDashboardStats();
}

function topAction() { pageMeta[currentPage].action(); }

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
});

function openAnimalModal() {
  animalEditIdx = null;
  document.getElementById('aN').value = '';
  document.getElementById('aI').value = '';
  document.getElementById('aT').value = 'Cattle';
  document.getElementById('aB').value = '';
  document.getElementById('aD').value = '';
  document.getElementById('aG').value = 'Female';
  document.getElementById('aW').value = '';
  document.getElementById('aSt').value = 'Healthy';
  document.getElementById('aNo').value = '';
  document.getElementById('animalModalTitle').textContent = 'Add Animal';
  openModal('animalModal');
}

const EMOJI = { Cattle:'🐄', Poultry:'🐔', Goat:'🐐', Sheep:'🐑' };
const SDOT  = { Healthy:'h', Sick:'s', 'Under Treatment':'t' };

function getAge(dob) {
  const ms = Date.now() - new Date(dob).getTime();
  const y = Math.floor(ms / (365.25*24*60*60*1000));
  const m = Math.floor((ms % (365.25*24*60*60*1000)) / (30.44*24*60*60*1000));
  return y > 0 ? y + 'y ' + m + 'm' : m + 'm';
}

function sBadge(s) {
  const c = { Healthy:'b-green', Sick:'b-red', 'Under Treatment':'b-orange' };
  return '<span class="badge ' + (c[s]||'b-gray') + '">● ' + s + '</span>';
}

function renderAnimals() {
  const q  = (document.getElementById('aSearch')?.value || '').toLowerCase();
  const tp = document.getElementById('aType')?.value || '';
  const st = document.getElementById('aStatus')?.value || '';

  const data = animals.filter(a =>
    (!q  || a.name.toLowerCase().includes(q) || a.id.toLowerCase().includes(q) || a.breed.toLowerCase().includes(q)) &&
    (!tp || a.type === tp) && (!st || a.status === st)
  );

  const tbody = document.getElementById('aTbody');
  if (tbody) tbody.innerHTML = data.map(a => `
    <tr>
      <td><code style="background:#f5f5f5;padding:2px 7px;border-radius:4px;font-size:11px;">${a.id}</code></td>
      <td><strong>${EMOJI[a.type] || ''} ${a.name}</strong></td>
      <td>${a.type}</td><td>${a.breed}</td><td>${getAge(a.dob)}</td>
      <td>${a.gender}</td><td>${a.weight}kg</td><td>${sBadge(a.status)}</td>
      <td style="display:flex;gap:5px;">
        <button class="btn btn-gray btn-sm" onclick="editAnimal(${animals.indexOf(a)})">edit</button>
        <button class="btn btn-red  btn-sm" onclick="delAnimal(${animals.indexOf(a)})">delete</button>
      </td>
    </tr>`).join('');

  const grid = document.getElementById('aGridView');
  if (grid) grid.innerHTML = data.map(a => `
    <div class="a-card">
      <div class="a-card-top">${EMOJI[a.type] || ''}<div class="a-dot ${SDOT[a.status]||'h'}"></div></div>
      <div class="a-card-body">
        <div class="a-name">${a.name}</div>
        <div class="a-id">${a.id} · ${a.breed}</div>
        <div class="a-meta">
          <div><div style="color:#888;font-size:10px;">Age</div><div class="a-meta-v">${getAge(a.dob)}</div></div>
          <div><div style="color:#888;font-size:10px;">Weight</div><div class="a-meta-v">${a.weight}kg</div></div>
          <div><div style="color:#888;font-size:10px;">Gender</div><div class="a-meta-v">${a.gender}</div></div>
          <div><div style="color:#888;font-size:10px;">Status</div><div class="a-meta-v">${a.status}</div></div>
        </div>
      </div>
      <div class="a-card-foot">
        <button class="btn btn-gray btn-sm" style="flex:1;" onclick="editAnimal(${animals.indexOf(a)})">✏️ Edit</button>
        <button class="btn btn-red btn-sm" onclick="delAnimal(${animals.indexOf(a)})">🗑</button>
      </div>
    </div>`).join('');

  const aCount = document.getElementById('animalCount');
  if(aCount) aCount.textContent = animals.length;

  const cCattle = document.getElementById('cntCattle');
  const cPoultry = document.getElementById('cntPoultry');
  const cGoat = document.getElementById('cntGoat');
  const cSheep = document.getElementById('cntSheep');

  if(cCattle) cCattle.textContent = animals.filter(a => a.type === 'Cattle').length;
  if(cPoultry) cPoultry.textContent = animals.filter(a => a.type === 'Poultry').length;
  if(cGoat) cGoat.textContent = animals.filter(a => a.type === 'Goat').length;
  if(cSheep) cSheep.textContent = animals.filter(a => a.type === 'Sheep').length;

  updateDashboardStats();
}

function setView(v) {
  animalView = v;
  document.getElementById('aGridView').style.display = v === 'grid' ? 'grid' : 'none';
  document.getElementById('aListView').style.display = v === 'list' ? 'block' : 'none';
  document.getElementById('vGrid').classList.toggle('active', v === 'grid');
  document.getElementById('vList').classList.toggle('active', v === 'list');
}

function editAnimal(i) {
  animalEditIdx = i;
  const a = animals[i];
  document.getElementById('aN').value  = a.name;
  document.getElementById('aI').value  = a.id;
  document.getElementById('aT').value  = a.type;
  document.getElementById('aB').value  = a.breed;
  document.getElementById('aD').value  = a.dob;
  document.getElementById('aG').value  = a.gender;
  document.getElementById('aW').value  = a.weight;
  document.getElementById('aSt').value = a.status;
  document.getElementById('aNo').value = a.notes;
  document.getElementById('animalModalTitle').textContent = 'Edit Animal';
  openModal('animalModal');
}

function saveAnimal() {
  const obj = {
    id: document.getElementById('aI').value || 'AN-' + Date.now(),
    name: document.getElementById('aN').value || 'Unnamed',
    type: document.getElementById('aT').value,
    breed: document.getElementById('aB').value,
    dob: document.getElementById('aD').value || '2020-01-01',
    gender: document.getElementById('aG').value,
    weight: parseFloat(document.getElementById('aW').value) || 0,
    status: document.getElementById('aSt').value,
    notes: document.getElementById('aNo').value,
  };
  if (animalEditIdx !== null) { animals[animalEditIdx] = obj; animalEditIdx = null; }
  else animals.unshift(obj);
  saveData(); closeModal('animalModal');
  document.getElementById('animalModalTitle').textContent = 'Add Animal';
  renderAnimals();
}

function delAnimal(i) {
  if (confirm('Delete ' + animals[i].name + '?')) { animals.splice(i, 1); saveData(); renderAnimals(); }
}

const HBADGE = { Vaccination:'b-blue', Treatment:'b-orange', 'Check-up':'b-green' };
const HICON  = { Vaccination:'💉', Treatment:'💊', 'Check-up':'🩺' };

function switchHealthTab(tab) {
  healthTab = tab;
  document.querySelectorAll('#healthTabs .tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  renderHealth();
}

function renderHealth() {
  const q = (document.getElementById('hSearch')?.value || '').toLowerCase();
  let data = [...health].sort((a,b) => new Date(b.date)-new Date(a.date));
  if (healthTab !== 'all') data = data.filter(r => r.type === healthTab);
  if (q) data = data.filter(r => r.animal.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q));

  const tbody = document.getElementById('hTbody');
  if (tbody) tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td>${r.date}</td>
      <td><strong>${r.animal}</strong></td>
      <td><span class="badge ${HBADGE[r.type]||'b-gray'}">${HICON[r.type]||''} ${r.type}</span></td>
      <td style="font-size:12px;max-width:200px;">${r.desc}</td>
      <td>${r.vet}</td>
      <td style="font-size:12px;color:${isDue(r.nextDue)?'#ef4444':'#1f2937'};">${isDue(r.nextDue)?'⚠️ ':''}${r.nextDue||'—'}</td>
      <td>${r.cost?'KSh '+r.cost.toLocaleString():'—'}</td>
      <td><button class="btn btn-red btn-sm" onclick="delHealth(${i})">delete</button></td>
    </tr>`).join('');

  const hSickEl = document.getElementById('hSick');
  const hTreatEl = document.getElementById('hTreat');
  const hHealthyEl = document.getElementById('hHealthy');
  const hDueEl = document.getElementById('hDue');

  if(hSickEl) hSickEl.textContent = animals.filter(a => a.status === 'Sick').length;
  if(hTreatEl) hTreatEl.textContent = animals.filter(a => a.status === 'Under Treatment').length;
  if(hHealthyEl) hHealthyEl.textContent = animals.filter(a => a.status === 'Healthy').length;
  
  const todayStr = getTodayStr();
  if(hDueEl) hDueEl.textContent = health.filter(r => r.nextDue === todayStr).length;

  updateDashboardStats();
}

function openHealthModal() {
  document.getElementById('hD').value = getTodayStr();
  openModal('healthModal');
}

function saveHealth() {
  health.unshift({
    id: Date.now(),
    date: document.getElementById('hD').value || getTodayStr(),
    animal: document.getElementById('hA').value || 'Unknown',
    type: document.getElementById('hT').value,
    desc: document.getElementById('hDe').value,
    vet: document.getElementById('hV').value,
    nextDue: document.getElementById('hN').value,
    cost: parseFloat(document.getElementById('hC').value) || 0,
  });
  saveData();
  closeModal('healthModal'); renderHealth();
}

function delHealth(i) {
  const sorted = [...health].sort((a,b) => new Date(b.date)-new Date(a.date));
  const idx = health.findIndex(r => r.id === sorted[i].id);
  if (idx > -1 && confirm('Delete this record?')) {
    health.splice(idx, 1);
    saveData();
    renderHealth();
  }
}


const PICON = { Milk:'🥛', Eggs:'🥚', Meat:'🥩' };
const PCLR  = { Milk:'b-blue', Eggs:'b-orange', Meat:'b-gray' };

function renderProd() {
  const tf = document.getElementById('pTypeFilter')?.value || '';
  let data = [...prod].sort((a,b) => new Date(b.date)-new Date(a.date));
  if (tf) data = data.filter(r => r.type === tf);

  const tbody = document.getElementById('pTbody');
  if (tbody) tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td>${r.date}</td>
      <td><span class="badge ${PCLR[r.type] || 'b-gray'}">${PICON[r.type] || ''} ${r.type}</span></td>
      <td>${r.animal}</td>
      <td><strong>${r.qty}</strong></td>
      <td>${r.unit}</td>
      <td style="font-size:12px;color:#888;">${r.notes||'—'}</td>
      <td><button class="btn btn-red btn-sm" onclick="delProd(${i})">🗑</button></td>
    </tr>`).join('');

  const todayStr = getTodayStr();
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - 7);
  const limitStr = limitDate.toLocaleDateString('en-CA');

  const milkToday = prod.filter(p => p.type === 'Milk' && p.date === todayStr).reduce((s, p) => s + p.qty, 0);
  const eggsToday = prod.filter(p => p.type === 'Eggs' && p.date === todayStr).reduce((s, p) => s + p.qty, 0);
  
  const milkWeek = prod.filter(p => p.type === 'Milk' && p.date >= limitStr).reduce((s, p) => s + p.qty, 0);
  const eggsWeek = prod.filter(p => p.type === 'Eggs' && p.date >= limitStr).reduce((s, p) => s + p.qty, 0);

  const mTodayEl = document.getElementById('pMilkToday');
  const eTodayEl = document.getElementById('pEggsToday');
  const mWeekEl = document.getElementById('pMilkWeek');
  const eWeekEl = document.getElementById('pEggsWeek');

  if(mTodayEl) mTodayEl.textContent = milkToday.toLocaleString();
  if(eTodayEl) eTodayEl.textContent = eggsToday.toLocaleString();
  if(mWeekEl) mWeekEl.textContent = milkWeek.toLocaleString();
  if(eWeekEl) eWeekEl.textContent = eggsWeek.toLocaleString();

  updateDashboardStats();
}

function openProdModal() {
  document.getElementById('pD').value = getTodayStr();
  openModal('prodModal');
}

function saveProd() {
  prod.unshift({
    id: Date.now(),
    date: document.getElementById('pD').value || getTodayStr(),
    type: document.getElementById('pT').value,
    animal: document.getElementById('pA').value || 'Unspecified',
    qty: parseFloat(document.getElementById('pQ').value) || 0,
    unit: document.getElementById('pU').value,
    notes: document.getElementById('pNo').value,
  });
  saveData();
  closeModal('prodModal'); renderProd();
}

function delProd(i) {
  const sorted = [...prod].sort((a,b) => new Date(b.date)-new Date(a.date));
  const idx = prod.findIndex(r => r.id === sorted[i].id);
  if (idx > -1 && confirm('Delete?')) {
    prod.splice(idx, 1);
    saveData();
    renderProd();
  }
}

function fmt(n) { return 'KSh ' + Math.abs(n).toLocaleString(); }

function renderFin() {
  const tf = document.getElementById('fTypeFilter')?.value || '';
  let data = [...fin].sort((a,b) => new Date(b.date)-new Date(a.date));
  if (tf) data = data.filter(r => r.type === tf);

  const tbody = document.getElementById('fTbody');
  if (tbody) tbody.innerHTML = data.map((r, i) => `
    <tr>
      <td>${r.date}</td>
      <td><span class="badge ${r.type==='Income'?'b-green':'b-red'}">${r.type==='Income'?'↑':'↓'} ${r.type}</span></td>
      <td><span class="badge b-gray" style="font-size:10px;">${r.cat}</span></td>
      <td style="font-size:12px;">${r.desc}</td>
      <td style="font-weight:700;color:${r.type==='Income'?'#10b981':'#ef4444'};">${r.type==='Income'?'+':'−'} ${fmt(r.amount)}</td>
      <td><button class="btn btn-red btn-sm" onclick="delFin(${i})">🗑</button></td>
    </tr>`).join('');

  const income  = fin.filter(r=>r.type==='Income').reduce((s,r)=>s+r.amount,0);
  const expense = fin.filter(r=>r.type==='Expense').reduce((s,r)=>s+r.amount,0);
  const profit  = income - expense;

  const iEl = document.getElementById('fIncome');
  const eEl = document.getElementById('fExpense');
  const pEl = document.getElementById('fProfit');
  const cEl = document.getElementById('fProfitCh');
  if (iEl) iEl.textContent = fmt(income);
  if (eEl) eEl.textContent = fmt(expense);
  if (pEl) pEl.textContent = fmt(profit);
  if (cEl) { 
    cEl.textContent = profit >= 0 ? ' Profitable' : ' At a loss'; 
    cEl.className = 'stat-ch '+(profit>=0?'up':'down'); 
  }
  updateDashboardStats();
}

function openFinModal(type) {
  document.getElementById('fD').value = getTodayStr();
  document.getElementById('fT').value = type;
  document.getElementById('finModalTitle').textContent = type === 'Income' ? 'Record Income' : 'Record Expense';
  openModal('finModal');
}

function saveFin() {
  fin.unshift({
    id: Date.now(),
    date: document.getElementById('fD').value || getTodayStr(),
    type: document.getElementById('fT').value,
    cat: document.getElementById('fC').value,
    desc: document.getElementById('fDe').value || '—',
    amount: parseFloat(document.getElementById('fA').value) || 0,
  });
  saveData();
  closeModal('finModal'); renderFin();
}

function delFin(i) {
  const sorted = [...fin].sort((a,b) => new Date(b.date)-new Date(a.date));
  const idx = fin.findIndex(r => r.id === sorted[i].id);
  if (idx > -1 && confirm('Delete this record?')) {
    fin.splice(idx, 1);
    saveData();
    renderFin();
  }
}

document.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        showAuth('app');
        loadUserData();
    } else {
        showAuth('landing');
    }
});

