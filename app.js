/* ════ DATA ════════════════════════════════════ */
const CLIENT_COLORS=[
  '#9b7fff','#f07ab0','#2fdba0','#f0a830','#f06040',
  '#70d040','#40a0f0','#d070d0','#e04444','#40c0d0'
];

const THEMES=[
  {id:'dark',   cls:'',          bg:'#ffffff', label:'Dark'},
  {id:'aurora', cls:'t-aurora',  bg:'#38bdf8', label:'Aurora'},
  {id:'blossom',cls:'t-blossom', bg:'#f472b6', label:'Blossom'},
  {id:'jade',   cls:'t-jade',    bg:'#34d399', label:'Jade'},
  {id:'solar',  cls:'t-solar',   bg:'#fbbf24', label:'Solar'},
  {id:'pearl',  cls:'t-pearl',   bg:'#000000', label:'Pearl'},
];

let db = {
  clients: [],       // [{id,name,colorIdx}]
  posts:   {},       // key: clientId+'_'+year+'-'+month+'-'+day => [{...}]
  activeClient: null,
  theme: 'dark',
};

function loadDB(){
  try{ const s=localStorage.getItem('nz_db'); if(s) db=JSON.parse(s); }catch(e){}
  if(!db.clients) db.clients=[];
  if(!db.posts)   db.posts={};
  if(!db.theme)   db.theme='dark';
  if(db.clients.length===0){
    db.clients=[{id:'demo',name:'Demo Brand',colorIdx:0}];
    db.activeClient='demo';
  }
  if(!db.activeClient || !db.clients.find(c=>c.id===db.activeClient)){
    db.activeClient=db.clients[0].id;
  }
}
function saveDB(){ localStorage.setItem('nz_db',JSON.stringify(db)); }

function clientColor(c){ return CLIENT_COLORS[c.colorIdx%CLIENT_COLORS.length]; }
function activeClientObj(){ return db.clients.find(c=>c.id===db.activeClient)||db.clients[0]; }
function postKey(date){ return db.activeClient+'_'+date; }

/* ════ STATE ═══════════════════════════════════ */
let currentDate = new Date(2026,3,1);
let currentView = 'calendar';
let listFilter  = 'all';
let listSearch  = '';
let editingKey  = null;
let editingIdx  = null;
let confirmCb   = null;

/* ════ INIT ════════════════════════════════════ */
function init(){
  loadDB();
  applyTheme(db.theme,false);
  renderThemes();
  renderClients();
  renderBadge();
  renderAll();

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape'){
      closePostModal();
      closeConfirm();
      closeClientModal();
    }
    if(e.key === 'n' || e.key === 'N'){
      const anyOpen = document.querySelector('.overlay.open');
      if(!anyOpen && document.activeElement.tagName !== 'INPUT'
         && document.activeElement.tagName !== 'TEXTAREA'
         && document.activeElement.tagName !== 'SELECT'){
        openAddModal(null);
      }
    }
  });

  ['overlay-post','overlay-confirm','overlay-client'].forEach(id => {
    document.getElementById(id).addEventListener('click', function(e){
      if(e.target === this){
        if(id === 'overlay-post')    closePostModal();
        if(id === 'overlay-confirm') closeConfirm();
        if(id === 'overlay-client')  closeClientModal();
      }
    });
  });
}
/* ════ THEMES ══════════════════════════════════ */
function renderThemes(){
  document.getElementById('theme-row').innerHTML=THEMES.map(t=>`
    <div class="t-dot${db.theme===t.id?' active':''}"
      style="background:${t.bg};" title="${t.label}"
      onclick="applyTheme('${t.id}')"></div>`).join('');
}
function applyTheme(id,save=true){
  const t=THEMES.find(x=>x.id===id)||THEMES[0];
  document.body.className=t.cls;
  db.theme=id;
  if(save){ saveDB(); renderThemes(); renderAll(); }
}

