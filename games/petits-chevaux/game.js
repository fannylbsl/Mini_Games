const board=document.querySelector('#board');
const rollBtn=document.querySelector('#roll');
const dice=document.querySelector('#dice');
const statusEl=document.querySelector('#status');
const turnName=document.querySelector('#turnName');
const win=document.querySelector('#win');
const winnerEl=document.querySelector('#winner');
const again=document.querySelector('#again');

const path=[
[0,4],[0,5],[0,6],[1,6],[2,6],[3,6],[4,6],[4,7],[4,8],[4,9],[4,10],
[5,10],[6,10],[6,9],[6,8],[6,7],[6,6],[7,6],[8,6],[9,6],[10,6],
[10,5],[10,4],[9,4],[8,4],[7,4],[6,4],[6,3],[6,2],[6,1],[6,0],
[5,0],[4,0],[4,1],[4,2],[4,3],[4,4],[3,4],[2,4],[1,4]
];
// 40 visible cells loop: enough for a compact 2-player race.
const starts=[0,20];
const players=[
 {name:'Joueur 1',emoji:'👹',cls:'p1',color:'start1',pawns:[-1,-1,-1,-1],finished:0},
 {name:'Joueur 2',emoji:'👻',cls:'p2',color:'start2',pawns:[-1,-1,-1,-1],finished:0}
];
let current=0, rolling=false, turnAgain=false;

const key=(r,c)=>r+'-'+c;
function makeBoard(){
  board.innerHTML='';
  const cells=new Map();
  for(let r=0;r<11;r++) for(let c=0;c<11;c++){
    const cell=document.createElement('div'); cell.className='cell';
    const onPath=path.some(([rr,cc])=>rr===r&&cc===c);
    if(onPath){cell.classList.add('path');const i=path.findIndex(([rr,cc])=>rr===r&&cc===c);if(i===0||i===20)cell.classList.add(i===0?'start1':'start2');if(i%10===0)cell.classList.add('safe');cell.dataset.path=i;}
    else if((r<4&&c<4)){cell.classList.add('home1')}
    else if((r>6&&c>6)){cell.classList.add('home2')}
    else if(r>=4&&r<=6&&c>=4&&c<=6){cell.classList.add('center'); if(r===5&&c===5)cell.innerHTML='<span>☠</span>'}
    board.appendChild(cell); cells.set(key(r,c),cell);
  }
  window.cells=cells;
  renderPieces();
}
function renderPieces(){
  document.querySelectorAll('.piece').forEach(e=>e.remove());
  players.forEach((p,pi)=>p.pawns.forEach((pos,idx)=>{
    const el=document.createElement('div'); el.className='piece '+p.cls; el.textContent=p.emoji; el.title=p.name+' — cheval '+(idx+1);
    let target;
    if(pos<0){
      const home=pi===0?[[1,1],[1,2],[2,1],[2,2]][idx]:[[8,8],[8,9],[9,8],[9,9]][idx];
      target=window.cells.get(key(...home));
    } else {
      const absolute=(starts[pi]+pos)%path.length;
      target=window.cells.get(key(...path[absolute]));
    }
    target.appendChild(el);
  }));
}
function setStatus(t){statusEl.textContent=t;turnName.textContent=(current===0?'🩸 ':'👻 ')+players[current].name}
function roll(){
 if(rolling)return;
 rolling=true;rollBtn.disabled=true;dice.classList.add('rolling');
 let ticks=0;const timer=setInterval(()=>{dice.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random()*6)];if(++ticks>=8){clearInterval(timer);const n=1+Math.floor(Math.random()*6);dice.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][n-1];dice.classList.remove('rolling');playTurn(n)}},70);
}
function playTurn(n){
 const p=players[current];
 const available=p.pawns.findIndex(x=>x<0 && n===6);
 const movable=p.pawns.findIndex(x=>x>=0 && x+n<=path.length-1);
 if(available<0 && movable<0){
   setStatus(n===6?'Même le destin refuse... 😈':'Aucun mouvement possible.');
   finishTurn(n===6);return;
 }
 const idx=available>=0?available:movable;
 if(p.pawns[idx]<0)p.pawns[idx]=0; else p.pawns[idx]+=n;
 renderPieces();
 const absolute=(starts[current]+p.pawns[idx])%path.length;
 capture(absolute,current);
 const piece=document.querySelectorAll('.piece')[current*4+idx]; if(piece)piece.classList.add('moving');
 if(p.pawns.filter(x=>x>=path.length-1).length===4){showWin(p.name);return}
 setStatus(n===6?'🩸 Un autre lancer...':'Déplacement effectué.');
 finishTurn(n===6);
}
function capture(abs,pi){
 players.forEach((p,other)=>{
   if(other===pi)return;
   p.pawns.forEach((pos,i)=>{
     if(pos>=0 && (starts[other]+pos)%path.length===abs && abs!==starts[other]){
       p.pawns[i]=-1;
       document.body.animate([{filter:'brightness(1)'},{filter:'brightness(2) saturate(2)'},{filter:'brightness(1)'}],{duration:350});
       statusEl.textContent='💥 BOUM ! Une créature retourne au cimetière 🩸';
     }
   });
 });
 renderPieces();
}
function finishTurn(extra){
 if(extra){rolling=false;rollBtn.disabled=false;return}
 current=current===0?1:0;rolling=false;rollBtn.disabled=false;setStatus('À toi de jouer... 🎲');
}
function showWin(name){winnerEl.textContent=name+' survit !';win.classList.remove('hidden');rollBtn.disabled=true}
function reset(){players.forEach(p=>{p.pawns=[-1,-1,-1,-1];p.finished=0});current=0;dice.textContent='🎲';win.classList.add('hidden');makeBoard();setStatus('Lance le dé pour commencer...');rollBtn.disabled=false}
rollBtn.addEventListener('click',roll);again.addEventListener('click',reset);makeBoard();setStatus('Lance le dé pour commencer...');