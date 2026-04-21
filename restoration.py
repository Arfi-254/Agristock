import re

with open('/home/adan/Desktop/Agristock/index.html', 'r') as f:
    html = f.read()

# 1. Define all the missing core functions
missing_functions = """
// CORE FUNCTIONS
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
"""

# Insert the missing functions after updateDashboardStats
html = html.replace('updateDashboardStats();\\n  }\\n}', 'updateDashboardStats();\\n  }\\n}\\n' + missing_functions)

# 2. Re-insert the init check at the end
html = re.sub(r'if \(currentUser\).*?</script>', 'if (currentUser) { showAuth(\\'app\\'); loadUserData(); }\\n</script>', html, flags=re.DOTALL)

with open('/home/adan/Desktop/Agristock/index.html', 'w') as f:
    f.write(html)