/* ════ CLIENTS ═════════════════════════════════ */
function renderClients(){
  const wrap=document.getElementById('clients-wrap');
  wrap.innerHTML=db.clients.map(c=>`
    <div class="client-item${c.id===db.activeClient?' active':''}" onclick="selectClient('${c.id}')">
      <div class="client-avatar" style="background:${clientColor(c)}22;color:${clientColor(c)};">
        ${c.name.slice(0,2).toUpperCase()}
      </div>
      <div class="client-name">${c.name}</div>
      <button class="client-del" onclick="event.stopPropagation();askDeleteClient('${c.id}')" title="Remove">✕</button>
    </div>`).join('');
}
function selectClient(id){
  db.activeClient=id; saveDB();
  renderClients(); renderBadge(); renderAll();
}
function renderBadge(){
  const c=activeClientObj();
  document.getElementById('badge-name').textContent=c?c.name:'—';
  document.getElementById('badge-dot').style.background=c?clientColor(c):'#555';
}
function promptAddClient(){ document.getElementById('f-client-name').value=''; openOverlay('overlay-client'); }
function closeClientModal(){ closeOverlay('overlay-client'); }
function saveClient(){
  const name=document.getElementById('f-client-name').value.trim();
  if(!name) return;
  if(db.clients.find(c=>c.name.toLowerCase()===name.toLowerCase())){alert('Already exists');return;}
  const id='c'+Date.now();
  const colorIdx=db.clients.length%CLIENT_COLORS.length;
  db.clients.push({id,name,colorIdx});
  db.activeClient=id;
  saveDB(); closeClientModal();
  renderClients(); renderBadge(); renderAll();
}
function askDeleteClient(id){
  const c=db.clients.find(x=>x.id===id);
  if(!c) return;
  if(db.clients.length===1){showToast('At least one client required.');return;}
  showConfirm(`Delete client "${c.name}"?`,'All their posts will be removed. This cannot be undone.',()=>{
    Object.keys(db.posts).forEach(k=>{ if(k.startsWith(id+'_')) delete db.posts[k]; });
    db.clients=db.clients.filter(x=>x.id!==id);
    if(db.activeClient===id) db.activeClient=db.clients[0].id;
    saveDB(); renderClients(); renderBadge(); renderAll();
  });
}

/* ════ VIEW SWITCH ═════════════════════════════ */
function switchView(v,el){
  currentView=v;
  document.querySelectorAll('.v-tab').forEach(t=>t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderAll();
}
function renderAll(){ renderMonthLabel(); renderContent(); renderStats(); }

/* ════ MONTH ═══════════════════════════════════ */
function changeMonth(d){
  currentDate=new Date(currentDate.getFullYear(),currentDate.getMonth()+d,1);
  renderAll();
}
function goToToday(){
  currentDate = new Date();
  currentDate.setDate(1);
  renderAll();
}
function renderMonthLabel(){
  const lbl=currentDate.toLocaleString('default',{month:'long',year:'numeric'});
  document.getElementById('m-label').textContent=lbl;
}

/* ════ CONTENT ROUTER ══════════════════════════ */
function renderContent(){
  const el=document.getElementById('content');
  if(currentView==='calendar') el.innerHTML=buildCalendarHTML();
  else if(currentView==='list') el.innerHTML=buildListHTML();
  else el.innerHTML=buildAnalyticsHTML();
  attachCalendarEvents();

  if (currentView === 'analytics') {
    requestAnimationFrame(() => {
      const canvas = document.getElementById('type-chart');
      if (!canvas) return;
      if (!window.Chart) {
        canvas.outerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:11px;color:var(--tx3);text-align:center;">Chart library failed to load.<br/>Please check your connection.</div>';
        return;
      }
      if (canvas._chartInst) canvas._chartInst.destroy();
      const bt = { Reel:'#f07ab0', Carousel:'#f0a830', Static:'#7c6fff', Story:'#2fdba0', Collab:'#f06040' };
      const entries = Object.entries(bt);
      canvas._chartInst = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: entries.map(([t])=>t),
          datasets: [{
            data: entries.map(([t]) => {
              const y = currentDate.getFullYear(), m = currentDate.getMonth();
              let cnt = 0;
              for (let d=1;d<=31;d++) {
                (db.posts[postKeyFor(db.activeClient,y,m,d)]||[]).forEach(p=>{ if(p.type===t) cnt++; });
              }
              return cnt;
            }),
            backgroundColor: entries.map(([t])=>bt[t]+'44'),
            borderColor: entries.map(([t])=>bt[t]),
            borderWidth: 1.5,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '68%',
          plugins: { legend: { display: false }, tooltip: { callbacks: {
            label: ctx => ` ${ctx.label}: ${ctx.parsed}`
          }}}
        }
      });
    });
  }
}

