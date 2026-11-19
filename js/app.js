/* Pocket Shelf - Personal Library Management System
   Auth guard, data store, lending rules, theme, hash routing (with filters), linked charts */
if(!sessionStorage.getItem('lms_user')) location.href='index.html';
document.getElementById('who').textContent=sessionStorage.getItem('lms_user');
document.getElementById('out').onclick=()=>{sessionStorage.removeItem('lms_user');location.href='index.html'};

// ---- Date helpers & rules ----
const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const plus=(s,n)=>{const x=s?new Date(s+'T00:00:00'):new Date();x.setDate(x.getDate()+n);return iso(x)};
const today=plus(null,0),LOAN_DAYS=14;
const daysTo=s=>Math.round((new Date(s)-new Date(today))/864e5);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const GENRES=['Mystery','Romance','Fantasy','Sci-Fi','Drama','Historical','Thriller','Non-Fiction'],READ=['Unread','Reading','Finished'],REL=['Friend','Family','Colleague','Neighbour'];

// ---- Pastel colours: one colour per genre / status (charts, badges, shelves) ----
const PAL=['#F58FAE','#7DB9F2','#FFD36B','#88D498','#B79CED','#FFA987','#5FCDC4','#C9A66B'];
const GCOL={Mystery:'#B79CED',Romance:'#F58FAE',Fantasy:'#7DB9F2','Sci-Fi':'#5FCDC4',Drama:'#FFA987',Historical:'#FFD36B',Thriller:'#C9A66B','Non-Fiction':'#88D498'};
const SCOL={Borrowed:'#FFD36B',Overdue:'#FF8A8A',Returned:'#88D498','On Shelf':'#7DB9F2'},RCOL={Unread:'#B79CED',Reading:'#7DB9F2',Finished:'#88D498'};
const gb=(g,txt)=>`<span class="badge genre-badge" style="background:${GCOL[g]||'#ddd'}">${txt||g}</span>`;

// ---- Data store (browser localStorage: survives refresh) ----
function seed(){
 const books=[['B001','Laskar Pelangi','Andrea Hirata','Drama','A1','Finished'],['B002','Salina','A. Samad Said','Historical','A2','Finished'],['B003','Hujan','Tere Liye','Romance','A3','Reading'],['B004',"Harry Potter and the Philosopher's Stone",'J.K. Rowling','Fantasy','B1','Finished'],['B005','The Hobbit','J.R.R. Tolkien','Fantasy','B2','Finished'],['B006','Pride and Prejudice','Jane Austen','Romance','B3','Unread'],['B007','1984','George Orwell','Sci-Fi','C1','Finished'],['B008','The Da Vinci Code','Dan Brown','Mystery','C2','Finished'],['B009','And Then There Were None','Agatha Christie','Mystery','C3','Unread'],['B010','Dune','Frank Herbert','Sci-Fi','D1','Reading'],['B011','Ayat-Ayat Cinta','Habiburrahman El Shirazy','Romance','D2','Finished'],['B012','To Kill a Mockingbird','Harper Lee','Drama','D3','Unread']].map(b=>({id:b[0],title:b[1],author:b[2],genre:b[3],shelf:b[4],read:b[5]}));
 const people=[['P001','Aisyah Rahman','Friend','012-3456789'],['P002','Daniel Lim','Colleague','011-2233445'],['P003','Nurul Huda','Family','013-5566778'],['P004','Farid Hakim','Friend','017-8899001'],['P005','Siti Mariam','Neighbour','019-1122334'],['P006','Kevin Tan','Colleague','016-4455667']].map(p=>({id:p[0],name:p[1],rel:p[2],phone:p[3]}));
 // [book, borrower, day lent (offset from today), day returned (offset or null)]
 const S=[['B004','P001',-20,null],['B005','P002',-8,null],['B007','P003',-25,-14],['B008','P004',-5,null],['B010','P005',-30,null],['B003','P006',-3,null],['B001','P001',-60,-50],['B009','P002',-45,-33],['B006','P003',-75,-65],['B002','P004',-95,-85],['B004','P005',-120,-110],['B011','P006',-135,-125],['B008','P001',-100,-90],['B012','P002',-80,-70],['B005','P003',-150,-140]];
 const loans=S.map((s,i)=>{const lent=plus(null,s[2]);return{id:'L'+String(i+1).padStart(3,'0'),bid:s[0],pid:s[1],lent,due:plus(lent,LOAN_DAYS),ret:s[3]===null?null:plus(null,s[3])}});
 return{books,people,loans};
}
const KEY='myshelf_data_v3';
let DB=JSON.parse(localStorage.getItem(KEY)||'null')||seed();
const save=()=>localStorage.setItem(KEY,JSON.stringify(DB));
const B=id=>DB.books.find(b=>b.id===id)||{title:'(removed book)'};
const P_=id=>DB.people.find(p=>p.id===id)||{name:'(removed person)'};
const nid=(arr,p)=>p+String(Math.max(0,...arr.map(x=>+x.id.slice(1)))+1).padStart(3,'0');
// Status is automatic: Returned / Overdue (past due date, not returned) / Borrowed
const status=l=>l.ret?'Returned':(l.due<today?'Overdue':'Borrowed');
const cur=bid=>DB.loans.find(l=>l.bid===bid&&!l.ret);          // current loan of a book (if any)
const held=pid=>DB.loans.filter(l=>l.pid===pid&&!l.ret);        // books a person still holds
const COL={'Borrowed':'warning','Overdue':'danger','Returned':'success','On Shelf':'info'};
const badge=l=>{const s=status(l),d=daysTo(l.due);
 const txt=s==='Overdue'?` &middot; ${-d} day${d===-1?'':'s'} late`:s==='Borrowed'?(d===0?' &middot; due today':` &middot; due in ${d} days`):'';
 return`<span class="badge badge-s text-bg-${COL[s]}">${s}${txt}</span>`};

