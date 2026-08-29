(async function () {
  'use strict';
  const email = (localStorage.getItem('userEmail') || '').trim();
  const name = email ? email.split('@')[0] : 'Student';
  const userKey = email ? encodeURIComponent(email.toLowerCase()) : 'guest';
  const el = id => document.getElementById(id);
  if (el('user-email')) el('user-email').textContent = email || 'Student';
  if (el('student-name')) el('student-name').textContent = `Hi, ${name}! 👋`;
  const key = n => `${n}_${userKey}`;
  function arr(k) { try { const v=JSON.parse(localStorage.getItem(k)||'[]'); return Array.isArray(v)?v:[]; } catch(e){ return []; } }
  const localResults = arr(key('quizResults'));
  const videos = arr(key('completedVideos'));
  let serverResults=[];
  if(email){ try { const r=await fetch('/api/scores/'+encodeURIComponent(email)); if(r.ok){const d=await r.json(); if(Array.isArray(d)) serverResults=d;} } catch(e){} }
  const results = serverResults.length ? serverResults : localResults;
  const tests=results.length;
  const total=results.reduce((s,r)=>s+Number(r.score||0),0);
  const average=tests?Math.round(total/tests):0;
  const progress=Math.min(100,Math.round(Math.min(videos.length/15,1)*60+Math.min(tests/5,1)*40));
  localStorage.setItem(key('videosCompleted'),String(videos.length));
  localStorage.setItem(key('testsTaken'),String(tests));
  localStorage.setItem(key('averageScore'),String(average));
  localStorage.setItem(key('totalScore'),String(total));
  localStorage.setItem(key('overallProgress'),String(progress));
  if(el('videos-completed')) el('videos-completed').textContent=videos.length;
  if(el('mock-tests')) el('mock-tests').textContent=tests;
  if(el('average-score')) el('average-score').textContent=average+'%';
  if(el('progress-fill')) el('progress-fill').style.width=progress+'%';
  if(el('progress-percent')) el('progress-percent').textContent=progress+'%';
  const canvas=el('performanceChart'); if(!canvas||typeof Chart==='undefined') return;
  if(window.performanceChart instanceof Chart) window.performanceChart.destroy();
  const sorted=[...results].sort((a,b)=>new Date(a.timestamp||0)-new Date(b.timestamp||0));
  const labels=sorted.length?sorted.map((r,i)=>`${r.subject||'Test'} ${i+1}`):['No tests yet'];
  const data=sorted.length?sorted.map(r=>Number(r.score||0)):[0];
  window.performanceChart=new Chart(canvas.getContext('2d'),{type:'line',data:{labels,datasets:[{label:'Quiz Score (%)',data,borderWidth:3,tension:.35,pointRadius:5,fill:false}]},options:{responsive:true,maintainAspectRatio:false,scales:{y:{min:0,max:100,ticks:{stepSize:20}}},plugins:{legend:{display:true}}}});
})();