/* ════ STATS ════════════════════════════════════ */
function getMonthStats(){
  const y=currentDate.getFullYear(),m=currentDate.getMonth();
  let total=0,posted=0,reels=0,carousels=0;
  for(let d=1;d<=31;d++){
    (db.posts[postKeyFor(db.activeClient,y,m,d)]||[]).forEach(p=>{
      total++; if(p.status==='Posted') posted++;
      if(p.type==='Reel') reels++; if(p.type==='Carousel') carousels++;
    });
  }
  return{total,posted,reels,carousels};
}
function postKeyFor(cid,y,m,d){ return cid+'_'+y+'-'+m+'-'+d; }
function renderStats() {
  const s = getMonthStats();
  const map = { 's-total': s.total, 's-posted': s.posted, 's-reels': s.reels, 's-carousels': s.carousels };
  Object.entries(map).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  });
}

/* ════ CALENDAR ════════════════════════════════ */
function buildCalendarHTML(){
  const y=currentDate.getFullYear(),m=currentDate.getMonth();
  const today=new Date();
  const first=new Date(y,m,1).getDay();
  const days=new Date(y,m+1,0).getDate();
  const s=getMonthStats();

  let statsHTML=`<div class="stats-grid">
    <div class="stat-card"><div class="stat-num" id="s-total">${s.total}</div><div class="stat-lbl">Posts planned</div></div>
    <div class="stat-card"><div class="stat-num" id="s-posted">${s.posted}</div><div class="stat-lbl">Posted</div></div>
    <div class="stat-card"><div class="stat-num" id="s-reels">${s.reels}</div><div class="stat-lbl">Reels</div></div>
    <div class="stat-card"><div class="stat-num" id="s-carousels">${s.carousels}</div><div class="stat-lbl">Carousels</div></div>
  </div>`;

  const legendHTML = `
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;
      padding:8px 14px;background:var(--sur);border:1px solid var(--bdr);
      border-radius:10px;margin-bottom:14px;font-size:11px;color:var(--tx2);">
      ${Object.entries({Reel:'#f07ab0',Carousel:'#f0a830',Static:'#7c6fff',Story:'#2fdba0',Collab:'#f06040'})
        .map(([t,c])=>`
          <span style="display:flex;align-items:center;gap:5px;">
            <span style="width:8px;height:8px;border-radius:2px;background:${c};flex-shrink:0;"></span>
            ${t}
          </span>`).join('')}
    </div>`;

  let calHTML=`<div class="cal-section"><div class="day-labels">
    ${['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=>`<div class="day-lbl">${d}</div>`).join('')}
  </div><div class="cal-grid" id="cal-grid">`;

  for(let i=0;i<first;i++) calHTML+=`<div class="cal-cell empty"></div>`;
  for(let d=1;d<=days;d++){
    const key=postKeyFor(db.activeClient,y,m,d);
    const dayPosts=db.posts[key]||[];
    const isToday=today.getFullYear()===y&&today.getMonth()===m&&today.getDate()===d;
    const isSun=new Date(y,m,d).getDay()===0;
    let pills=dayPosts.slice(0,2).map((p,i)=>`
      <span class="post-pill" style="background:${typeColor(p.type)}12;color:${typeColor(p.type)};"
        data-key="${key}" data-idx="${i}">
        <span class="pill-inner">
          ${p.title||p.type||'Post'}
          <span class="pill-dot" style="background:${statusColor(p.status)};"></span>
        </span>
      </span>`).join('');
    if(dayPosts.length>2) pills+=`<span class="more-pill">+${dayPosts.length-2} more</span>`;
    calHTML+=`<div class="cal-cell${isToday?' today':''}${isSun?' sunday':''}" data-key="${key}" data-day="${d}">
      <div class="cell-dn">${d}${isToday?'<span class="today-chip">TODAY</span>':''}</div>
      ${pills}
    </div>`;
  }
  calHTML+=`</div></div>`;
  return statsHTML + legendHTML + calHTML;
}

function typeColor(type){
  const map={Reel:'#f07ab0',Carousel:'#f0a830',Static:'#7c6fff',Story:'#2fdba0',Collab:'#f06040'};
  return map[type]||'#7c6fff';
}
function statusColor(status){
  const map = {
    'Idea':        'var(--tx3)',
    'In progress': 'var(--yel)',
    'Ready':       'var(--acc)',
    'Scheduled':   'var(--grn)',
    'Posted':      '#5ec870',
  };
  return map[status] || 'var(--tx3)';
}