// ---- Theme (light/dark) ----
const root=document.documentElement,tbtn=document.getElementById('theme');
function applyTheme(t){root.setAttribute('data-bs-theme',t);localStorage.setItem('lms_theme',t);
 tbtn.innerHTML=t==='dark'?'<i class="bi bi-sun-fill"></i>':'<i class="bi bi-moon-stars-fill"></i>'}
tbtn.onclick=()=>{applyTheme(root.getAttribute('data-bs-theme')==='dark'?'light':'dark');route()};
applyTheme(localStorage.getItem('lms_theme')||'light');

// ---- UI helpers ----
document.body.insertAdjacentHTML('beforeend','<div id="toasts" class="toast-container position-fixed top-0 end-0 p-3" style="z-index:2000"></div>');
function toast(msg,type='success'){const d=document.createElement('div');d.className=`toast align-items-center border-0 text-bg-${type}`;
 d.innerHTML=`<div class="d-flex"><div class="toast-body">${msg}</div><button class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
 toasts.appendChild(d);new bootstrap.Toast(d,{delay:3500}).show();d.addEventListener('hidden.bs.toast',()=>d.remove())}
const head=(t,sub,btn='',img='dark-library.jpg')=>`<div class="banner mb-3" style="--bn:url(images/${img})"><div><h1 class="page-title">${t}</h1><p class="mb-0">${sub}</p></div><div class="d-flex gap-2 head-actions">${btn}</div></div>`;
const hero=()=>`<div class="banner hero mb-3"><div><img src="images/logo.svg" alt="" class="hero-logo"><h1 class="page-title">Welcome to Pocket Shelf</h1><p class="mb-0">Your cosy little library, all in one place. Click a card or chart to see more.</p></div><div class="head-actions">${btn('resetData','Reset demo data','arrow-counterclockwise','btn-outline-secondary')}</div></div>`;
const btn=(id,txt,ic='plus-lg',cls='btn-primary')=>`<button id="${id}" class="btn ${cls}"><i class="bi bi-${ic} me-1"></i>${txt}</button>`;
const table=(cols,rows)=>`<div class="card"><div class="table-responsive"><table class="table table-hover align-middle mb-0"><thead><tr>${cols.map(c=>c==='Action'||c==='Dates'?`<th>${c}</th>`:`<th data-sort title="Click to sort">${c}</th>`).join('')}</tr></thead><tbody>${rows||`<tr><td colspan="${cols.length}" class="text-center py-4">No records found</td></tr>`}</tbody></table></div></div>`;
const sel=(id,all,opts)=>`<div class="col-6 col-md"><select id="${id}" class="form-select"><option value="">${all}</option>${opts.map(o=>`<option>${o}</option>`).join('')}</select></div>`;
const bar=(extra='')=>`<div class="row g-2 mb-3"><div class="col-12 col-md-4"><input id="q" class="form-control" placeholder="Search..."></div>${extra}</div><div id="t"></div>`;

// ---- Charts (click a chart to open the related page, already filtered) ----
let charts=[];
function mk(id,type,labels,data,label,extra={},link,colors){
 const dark=root.getAttribute('data-bs-theme')==='dark';
 Chart.defaults.color=dark?'#ced4da':'#495057';Chart.defaults.font.family="'Nunito',system-ui,sans-serif";Chart.defaults.font.size=13;Chart.defaults.borderColor=dark?'#343a40':'#dee2e6';
 charts.push(new Chart(document.getElementById(id),{type,data:{labels,datasets:[{label,data,backgroundColor:type==='line'?'rgba(245,143,174,.28)':(colors||PAL),borderColor:type==='line'?'#E0568A':(dark?'#212529':'#fff'),fill:true,tension:.35,borderWidth:type==='bar'?0:3,borderRadius:type==='bar'?8:0,hoverOffset:14,pointRadius:5,pointHoverRadius:9,pointBackgroundColor:PAL,pointBorderColor:'#fff'}]},
 options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:['doughnut','pie'].includes(type),position:'bottom',labels:{usePointStyle:true,pointStyle:'circle',padding:14}},tooltip:{padding:10,titleFont:{size:13},bodyFont:{size:13}}},
  onClick:(e,els)=>{if(link)location.hash=link(els.length?labels[els[0].index]:'')},
  onHover:(e,els)=>{e.native.target.style.cursor=link?'pointer':'default'},...extra}}));
}
const count=(arr,f,init={})=>arr.reduce((a,x)=>{const k=f(x);a[k]=(a[k]||0)+1;return a},init);
const yInt={y:{beginAtZero:true,ticks:{stepSize:1}}},enc=encodeURIComponent;

// ---- Views ----
// Every genre has its own shelf: Shelf A = Mystery, B = Romance, ...
const SHELF={Mystery:'A',Romance:'B',Fantasy:'C','Sci-Fi':'D',Drama:'E',Historical:'F',Thriller:'G','Non-Fiction':'H'};
const byShelf=(a,b)=>(SHELF[a.genre]||'Z').localeCompare(SHELF[b.genre]||'Z')||DB.books.indexOf(a)-DB.books.indexOf(b);
const shelfOf=b=>`Shelf ${SHELF[b.genre]||'?'}, No.${DB.books.filter(x=>x.genre===b.genre).findIndex(x=>x.id===b.id)+1}`;
const shelvesHtml=()=>`<div class="row g-3 mb-3">${GENRES.map(g=>{const n=DB.books.filter(b=>b.genre===g),o=n.filter(b=>cur(b.id)).length;
 return`<div class="col-6 col-lg-3"><a href="#books?genre=${enc(g)}" class="card linkable shelf-card p-3 h-100 text-reset text-decoration-none" style="border-left-color:${GCOL[g]}"><div class="small text-body-secondary">Shelf ${SHELF[g]}</div><div class="fw-semibold">${g}</div><div class="small">${n.length} book${n.length===1?'':'s'}${o?` &middot; ${o} borrowed`:''}</div></a></div>`}).join('')}</div>`;
const fd=s=>new Date(s+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});
const menu=items=>`<div class="dropdown"><button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" data-bs-boundary="viewport" data-bs-popper-config='{"strategy":"fixed"}' aria-label="More actions"><i class="bi bi-three-dots-vertical"></i></button><ul class="dropdown-menu dropdown-menu-end">${items.join('')}</ul></div>`;
const mi=(attr,ic,txt,cls='')=>`<li><button class="dropdown-item ${cls}" ${attr}><i class="bi bi-${ic} me-2"></i>${txt}</button></li>`;
const matchL=(l,v)=>v==='Not returned'?!l.ret:v==='Due soon'?(!l.ret&&daysTo(l.due)>=0&&daysTo(l.due)<=3):status(l)===v;
let P=new URLSearchParams();   // filters from the link, e.g. #books?genre=Fantasy
const views={
 dashboard(){
  const L=DB.loans,act=L.filter(l=>!l.ret).sort((a,b)=>a.due.localeCompare(b.due)),od=act.filter(l=>status(l)==='Overdue');
  const stat=(i,t,v,h)=>`<div class="col-6 col-xl-3"><a href="${h}" class="card linkable p-3 h-100 text-reset text-decoration-none"><div class="d-flex align-items-center gap-3"><div class="stat-icon"><i class="bi ${i}"></i></div><div><div class="text-body-secondary small">${t}</div><div class="fs-4 fw-bold">${v}</div></div></div></a></div>`;
  const box=(id,t,h)=>`<div class="col-12 col-lg-6"><div class="card chart-card p-3 h-100"><h2 class="section-title">${t}</h2><p class="hint">${h}</p><div class="chart-box"><canvas id="${id}"></canvas></div></div></div>`;
  const rows=act.map(l=>`<tr><td>${esc(P_(l.pid).name)}</td><td>${esc(B(l.bid).title)}</td><td>${badge(l)}</td></tr>`).join('');
  const soon=act.filter(l=>daysTo(l.due)>=0&&daysTo(l.due)<=3);
  const alertHtml=od.length?`<a href="#loans?status=Overdue" class="alert alert-danger d-flex align-items-center gap-2 text-decoration-none"><i class="bi bi-exclamation-triangle-fill"></i>${od.length} book${od.length>1?'s are':' is'} overdue${soon.length?` and ${soon.length} due within 3 days`:''}. Click to see who has them.</a>`
   :soon.length?`<a href="#loans?status=Due%20soon" class="alert alert-warning d-flex align-items-center gap-2 text-decoration-none"><i class="bi bi-clock-fill"></i>${soon.length} book${soon.length>1?'s are':' is'} due within 3 days. Click to see.</a>`
   :`<div class="alert alert-success d-flex align-items-center gap-2"><i class="bi bi-check-circle-fill"></i>All good. Nothing is late.</div>`;
  const where=[...DB.books].sort(byShelf).map(b=>{const l=cur(b.id);return`<tr><td><a class="fw-semibold" href="#books?q=${enc(b.title)}">${esc(b.title)}</a><div class="small text-body-secondary">${esc(b.author)}</div></td><td>${gb(b.genre,'Shelf '+SHELF[b.genre]+' - '+b.genre)}</td><td>${l?`${badge(l)}<div class="small mt-1">Location: with ${esc(P_(l.pid).name)}</div>`:`<span class="badge badge-s text-bg-info">On Shelf</span><div class="small mt-1">Location: ${shelfOf(b)}</div>`}</td></tr>`}).join('');
  const whereCard=`<div class="card p-3"><h2 class="section-title">Where are my books?</h2><p class="hint">Every book sorted by shelf, with its status and where it is right now.</p><div class="list-box tall"><table class="table table-sm mb-0"><thead><tr><th>Book</th><th>Shelf</th><th>Status &amp; Location</th></tr></thead><tbody>${where}</tbody></table></div></div>`;
  view.innerHTML=hero()+
  alertHtml+`<div class="card p-3 mb-3"><h2 class="section-title">Getting started</h2><p class="hint">Three easy steps to use your library.</p><div class="row g-3"><div class="col-12 col-md-4 step"><p class="mb-2"><span class="step-no">1</span>Add your books</p>${btn('addBook','Add Book','journal-plus')}</div><div class="col-12 col-md-4 step"><p class="mb-2"><span class="step-no">2</span>Lend a book to someone</p>${btn('addLoan','Lend a Book','box-arrow-up-right')}</div><div class="col-12 col-md-4 step"><p class="mb-2"><span class="step-no">3</span>Press Return when it comes back</p><a class="btn btn-primary" href="#loans?status=Not%20returned"><i class="bi bi-check2-circle me-1"></i>Return a Book</a></div></div></div>
  <div class="row g-3 mb-3">${stat('bi-journal-bookmark','Books I Own',DB.books.length,'#books')}${stat('bi-people','Borrowers',DB.people.length,'#borrowers')}${stat('bi-box-arrow-up-right','Currently Borrowed',act.length,'#loans?status=Not%20returned')}${stat('bi-exclamation-triangle','Overdue',od.length,'#loans?status=Overdue')}</div>
  <div class="row g-3">${box('c1','Books Borrowed per Month','How many books you borrowed each month.')}${box('c2','My Books by Genre','Number of books on each shelf. Click a slice.')}${box('c3','Borrowing Status','Borrowed, overdue (late) and returned. Click a bar.')}${box('c4','Reading Progress','Which of your books you have read. Click a slice.')}${box('c5','Top Borrowers','Who borrows the most. Click a bar.')}
  <div class="col-12 col-lg-6"><div class="card chart-card p-3 h-100"><h2 class="section-title">Books Not Returned Yet</h2><p class="hint">Everyone who still has one of your books.</p><div class="list-box">${act.length?`<table class="table table-sm mb-0"><thead><tr><th>Borrower</th><th>Book</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`:'<p class="text-body-secondary mb-0">All books are back on your shelf.</p>'}</div></div></div><div class="col-12">${whereCard}</div></div>`;
  // months shown: last 6 months, extended back to the earliest loan so old loans (e.g. May) always appear
  const e=L.map(l=>l.lent).sort()[0],st=new Date();st.setDate(1);st.setMonth(st.getMonth()-5);
  if(e&&new Date(e+'T00:00:00')<st)st.setTime(new Date(e.slice(0,7)+'-01T00:00:00').getTime());
  const ms=[],mm=new Date(st);while(iso(mm).slice(0,7)<=today.slice(0,7)&&ms.length<24){ms.push(new Date(mm));mm.setMonth(mm.getMonth()+1)}
  mk('c1','line',ms.map(x=>x.toLocaleString('en',{month:'short',year:'2-digit'})),ms.map(x=>L.filter(l=>l.lent.slice(0,7)===iso(x).slice(0,7)).length),'Books lent',{scales:yInt},()=>'#loans');
  const g=count(DB.books,b=>b.genre,Object.fromEntries(GENRES.map(x=>[x,0])));mk('c2','doughnut',Object.keys(g),Object.values(g),'Books',{},v=>'#books?genre='+enc(v),Object.keys(g).map(k=>GCOL[k]));
  const ls=count(L,status,{'Borrowed':0,'Overdue':0,'Returned':0});mk('c3','bar',Object.keys(ls),Object.values(ls),'Loans',{scales:yInt},v=>'#loans?status='+enc(v),Object.keys(ls).map(k=>SCOL[k]));
  const rd=count(DB.books,b=>b.read,{Unread:0,Reading:0,Finished:0});mk('c4','pie',Object.keys(rd),Object.values(rd),'Books',{},v=>'#books?read='+enc(v),Object.keys(rd).map(k=>RCOL[k]));
  const top=Object.entries(count(L,l=>l.pid)).sort((a,b)=>b[1]-a[1]).slice(0,5);
  mk('c5','bar',top.map(x=>P_(x[0]).name),top.map(x=>x[1]),'Books borrowed',{indexAxis:'y',scales:{x:{beginAtZero:true,ticks:{stepSize:1}}}},v=>'#loans?q='+enc(v));
 },
 books(){
  const on=DB.books.filter(b=>!cur(b.id)).length;
  view.innerHTML=head('My Books',`Each genre has its own shelf. ${on} of ${DB.books.length} books are on the shelf now.`,btn('exportBooks','Export CSV','download','btn-outline-secondary')+btn('addBook','Add Book'))+shelvesHtml()+
   bar(sel('f','All genres',GENRES)+sel('s','All availability',['On Shelf','Borrowed','Overdue'])+sel('r','All reading status',READ));
  const q_=document.getElementById('q'),f_=document.getElementById('f'),s_=document.getElementById('s'),r_=document.getElementById('r');
  q_.value=P.get('q')||'';f_.value=P.get('genre')||'';s_.value=P.get('status')||'';r_.value=P.get('read')||'';
  const draw=()=>{t.innerHTML=table(['Book Details','Status & Location','Reading Status','Action'],[...DB.books].sort(byShelf).filter(b=>{const l=cur(b.id),st=l?status(l):'On Shelf';
   return(b.title+b.author).toLowerCase().includes(q_.value.toLowerCase())&&(!f_.value||b.genre===f_.value)&&(!s_.value||st===s_.value)&&(!r_.value||b.read===r_.value)}).map(b=>{const l=cur(b.id);
   return`<tr><td><div class="fw-semibold">${esc(b.title)}</div>${b.rating?`<div class="small" style="color:#d4a017">${'★'.repeat(b.rating)}${'☆'.repeat(5-b.rating)}</div>`:''}<div class="small text-body-secondary">${esc(b.author)} &middot; ${gb(b.genre)} &middot; ${b.id}</div></td>
   <td>${l?`${badge(l)}<div class="small mt-1">with <a href="#borrowers?q=${enc(P_(l.pid).name)}">${esc(P_(l.pid).name)}</a></div>`:`<span class="badge badge-s text-bg-info">On Shelf &middot; ${shelfOf(b)}</span>`}</td>
   <td><select class="form-select form-select-sm reading-select" data-read="${b.id}">${READ.map(x=>`<option${x===b.read?' selected':''}>${x}</option>`).join('')}</select></td>
   <td><div class="actions">${l?`<button class="btn btn-sm btn-primary" data-ret="${l.id}">Return</button>`:`<button class="btn btn-sm btn-primary" data-lend="${b.id}">Lend</button>`}${menu([mi(`data-edit-book="${b.id}"`,'pencil','Edit'),...(l?[]:[mi(`data-del="books" data-id="${b.id}"`,'trash','Delete','text-danger')])])}</div></td></tr>`}).join(''))};
  q_.oninput=f_.onchange=s_.onchange=r_.onchange=draw;draw();
 },
 shelves(){
  view.innerHTML=head('Shelves','Your books standing on their shelves, one shelf for each genre. Click a book to see its details.',btn('addBook','Add Book'),'autumn-library.jpg')+
  `<div class="card p-3 mb-3 small d-flex flex-row flex-wrap gap-4 align-items-center"><span><span class="spine-key"></span>On the shelf</span><span><span class="spine-key ghost"></span>Borrowed (out with a friend)</span></div>`+
  GENRES.map(g=>{const bs=DB.books.filter(b=>b.genre===g);
   return`<section class="card mb-3 p-3"><div class="d-flex justify-content-between align-items-center mb-2"><h2 class="section-title m-0">${gb(g,'Shelf '+SHELF[g]+' - '+g)}</h2><a class="small" href="#books?genre=${enc(g)}">${bs.length} book${bs.length===1?'':'s'}</a></div><div class="spines">${bs.length?bs.map((b,i)=>{const l=cur(b.id);return`<a href="#books?q=${enc(b.title)}" class="spine${l?' out':''}" style="--c:${GCOL[g]};--h:${118+(i*17)%5*12}px" title="${esc(b.title)} by ${esc(b.author)}${l?' (with '+esc(P_(l.pid).name)+')':''}"><span>${esc(b.title)}</span></a>`}).join(''):'<span class="small text-body-secondary align-self-center">This shelf is empty. Add a book to fill it.</span>'}</div><div class="plank"></div></section>`}).join('');
 },
 borrowers(){
  view.innerHTML=head('Borrowers','People who borrow my books. Click a name to see everything they borrowed.',btn('exportPeople','Export CSV','download','btn-outline-secondary')+btn('addPerson','Add Borrower'))+bar();
  const q_=document.getElementById('q');q_.value=P.get('q')||'';
  const draw=()=>{t.innerHTML=table(['Borrower Info','Current Loan','History','Action'],DB.people.filter(p=>p.name.toLowerCase().includes(q_.value.toLowerCase())).map(p=>{
   const h=held(p.id),o=h.some(l=>status(l)==='Overdue'),n=DB.loans.filter(l=>l.pid===p.id).length;
   const st=o?['danger','Has overdue book']:h.length?['warning',`Holding ${h.length} book${h.length>1?'s':''}`]:n?['success','All returned']:['secondary','No loans yet'];
   return`<tr><td><button class="btn btn-link p-0 fw-semibold text-start" data-hist="${p.id}">${esc(p.name)}</button> <span class="small text-body-secondary">${p.id}</span><div class="small text-body-secondary"><span class="text-nowrap">${esc(p.phone||'No phone')}</span> &middot; <span class="badge text-bg-secondary">${p.rel}</span></div></td>
   <td><span class="badge badge-s text-bg-${st[0]}">${st[1]}</span>${h.map(l=>`<div class="small mt-1">${esc(B(l.bid).title)} <span class="text-body-secondary">(due ${fd(l.due)})</span></div>`).join('')}</td>
   <td><button class="btn btn-sm btn-outline-primary" data-hist="${p.id}">${n} book${n===1?'':'s'}</button></td>
   <td>${menu([mi(`data-edit-person="${p.id}"`,'pencil','Edit'),mi(`data-del="people" data-id="${p.id}"`,'trash','Delete','text-danger')])}</td></tr>`}).join(''))};
  q_.oninput=draw;draw();
 },
 loans(){
  const c=s=>DB.loans.filter(l=>status(l)===s).length;
  const tabs=[['','All'],['Not returned','Active'],['Due soon','Due soon'],['Overdue','Overdue'],['Returned','Returned']];
  let tab=P.get('status')||'';
  const tabHtml=()=>`<ul class="nav nav-pills tabs-scroll gap-1 mb-3">${tabs.map(([v,l])=>`<li class="nav-item"><button class="nav-link${v===tab?' active':''}" data-tab="${v}">${l} <span class="badge text-bg-light ms-1">${DB.loans.filter(x=>!v||matchL(x,v)).length}</span></button></li>`).join('')}</ul>`;
  view.innerHTML=head('Lending','Write down who borrowed which book and when it must come back.',btn('exportLoans','Export CSV','download','btn-outline-secondary')+btn('addLoan','Lend a Book'))+
  `<div class="card p-3 mb-3 small"><strong class="mb-2">Status guide</strong><div class="guide"><span class="badge badge-s text-bg-warning">Borrowed</span><span>${c('Borrowed')} &ndash; book is with the borrower, not yet due</span><span class="badge badge-s text-bg-danger">Overdue</span><span>${c('Overdue')} &ndash; due date passed, not returned</span><span class="badge badge-s text-bg-success">Returned</span><span>${c('Returned')} &ndash; book is back on the shelf</span></div></div><div id="tabs">${tabHtml()}</div>`+bar();
  const q_=document.getElementById('q'),tb=document.getElementById('tabs');q_.value=P.get('q')||'';
  const draw=()=>{t.innerHTML=table(['Loan Details','Dates','Status','Action'],[...DB.loans].reverse().filter(l=>(B(l.bid).title+P_(l.pid).name).toLowerCase().includes(q_.value.toLowerCase())&&(!tab||matchL(l,tab))).map(l=>
   `<tr><td><a class="fw-semibold" href="#books?q=${enc(B(l.bid).title)}">${esc(B(l.bid).title)}</a><div class="small text-body-secondary">By <a href="#borrowers?q=${enc(P_(l.pid).name)}">${esc(P_(l.pid).name)}</a> &middot; #${l.id}</div></td>
   <td class="text-nowrap"><div>Borrowed: ${fd(l.lent)}</div><div>${l.ret?`Returned: ${fd(l.ret)}`:`Due: ${fd(l.due)}`}</div></td>
   <td>${badge(l)}</td>
   <td>${l.ret?'':`<div class="actions"><button class="btn btn-sm btn-primary" data-ret="${l.id}">Mark Returned</button><button class="btn btn-sm btn-outline-primary" data-renew="${l.id}">+7 days</button></div>`}</td></tr>`).join(''))};
  tb.onclick=e=>{const b=e.target.closest('[data-tab]');if(b){tab=b.dataset.tab;tb.innerHTML=tabHtml();draw()}};
  q_.oninput=draw;draw();
 }
};

// ---- Shared modal: form (onSave returns error text to keep it open) and info view ----
function showModal(){bootstrap.Modal.getOrCreateInstance(modal).show()}
function openForm(title,fields,onSave){
 mTitle.textContent=title;mSave.textContent='Save';mCancel.classList.remove('d-none');
 mBody.innerHTML=fields.map(f=>`<label class="form-label">${f.l}</label>`+(f.opts
  ?`<select class="form-select mb-3" name="${f.n}">${f.opts.map(o=>{const[v,l]=Array.isArray(o)?o:[o,o];return`<option value="${v}"${v===f.sel?' selected':''}>${l}</option>`}).join('')}</select>`
  :`<input class="form-control mb-3" name="${f.n}" type="${f.t||'text'}" value="${esc(f.v||'')}" ${f.min?`min="${f.min}"`:''} ${f.max?`max="${f.max}"`:''} ${f.t==='number'?'max="999"':''} ${f.opt?'':'required'}>`)).join('');
 mForm.onsubmit=e=>{e.preventDefault();if(!mForm.checkValidity()){mForm.reportValidity();return}
  const err=onSave(Object.fromEntries(new FormData(mForm)));if(err){toast(err,'danger');return}
  save();bootstrap.Modal.getInstance(modal).hide();route()};
 showModal();
}
function openInfo(title,html){mTitle.textContent=title;mBody.innerHTML=html;mSave.textContent='Close';mCancel.classList.add('d-none');
 mForm.onsubmit=e=>{e.preventDefault();bootstrap.Modal.getInstance(modal).hide()};showModal()}
function lendForm(pre){
 const av=DB.books.filter(b=>!cur(b.id));
 if(!av.length||!DB.people.length) return toast('You need at least one book on the shelf and one borrower.','warning');
 openForm('Lend a Book',[{n:'bid',l:'Book (only books on my shelf)',opts:av.map(b=>[b.id,`${esc(b.title)} (${shelfOf(b)})`]),sel:pre},{n:'pid',l:'Borrower',opts:DB.people.map(p=>[p.id,esc(p.name)])},{n:'lent',l:'Date lent',t:'date',v:today,max:today},{n:'due',l:'Return by (auto = 14 days, you can change it)',t:'date',v:plus(today,LOAN_DAYS),min:'2000-01-01'}],d=>{
  if(d.due<d.lent) return 'Return-by date cannot be before the date lent.';
  DB.loans.push({id:nid(DB.loans,'L'),bid:d.bid,pid:d.pid,lent:d.lent,due:d.due,ret:null});
  held(d.pid).some(l=>status(l)==='Overdue')?toast(`Lent, but ${esc(P_(d.pid).name)} still has an overdue book.`,'warning'):toast('Book lent. Return by '+d.due)});
 mBody.querySelector('[name=lent]').onchange=e=>{if(e.target.value)mBody.querySelector('[name=due]').value=plus(e.target.value,LOAN_DAYS)};
}

// ---- CSV export + click-to-sort ----
function csv(name,rows){const t=rows.map(r=>r.map(v=>`"${String(v??'').replace(/"/g,'""')}"`).join(',')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+t],{type:'text/csv'}));a.download=name+'.csv';a.click();
 setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Exported '+name+'.csv')}
