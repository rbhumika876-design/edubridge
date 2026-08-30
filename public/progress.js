(function(){
'use strict';
function email(){return (localStorage.getItem('userEmail')||'').trim().toLowerCase();}
function uk(){const e=email();return e?encodeURIComponent(e):'guest';}
function key(n){return `${n}_${uk()}`;}
function read(k){try{const v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v));}
window.markVideoCompleted=function(id){if(!email()||!id)return;const k=key('completedVideos');const a=read(k);if(!a.includes(id)){a.push(id);write(k,a);localStorage.setItem(key('videosCompleted'),String(a.length));window.updateOverallProgress();}};
window.recordQuizResult=async function(subject,correct,totalQuestions){const e=email();if(!e)return;const pct=totalQuestions?Math.round(Number(correct)/Number(totalQuestions)*100):0;const k=key('quizResults');const a=read(k);a.push({subject:subject||'Unknown',score:pct,totalQuestions:Number(totalQuestions)||0,timestamp:new Date().toISOString()});write(k,a);const total=a.reduce((s,r)=>s+Number(r.score||0),0);localStorage.setItem(key('testsTaken'),String(a.length));localStorage.setItem(key('averageScore'),String(Math.round(total/a.length)));localStorage.setItem(key('totalScore'),String(total));window.updateOverallProgress();try{await fetch('/api/scores',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:e,subject:subject||'Unknown',score:pct,totalQuestions:Number(totalQuestions)||0})});}catch(err){console.warn('Score server sync failed; local score retained.');}};
window.updateOverallProgress=function(){const v=read(key('completedVideos')).length,t=read(key('quizResults')).length;const p=Math.min(100,Math.round(Math.min(v/15,1)*60+Math.min(t/5,1)*40));localStorage.setItem(key('overallProgress'),String(p));return p;};
window.setupVideoTracking=function(){if(!email())return;document.querySelectorAll('a[href]').forEach(function(link){const href=link.getAttribute('href')||'';const c=link.closest('.lecture-list,.subject-box,.card,.subject-card');const text=(c?c.textContent:link.textContent)||'';if(!(/youtube\.com|youtu\.be/i.test(href)||/lecture|video/i.test(text)))return;if(link.dataset.progressTracking==='true')return;link.dataset.progressTracking='true';link.addEventListener('click',function(){markVideoCompleted(href.split('#')[0]+'|'+(link.textContent||'').trim());});});};
document.addEventListener('DOMContentLoaded',function(){setupVideoTracking();updateOverallProgress();});
})();