function attachCalendarEvents(){
  document.querySelectorAll('.cal-cell:not(.empty)').forEach(cell=>{
    cell.addEventListener('click',function(e){
      if(e.target.classList.contains('post-pill')) return;
      openDayModal(this.dataset.key, parseInt(this.dataset.day));
    });
  });
  document.querySelectorAll('.post-pill').forEach(pill=>{
    pill.addEventListener('click',function(e){
      e.stopPropagation();
      openEditModal(this.dataset.key, parseInt(this.dataset.idx));
    });
  });
}

/* ════ LIST VIEW ═══════════════════════════════ */
function buildListHTML(){
  const filters=['all','Idea','In progress','Ready','Scheduled','Posted'];
  let chips=`
    <div class="list-search-wrap">
      <i class="ti ti-search list-search-icon" aria-hidden="true"></i>
      <input
        class="list-search-input"
        id="list-search"
        type="text"
        placeholder="Search posts..."
        value="${listSearch}"
        oninput="setListSearch(this.value)"
      />
      ${listSearch ? `<button class="list-search-clear" onclick="setListSearch('')">
        <i class="ti ti-x" aria-hidden="true"></i>
      </button>` : ''}
    </div>
    <div class="list-filters">${filters.map(f=>`
      <div class="lf-chip${listFilter===f?' active':''}" onclick="setListFilter('${f}')">${f==='all'?'All':f}</div>`).join('')}
    </div>`;

  const allPosts=[];
  const curY = currentDate.getFullYear();
  const curM = currentDate.getMonth();
  Object.entries(db.posts).forEach(([key,arr])=>{
    if(!key.startsWith(db.activeClient+'_')) return;
    const dateStr=key.replace(db.activeClient+'_','');
    const parts=dateStr.split('-');
    if(parseInt(parts[0]) !== curY || parseInt(parts[1]) !== curM) return;
    const date=new Date(parseInt(parts[0]),parseInt(parts[1]),parseInt(parts[2]));
    arr.forEach((p,i)=> allPosts.push({key,idx:i,post:p,date}));
  });
  allPosts.sort((a,b)=>a.date-b.date);
  let filtered = listFilter==='all' ? allPosts : allPosts.filter(x=>x.post.status===listFilter);
  if(listSearch.trim()){
    const q = listSearch.toLowerCase();
    filtered = filtered.filter(({post}) =>
      (post.title||'').toLowerCase().includes(q) ||
      (post.caption||'').toLowerCase().includes(q) ||
      (post.hashtags||'').toLowerCase().includes(q)
    );
  }

  if(!filtered.length){
    return chips+`<div class="empty-msg"><h3>No posts yet</h3><p>Add posts from the calendar or click "+ Add Post".</p></div>`;
  }

  const rows=filtered.map(({key,idx,post,date})=>{
    const ds=date.toLocaleDateString('default',{weekday:'short',month:'short',day:'numeric'});
    const col=typeColor(post.type);
    const scls=statusCls(post.status);
    return `<div class="task-row">
      <div class="task-bar" style="background:${col};"></div>
      <div class="task-body">
        <div class="task-meta">
          <span class="task-date">${ds}</span>
          ${post.type?`<span class="task-type">${post.type}</span>`:''}
          ${post.task?`<span class="task-type" style="color:var(--tx2);">${post.task}</span>`:''}
        </div>
        ${post.title?`<div class="task-title">${post.title}</div>`:''}
        ${post.caption?`<div class="task-caption">${post.caption.slice(0,120)}${post.caption.length>120?'…':''}</div>`:''}
        ${post.hashtags?`<div class="task-tags">${post.hashtags}</div>`:''}
      </div>
      <span class="status-badge ${scls}">${post.status||'Idea'}</span>
      <div class="task-acts">
        <button class="t-btn" onclick="openEditModal('${key}',${idx})" title="Edit">✏</button>
        <button class="t-btn del" onclick="askDeleteSingle('${key}',${idx})" title="Delete">✕</button>
      </div>
    </div>`;
  }).join('');

  const s=getMonthStats();
  const stats=`<div class="stats-grid" style="margin-bottom:16px;">
    <div class="stat-card"><div class="stat-num" id="s-total">${s.total}</div><div class="stat-lbl">Posts planned</div></div>
    <div class="stat-card"><div class="stat-num" id="s-posted">${s.posted}</div><div class="stat-lbl">Posted</div></div>
    <div class="stat-card"><div class="stat-num" id="s-reels">${s.reels}</div><div class="stat-lbl">Reels</div></div>
    <div class="stat-card"><div class="stat-num" id="s-carousels">${s.carousels}</div><div class="stat-lbl">Carousels</div></div>
  </div>`;

  return stats+chips+`<div class="task-list">${rows}</div>`;
}