document.addEventListener('click',e=>{const th=e.target.closest('th[data-sort]');if(!th)return;
 const tb=th.closest('table'),i=[...th.parentNode.children].indexOf(th),asc=th.dataset.dir!=='asc';
 tb.querySelectorAll('th').forEach(x=>{delete x.dataset.dir;x.classList.remove('sorted-asc','sorted-desc')});
 th.dataset.dir=asc?'asc':'desc';th.classList.add(asc?'sorted-asc':'sorted-desc');
 const v=r=>{const c=r.children[i];return c?(c.querySelector('select')?.value||c.textContent).trim():''};
 [...tb.tBodies[0].rows].sort((a,b)=>v(a).localeCompare(v(b),undefined,{numeric:true})*(asc?1:-1)).forEach(r=>tb.tBodies[0].appendChild(r))});

// ---- Actions ----
document.addEventListener('click',e=>{
 const c=s=>e.target.closest(s);
 if(c('#addBook')) openForm('Add a Book to My Library',[{n:'title',l:'Title'},{n:'author',l:'Author'},{n:'genre',l:'Genre (the genre decides the shelf)',opts:GENRES.map(g=>[g,`${g} - Shelf ${SHELF[g]}`])}],
  d=>{DB.books.push({id:nid(DB.books,'B'),title:d.title.trim(),author:d.author.trim(),genre:d.genre,read:'Unread'});toast('Book added to your shelf')});
 if(c('#addPerson')) openForm('Add a Borrower',[{n:'name',l:'Full name'},{n:'rel',l:'Relation',opts:REL},{n:'phone',l:'Phone (optional)',t:'tel',opt:1}],
  d=>{DB.people.push({id:nid(DB.people,'P'),name:d.name.trim(),rel:d.rel,phone:d.phone.trim()});toast('Borrower added')});
 if(c('#addLoan')) lendForm();
 const ln=c('[data-lend]');if(ln) lendForm(ln.dataset.lend);
 const r=c('[data-ret]');
 if(r){const l=DB.loans.find(x=>x.id===r.dataset.ret);
  openForm('Mark as Returned: '+B(l.bid).title,[{n:'ret',l:'Date returned',t:'date',v:today,min:l.lent,max:today}],d=>{l.ret=d.ret;toast('Book returned to the shelf')})}
 const rn=c('[data-renew]');
 if(rn){const l=DB.loans.find(x=>x.id===rn.dataset.renew);l.due=plus(l.due,7);save();route();toast('Due date extended by 7 days. New due date: '+l.due)}
 const eb=c('[data-edit-book]');
 if(eb){const b=DB.books.find(x=>x.id===eb.dataset.editBook);
  openForm('Edit Book',[{n:'title',l:'Title',v:b.title},{n:'author',l:'Author',v:b.author},{n:'genre',l:'Genre (the genre decides the shelf)',opts:GENRES.map(g=>[g,`${g} - Shelf ${SHELF[g]}`]),sel:b.genre},{n:'rating',l:'My rating',opts:[['0','No rating'],['1','1 star'],['2','2 stars'],['3','3 stars'],['4','4 stars'],['5','5 stars']],sel:String(b.rating||0)}],
  d=>{Object.assign(b,{title:d.title.trim(),author:d.author.trim(),genre:d.genre,rating:+d.rating});toast('Book updated')})}
 const ep=c('[data-edit-person]');
 if(ep){const p=DB.people.find(x=>x.id===ep.dataset.editPerson);
  openForm('Edit Borrower',[{n:'name',l:'Full name',v:p.name},{n:'rel',l:'Relation',opts:REL,sel:p.rel},{n:'phone',l:'Phone (optional)',t:'tel',v:p.phone,opt:1}],
  d=>{Object.assign(p,{name:d.name.trim(),rel:d.rel,phone:d.phone.trim()});toast('Borrower updated')})}
 if(c('#exportBooks'))csv('my-books',[['ID','Title','Author','Genre','Shelf','Reading','Rating','Availability','With'],...DB.books.map(b=>{const l=cur(b.id);return[b.id,b.title,b.author,b.genre,shelfOf(b).replace('&middot;','-'),b.read,b.rating||0,l?status(l):'On Shelf',l?P_(l.pid).name:'']})]);
 if(c('#exportPeople'))csv('borrowers',[['ID','Name','Relation','Phone','Books held now','Total borrowed'],...DB.people.map(p=>[p.id,p.name,p.rel,p.phone,held(p.id).length,DB.loans.filter(l=>l.pid===p.id).length])]);
 if(c('#exportLoans'))csv('lending',[['ID','Borrower','Book','Date lent','Due date','Date returned','Status'],...DB.loans.map(l=>[l.id,P_(l.pid).name,B(l.bid).title,l.lent,l.due,l.ret||'',status(l)])]);
 const h=c('[data-hist]');
 if(h){const p=P_(h.dataset.hist),ls=DB.loans.filter(l=>l.pid===p.id).reverse();
  openInfo('Borrowing history: '+p.name,table(['Book','Dates','Status'],ls.map(l=>`<tr><td class="fw-semibold">${esc(B(l.bid).title)}</td><td class="text-nowrap"><div>Borrowed: ${fd(l.lent)}</div><div>${l.ret?`Returned: ${fd(l.ret)}`:`Due: ${fd(l.due)}`}</div></td><td>${badge(l)}</td></tr>`).join('')))}
 const d=c('[data-del]');
 if(d){const k=d.dataset.del,id=d.dataset.id;
  if(k==='people'&&held(id).length) return toast('This person still has your book. Mark it returned first.','warning');
  if(confirm('Delete this record?')){DB[k]=DB[k].filter(x=>x.id!==id);save();route();toast('Deleted')}}
 if(c('#resetData')&&confirm('Reset all data back to the demo data?')){DB=seed();save();route();toast('Demo data restored')}
});
document.addEventListener('change',e=>{const s=e.target.closest('[data-read]');
 if(s){DB.books.find(b=>b.id===s.dataset.read).read=s.value;save();route();toast('Reading status updated')}});

// ---- Router (hash based, supports filters like #loans?status=Overdue) ----
function route(){
 const [n,qs]=(location.hash||'#dashboard').slice(1).split('?');P=new URLSearchParams(qs||'');
 const v=views[n]?n:'dashboard';
 charts.forEach(c=>c.destroy());charts=[];
 views[v]();document.title=v[0].toUpperCase()+v.slice(1)+' | Pocket Shelf';
 document.querySelectorAll('.sidebar .nav-link').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+v));
 const oc=bootstrap.Offcanvas.getInstance(document.getElementById('sb'));if(oc)oc.hide();
}
addEventListener('hashchange',route);route();