function setListFilter(f){ listFilter=f; renderContent(); }
function setListSearch(val){
  listSearch = val;
  renderContent();
  requestAnimationFrame(()=>{
    const el = document.getElementById('list-search');
    if(el){ el.focus(); el.setSelectionRange(val.length, val.length); }
  });
}
function statusCls(s){
  if(!s||s==='Idea') return 's-idea';
  if(s==='In progress') return 's-wip';
  if(s==='Ready') return 's-ready';
  if(s==='Scheduled') return 's-sched';
  if(s==='Posted') return 's-posted';
  return 's-idea';
}

/* ════ ANALYTICS ════════════════════════════════ */
function buildAnalyticsHTML(){
  const y=currentDate.getFullYear(),m=currentDate.getMonth();
  const daysInMonth=new Date(y,m+1,0).getDate();
  let total=0,posted=0;
  const byType={Reel:0,Carousel:0,Static:0,Story:0,Collab:0};
  const byWeek=[0,0,0,0,0];
  for(let d=1;d<=daysInMonth;d++){
    (db.posts[postKeyFor(db.activeClient,y,m,d)]||[]).forEach(p=>{
      total++; if(p.status==='Posted') posted++;
      if(byType[p.type]!==undefined) byType[p.type]++;
      const w=Math.floor((d-1)/7); byWeek[w]=(byWeek[w]||0)+1;
    });
  }
  const pct=total?Math.round(posted/total*100):0;

  const dlStrip=`<div class="dl-strip">
    <div class="dl-text">
      <h3>Export this month's plan</h3>
      <p>Download as CSV or JSON for sharing or archiving.</p>
    </div>
    <div class="dl-btns">
      <button class="dl-btn primary" onclick="downloadCSV()">&#8595; CSV</button>
      <button class="dl-btn" onclick="downloadJSON()">&#8595; JSON</button>
      <button class="dl-btn" onclick="window.print()">Print</button>
    </div>
  </div>`;

  if(total === 0){
    return `${dlStrip}
    <div style="
      display:flex;flex-direction:column;align-items:center;
      justify-content:center;padding:64px 24px;
      text-align:center;gap:12px;
    ">
      <div style="
        width:52px;height:52px;border-radius:14px;
        background:var(--sur2);border:1px solid var(--bdr);
        display:flex;align-items:center;justify-content:center;
        font-size:22px;margin-bottom:4px;
      ">📅</div>
      <div style="font-family:'Syne',sans-serif;font-size:16px;
        font-weight:600;color:var(--tx2);letter-spacing:-.01em;">
        No posts this month
      </div>
      <div style="font-size:13px;color:var(--tx3);max-width:280px;line-height:1.6;">
        Add posts to the calendar to see your analytics here.
      </div>
      <button onclick="switchView('calendar', document.querySelector('.v-tab'))"
        style="margin-top:8px;padding:9px 20px;border-radius:8px;border:1px solid var(--bdr2);
        background:none;color:var(--tx2);font-size:13px;font-weight:500;
        cursor:pointer;font-family:var(--font);transition:all .15s;"
        onmouseover="this.style.background='var(--sur2)';this.style.color='var(--tx)'"
        onmouseout="this.style.background='none';this.style.color='var(--tx2)'">
        Go to calendar
      </button>
    </div>`;
  }

  const typeRows=Object.entries(byType).map(([t,n])=>`
    <div class="prog-row">
      <div class="prog-label"><span>${t}</span><span>${n}</span></div>
      <div class="prog-track"><div class="prog-fill" style="width:${total?Math.round(n/total*100):0}%;background:${typeColor(t)};"></div></div>
    </div>`).join('');

  const maxW=Math.max(...byWeek,1);
  const weekRows=byWeek.map((n,i)=>`
    <div class="prog-row">
      <div class="prog-label"><span>Week ${i+1}</span><span>${n}</span></div>
      <div class="prog-track"><div class="prog-fill" style="width:${Math.round(n/maxW*100)}%;background:var(--acc);"></div></div>
    </div>`).join('');

  return `${dlStrip}<div class="analytics-grid">
    <div class="a-card">
      <div class="a-title">Monthly progress</div>
      <div class="prog-row">
        <div class="prog-label"><span>Completion rate</span><span>${pct}%</span></div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%;background:var(--grn);"></div></div>
      </div>
      <div class="breakdown-grid" style="margin-top:16px;">
        <div class="bd-item"><div class="bd-name">Total posts</div><div class="bd-num" style="color:var(--acc);">${total}</div></div>
        <div class="bd-item"><div class="bd-name">Posted</div><div class="bd-num" style="color:var(--grn);">${posted}</div></div>
        <div class="bd-item"><div class="bd-name">Pending</div><div class="bd-num" style="color:var(--yel);">${total-posted}</div></div>
        <div class="bd-item"><div class="bd-name">Rate</div><div class="bd-num" style="color:var(--acc2);">${pct}%</div></div>
      </div>
    </div>
    <div class="a-card">
      <div class="a-title">Posts by type</div>
      <div style="position:relative;width:100%;height:200px;margin-bottom:14px;">
        <canvas id="type-chart" role="img" aria-label="Donut chart showing post count by type">
          Reel: ${byType.Reel}, Carousel: ${byType.Carousel}, Static: ${byType.Static},
          Story: ${byType.Story}, Collab: ${byType.Collab}
        </canvas>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;font-size:11px;color:var(--tx2);">
        ${Object.entries(byType).map(([t,n])=>`
          <span style="display:flex;align-items:center;gap:4px;">
            <span style="width:9px;height:9px;border-radius:2px;background:${typeColor(t)};flex-shrink:0;"></span>${t} ${n}
          </span>`).join('')}
      </div>
    </div>
    <div class="a-card">
      <div class="a-title">Posts by week</div>${weekRows}
    </div>
    <div class="a-card">
      <div class="a-title">All clients overview</div>
      <div class="breakdown-grid">
        ${db.clients.map(c=>{
          const cnt=Object.keys(db.posts).filter(k=>k.startsWith(c.id+'_')).reduce((s,k)=>s+(db.posts[k]||[]).length,0);
          return `<div class="bd-item"><div class="bd-name" style="color:${clientColor(c)};">${c.name}</div><div class="bd-num">${cnt}</div></div>`;
        }).join('')}
      </div>
    </div>
  </div>`;
}

/* ════ POST MODAL ═══════════════════════════════ */
function openDayModal(key,day){
  editingKey=key; editingIdx=null;
  const parts=key.replace(db.activeClient+'_','').split('-');
  const date=new Date(parseInt(parts[0]),parseInt(parts[1]),parseInt(parts[2]));
  const dateStr=date.toLocaleDateString('default',{weekday:'long',month:'long',day:'numeric'});
  document.getElementById('m-title').textContent=dateStr;
  document.getElementById('m-sub').textContent='Tap a post to edit · click a date cell to add';
  setDateInput(key);
  clearForm();
  document.getElementById('btn-del-post').style.display='none';
  document.getElementById('btn-dupe-post').style.display='none';
  document.getElementById('btn-save-post').textContent='Add Post';
  renderDayPosts(key);
  openOverlay('overlay-post');
}

function openAddModal(key){
  editingKey=key; editingIdx=null;
  document.getElementById('m-title').textContent='Add Post';
  document.getElementById('m-sub').textContent='Fill in the details below';
  if(key){ setDateInput(key); } else {
    const y=currentDate.getFullYear(), m=currentDate.getMonth(), d=new Date().getDate();
    const validD = Math.min(d, new Date(y, m+1, 0).getDate());
    document.getElementById('f-date').value=`${y}-${String(m+1).padStart(2,'0')}-${String(validD).padStart(2,'0')}`;
  }
  clearForm();
  document.getElementById('btn-del-post').style.display='none';
  document.getElementById('btn-dupe-post').style.display='none';
  document.getElementById('btn-save-post').textContent='Add Post';
  document.getElementById('day-posts-list').innerHTML='';
  openOverlay('overlay-post');
}

function openEditModal(key,idx){
  editingKey=key; editingIdx=idx;
  const p=(db.posts[key]||[])[idx];
  if(!p) return;
  document.getElementById('m-title').textContent='Edit Post';
  document.getElementById('m-sub').textContent='Update the details below';
  setDateInput(key);
  document.getElementById('f-title').value=p.title||'';
  document.getElementById('f-task').value=p.task||'';
  document.getElementById('f-type').value=p.type||'';
  document.getElementById('f-status').value=p.status||'Idea';
  document.getElementById('f-caption').value=p.caption||'';
  document.getElementById('f-hashtags').value=p.hashtags||'';
  document.getElementById('f-notes').value=p.notes||'';
  document.getElementById('btn-del-post').style.display='block';
  document.getElementById('btn-dupe-post').style.display='';
  document.getElementById('btn-save-post').textContent='Update Post';
  document.getElementById('day-posts-list').innerHTML='';
  openOverlay('overlay-post');
}

function duplicatePost(){
  const title   = document.getElementById('f-title').value;
  const task    = document.getElementById('f-task').value;
  const type    = document.getElementById('f-type').value;
  const status  = document.getElementById('f-status').value;
  const caption = document.getElementById('f-caption').value;
  const hashtags= document.getElementById('f-hashtags').value;
  const notes   = document.getElementById('f-notes').value;

  closePostModal();
  requestAnimationFrame(()=>{
    openAddModal(null);
    document.getElementById('f-title').value    = title + ' (copy)';
    document.getElementById('f-task').value     = task;
    document.getElementById('f-type').value     = type;
    document.getElementById('f-status').value   = status;
    document.getElementById('f-caption').value  = caption;
    document.getElementById('f-hashtags').value = hashtags;
    document.getElementById('f-notes').value    = notes;
    document.getElementById('m-sub').textContent = 'Pick a new date to save the duplicate';
    document.getElementById('f-date').value     = '';
    document.getElementById('f-date').focus();
  });
}

function setDateInput(key){
  const parts=key.replace(db.activeClient+'_','').split('-');
  const y=parseInt(parts[0]),m=parseInt(parts[1]),d=parseInt(parts[2]);
  document.getElementById('f-date').value=`${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function clearForm(){
  ['f-title','f-task','f-caption','f-hashtags','f-notes'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('f-type').value='';
  document.getElementById('f-status').value='Idea';
}

function renderDayPosts(key){
  const ps=db.posts[key]||[];
  const wrap=document.getElementById('day-posts-list');
  if(!ps.length){wrap.innerHTML='';return;}
  wrap.innerHTML=`<div style="font-size:10px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:7px;">Existing posts</div>`+
    ps.map((p,i)=>`<div class="dp-item">
      <div class="dp-dot" style="background:${typeColor(p.type)};"></div>
      <div class="dp-info">
        <div class="dp-name">${p.title||p.type||'Untitled'}</div>
        <div class="dp-meta">${p.type||'—'} · ${p.status||'Idea'}${p.task?' · '+p.task:''}</div>
      </div>
      <div class="dp-acts">
        <button class="t-btn" onclick="switchToEdit('${key}',${i})" title="Edit">✏</button>
        <button class="t-btn del" onclick="askDeleteSingle('${key}',${i})" title="Delete">✕</button>
      </div>
    </div>`).join('')+
    `<hr style="border:none;border-top:1px solid var(--bdr);margin:12px 0;">
     <div style="font-size:10px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;">Add new post</div>`;
}

function switchToEdit(key,idx){
  closePostModal();
  setTimeout(()=>openEditModal(key,idx),100);
}

function closePostModal(){ closeOverlay('overlay-post'); }

function savePost(){
  const dateVal=document.getElementById('f-date').value;
  const pillar=document.getElementById('f-type').value;
  if(!dateVal){showToast('Please set a date.');return;}

  // compute key from date input
  const d=new Date(dateVal+'T00:00:00');
  const newKey=postKeyFor(db.activeClient,d.getFullYear(),d.getMonth(),d.getDate());

  const postData={
    title:document.getElementById('f-title').value.trim(),
    task:document.getElementById('f-task').value.trim(),
    type:document.getElementById('f-type').value,
    status:document.getElementById('f-status').value,
    caption:document.getElementById('f-caption').value.trim(),
    hashtags:document.getElementById('f-hashtags').value.trim(),
    notes:document.getElementById('f-notes').value.trim(),
    created:Date.now(),
  };

  if(!db.posts[newKey]) db.posts[newKey]=[];

  if(editingIdx!==null && editingKey){
    // remove from old key
    if(editingKey===newKey){
      db.posts[newKey][editingIdx]=postData;
    } else {
      if(db.posts[editingKey]) db.posts[editingKey].splice(editingIdx,1);
      db.posts[newKey].push(postData);
    }
  } else {
    db.posts[newKey].push(postData);
  }

  saveDB(); closePostModal(); renderAll();
  showToast(editingIdx!==null?'Post updated!':'Post added!');
}

function askDeleteSingle(key,idx){
  showConfirm('Delete this post?','This post will be removed permanently.',()=>{
    if(db.posts[key]){
      db.posts[key].splice(idx,1);
      if(!db.posts[key].length) delete db.posts[key];
      saveDB(); closePostModal(); renderAll();
      showToast('Post deleted.');
    }
  });
}
function confirmDeletePost(){
  askDeleteSingle(editingKey,editingIdx);
}

/* ════ DOWNLOAD ════════════════════════════════ */
function downloadCSV(){
  const rows=[['Date','Day','Client','Title','Task','Type','Caption','Hashtags','Status','Notes']];
  Object.entries(db.posts).forEach(([key,arr])=>{
    if(!key.startsWith(db.activeClient+'_')) return;
    const ds=key.replace(db.activeClient+'_','').split('-');
    const date=new Date(parseInt(ds[0]),parseInt(ds[1]),parseInt(ds[2]));
    const dateStr=date.toLocaleDateString('default',{year:'numeric',month:'2-digit',day:'2-digit'});
    const dayStr=date.toLocaleDateString('default',{weekday:'long'});
    arr.forEach(p=>{
      rows.push([dateStr,dayStr,activeClientObj().name,
        p.title,p.task,p.type,
        p.caption||'',
        p.hashtags||'',
        p.status,
        p.notes||'']);
    });
  });
  const csv=rows.map(r=>r.map(c=>`"${(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  triggerDownload(csv,'text/csv',`nazrithm-${activeClientObj().name}-${currentDate.getFullYear()}-${currentDate.getMonth()+1}.csv`);
}

function downloadJSON(){
  const data={client:activeClientObj().name,exported:new Date().toISOString(),posts:{}};
  Object.entries(db.posts).forEach(([key,arr])=>{
    if(key.startsWith(db.activeClient+'_')) data.posts[key.replace(db.activeClient+'_','')]=arr;
  });
  triggerDownload(JSON.stringify(data,null,2),'application/json',`nazrithm-${activeClientObj().name}.json`);
}

function triggerDownload(content,type,filename){
  const blob=new Blob([content],{type});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=filename; a.click();
}

/* ════ CONFIRM MODAL ════════════════════════════ */
function showConfirm(title,msg,cb){
  confirmCb=cb;
  document.getElementById('confirm-ttl').textContent=title;
  document.getElementById('confirm-msg').textContent=msg;
  openOverlay('overlay-confirm');
}
function closeConfirm(){ closeOverlay('overlay-confirm'); confirmCb=null; }
function runConfirm(){ if(confirmCb){confirmCb();} closeConfirm(); }

/* ════ OVERLAY HELPERS ══════════════════════════ */
function openOverlay(id){ document.getElementById(id).classList.add('open'); }
function closeOverlay(id){ document.getElementById(id).classList.remove('open'); }

/* ════ TOAST ════════════════════════════════════ */
function showToast(msg){
  let t=document.getElementById('toast');
  if(!t){
    t=document.createElement('div');t.id='toast';
    t.style.cssText='position:fixed;bottom:24px;right:24px;background:var(--sur3);color:var(--tx);'+
      'padding:10px 18px;border-radius:10px;font-size:13px;z-index:999;border:1px solid var(--bdr2);'+
      'transition:opacity .3s;box-shadow:0 4px 20px rgba(0,0,0,.3);font-family:var(--font);';
    document.body.appendChild(t);
  }
  t.textContent=msg; t.style.opacity='1';
  clearTimeout(t._to);
  t._to=setTimeout(()=>t.style.opacity='0',2200);
}

/* ════ SIDEBAR ══════════════════════════════════ */
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sb-overlay').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sb-overlay').classList.remove('open');
}

/* ════ START ════════════════════════════════════ */
init();