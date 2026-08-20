'use strict';

const pptxgen = require('../presentation-tools/node_modules/pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Codex';
pptx.company = 'Atelier IA';
pptx.lang = 'fr-FR';
pptx.subject = 'Découvrir l’intelligence artificielle en CM1-CM2';
pptx.title = 'IA : Amie ou ennemie ?';
pptx.theme = {
  headFontFace: 'Aptos Display', bodyFontFace: 'Aptos', lang: 'fr-FR'
};
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';

const C = { navy:'172554', blue:'2563EB', sky:'38BDF8', mint:'34D399', yellow:'FBBF24', coral:'FB7185', violet:'8B5CF6', ink:'172033', muted:'53627A', paper:'F8FAFC', white:'FFFFFF', line:'D7E2F0', paleBlue:'EAF4FF', paleMint:'E8FBF2', paleYellow:'FFF7D6', paleCoral:'FFF0F3', paleViolet:'F2EDFF' };
const W = 13.333, H = 7.5, M = 0.6;
const S = pptx.ShapeType;

function addText(slide, text, x, y, w, h, opts={}) {
  slide.addText(text, { x, y, w, h, margin: opts.margin ?? 0, fontFace: opts.fontFace || 'Aptos', fontSize: opts.fontSize || 18, color: opts.color || C.ink, bold: opts.bold || false, align: opts.align || 'left', valign: opts.valign || 'mid', fit: 'shrink', breakLine: false, ...opts });
}
function rect(slide,x,y,w,h,fill=C.white,r=0.16,line=C.line) { slide.addShape(S.roundRect,{x,y,w,h,rectRadius:r,fill:{color:fill},line:{color:line,transparency:line===fill?100:30}}); }
function circle(slide,x,y,d,fill,line=fill) { slide.addShape(S.ellipse,{x,y,w:d,h:d,fill:{color:fill},line:{color:line,transparency:0}}); }
function line(slide,x,y,w,h,color=C.line,width=2) { slide.addShape(S.line,{x,y,w,h,line:{color,width,beginArrowType:'none',endArrowType:'none'}}); }
function title(slide,n,heading,sub) {
  addText(slide, `${String(n).padStart(2,'0')}  •  DÉCOUVRIR`, M, .37, 3.4, .24,{fontSize:10,color:C.blue,bold:true,charSpacing:1.2});
  addText(slide,heading,M,.67,11.9,.58,{fontSize:31,color:C.navy,bold:true,fontFace:'Aptos Display'});
  if (sub) addText(slide,sub,M,1.29,11.8,.35,{fontSize:16,color:C.muted});
  circle(slide,12.28,.38,.34,C.yellow); circle(slide,12.68,.45,.2,C.mint);
}
function footer(slide,n) { addText(slide,'IA : amie ou ennemie ?',M,7.13,4,.17,{fontSize:10,color:C.muted}); addText(slide,String(n),12.1,7.1,.55,.2,{fontSize:10,color:C.muted,align:'right'}); }
function robot(slide,x,y,scale=1,body=C.sky) {
  // friendly robot, entirely editable shapes
  circle(slide,x+.50*scale,y+.04*scale,.16*scale,C.yellow); line(slide,x+.58*scale,y+.19*scale,0,.22*scale,C.navy,1.2);
  rect(slide,x,y+.35*scale,1.45*scale,1.05*scale,body,.16,C.navy);
  rect(slide,x+.23*scale,y+.58*scale,1.0*scale,.35*scale,C.navy,.08,C.navy);
  circle(slide,x+.43*scale,y+.65*scale,.16*scale,C.white); circle(slide,x+.88*scale,y+.65*scale,.16*scale,C.white);
  circle(slide,x+.48*scale,y+.70*scale,.06*scale,C.navy); circle(slide,x+.93*scale,y+.70*scale,.06*scale,C.navy);
  line(slide,x+.54*scale,y+1.08*scale,.36*scale,0,C.navy,1.5);
  line(slide,x-.18*scale,y+.82*scale,.18*scale,.16*scale,C.navy,2); line(slide,x+1.45*scale,y+.82*scale,.18*scale,.16*scale,C.navy,2);
  line(slide,x+.43*scale,y+1.4*scale,-.16*scale,.28*scale,C.navy,2); line(slide,x+1.02*scale,y+1.4*scale,.16*scale,.28*scale,C.navy,2);
}
function pill(slide,label,x,y,w,fill,color=C.navy){rect(slide,x,y,w,.38,fill,.19,fill);addText(slide,label,x,y+.045,w,.20,{fontSize:12,bold:true,color,align:'center'});}
function iconBubble(slide, emoji, label, x,y, fill) { circle(slide,x,y,.72,fill); addText(slide,emoji,x,y+.08,.72,.34,{fontSize:24,align:'center'}); addText(slide,label,x-.25,y+.82,1.22,.26,{fontSize:12,bold:true,align:'center'}); }

// 1 Cover
{
 const s=pptx.addSlide(); s.background={color:C.navy};
 circle(s,-.75,5.4,3.0,C.violet); circle(s,10.9,-.9,2.8,C.blue); circle(s,11.9,5.8,1.5,C.yellow);
 for (let i=0;i<10;i++) circle(s,7.0+(i%5)*.72,1.35+Math.floor(i/5)*.6,.08,i%2?C.sky:C.mint);
 addText(s,'UNE AVENTURE POUR COMPRENDRE',.7,.66,5.2,.23,{fontSize:12,color:C.yellow,bold:true,charSpacing:1.4});
 addText(s,'IA : Amie\nou ennemie ?',.7,1.15,6.5,1.55,{fontSize:43,color:C.white,bold:true,fontFace:'Aptos Display'});
 addText(s,'Découvrons ensemble comment utiliser\nl’intelligence artificielle avec malice !',.72,2.94,5.3,.65,{fontSize:20,color:'DDEBFF'});
 pill(s,'CM1 • CM2',.72,4.05,1.35,C.yellow,C.navy); pill(s,'MISSION : RÉFLÉCHIR',2.22,4.05,2.04,C.mint,C.navy);
 robot(s,8.55,2.05,2.1,C.sky); iconBubble(s,'💡','idées',7.15,5.3,C.paleYellow); iconBubble(s,'🔎','vérifier',9.05,5.45,C.paleMint); iconBubble(s,'🛡️','protéger',10.9,5.05,C.paleCoral);
 addText(s,'Une IA peut aider… mais c’est toi qui décides !',.72,6.85,7,.24,{fontSize:13,color:C.white,bold:true});
}

// 2 What is AI
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,2,'C’est quoi, une IA ?','Ce n’est pas un cerveau humain : c’est un programme qui repère des modèles.');
 rect(s,.65,2.05,5.45,3.85,C.paleBlue,.25,C.paleBlue); robot(s,1.05,2.85,1.75,C.sky);
 addText(s,'Une IA, c’est comme\nun super outil numérique',3.05,2.54,2.65,.72,{fontSize:25,bold:true,color:C.navy});
 addText(s,'Elle observe beaucoup d’exemples et cherche ce qui se ressemble.',3.05,3.48,2.5,.8,{fontSize:17,color:C.muted});
 line(s,6.35,3.9,.65,0,C.blue,2); circle(s,6.93,3.73,.35,C.blue);
 const cards=[['📚','Des exemples','images, textes, sons'],['🧩','Des indices','des ressemblances'],['✨','Une réponse','une proposition']];
 cards.forEach((a,i)=>{const x=7.35+i*1.78;rect(s,x,2.4,1.55,2.8,i===1?C.paleYellow:C.white,.18);addText(s,a[0],x+.42,2.72,.72,.35,{fontSize:26,align:'center'});addText(s,a[1],x+.16,3.38,1.22,.34,{fontSize:15,bold:true,align:'center',color:C.navy});addText(s,a[2],x+.16,3.86,1.22,.54,{fontSize:14,align:'center',color:C.muted});});
 rect(s,7.35,5.52,5.05,.55,C.white,.16); addText(s,'Elle ne “pense” pas comme toi : elle calcule très vite.',7.58,5.66,4.6,.2,{fontSize:14,bold:true,color:C.violet,align:'center'}); footer(s,2);
}

// 3 Learning
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,3,'Comment une IA apprend ?','Imagine une grande boîte à devinettes qui s’entraîne avec beaucoup d’exemples.');
 const steps=[['1','On lui montre','🐱  🐶  🐱'],['2','Elle compare','“Qu’est-ce qui se ressemble ?”'],['3','Elle essaie','🐱 ?'],['4','On vérifie','✅ ou à corriger']];
 line(s,1.32,4.3,10.7,0,C.sky,3);
 steps.forEach((a,i)=>{const x=.85+i*3.0;circle(s,x,3.75,.78,[C.blue,C.violet,C.mint,C.coral][i]);addText(s,a[0],x,3.95,.78,.23,{fontSize:20,bold:true,color:C.white,align:'center'});rect(s,x-.25,4.75,1.3,1.25,C.white,.18);addText(s,a[1],x-.18,4.93,1.16,.32,{fontSize:15,bold:true,color:C.navy,align:'center'});addText(s,a[2],x-.1,5.35,1,.33,{fontSize:14,color:C.muted,align:'center'});});
 rect(s,.92,1.96,11.5,.92,C.paleMint,.2,C.paleMint); addText(s,'Comme pour apprendre à faire du vélo : plus on s’entraîne avec de bons exemples, mieux on progresse !',1.25,2.25,10.85,.28,{fontSize:19,bold:true,color:C.navy,align:'center'}); footer(s,3);
}

// 4 knows
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,4,'Ce que l’IA sait faire','Elle peut être une super assistante pour créer, organiser et explorer.');
 const arr=[['🎨','Créer','une image, une idée'],['🌍','Traduire','des mots, une phrase'],['🔤','Résumer','un long texte'],['🎵','Reconnaître','une voix, un son'],['🗺️','Trouver','un itinéraire'],['♿','Aider','à mieux apprendre']];
 arr.forEach((a,i)=>{const col=i%3,row=Math.floor(i/3),x=.75+col*4.18,y=2.0+row*2.1;rect(s,x,y,3.72,1.63,[C.paleBlue,C.paleYellow,C.paleMint,C.paleCoral,C.paleViolet,C.white][i],.22);circle(s,x+.28,y+.37,.62,[C.sky,C.yellow,C.mint,C.coral,C.violet,C.blue][i]);addText(s,a[0],x+.28,y+.48,.62,.23,{fontSize:19,align:'center'});addText(s,a[1],x+1.08,y+.32,2.3,.27,{fontSize:20,bold:true,color:C.navy});addText(s,a[2],x+1.08,y+.79,2.28,.31,{fontSize:15,color:C.muted});});
 addText(s,'Un outil, pas un magicien !',.75,6.47,4,.26,{fontSize:16,bold:true,color:C.violet}); footer(s,4);
}

// 5 does not know
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,5,'Ce que l’IA ne sait pas forcément faire','Elle peut se tromper, inventer une réponse ou ne pas comprendre une situation.');
 robot(s,.9,2.2,1.55,C.violet); addText(s,'“Euh… je ne suis pas sûre !”',.72,4.57,2.4,.45,{fontSize:18,bold:true,color:C.violet,align:'center'});
 const items=[['🤔','Avoir du bon sens','Elle ne vit pas ta journée.'],['❤️','Ressentir vraiment','Elle imite des émotions.'],['🧠','Toujours dire vrai','Elle peut inventer !']];
 items.forEach((a,i)=>{const y=1.95+i*1.55;rect(s,3.35,y,8.95,1.13,C.white,.18);circle(s,3.72,y+.23,.62,[C.paleYellow,C.paleCoral,C.paleViolet][i]);addText(s,a[0],3.72,y+.34,.62,.22,{fontSize:19,align:'center'});addText(s,a[1],4.68,y+.22,2.85,.28,{fontSize:19,bold:true,color:C.navy});addText(s,a[2],4.68,y+.62,5.8,.25,{fontSize:15,color:C.muted}); pill(s,'À vérifier !',10.3,y+.37,1.35,C.paleYellow,C.navy);});
 footer(s,5);
}

// 6 advantages
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,6,'Les avantages : une aide qui peut compter','Bien utilisée, l’IA peut faire gagner du temps et ouvrir des portes.');
 const benefits=[['Gagner du temps','pour chercher des idées'],['S’entraîner','avec des explications adaptées'],['Créer','des histoires et des images'],['Aider à communiquer','traduire, lire, dicter']];
 benefits.forEach((a,i)=>{const x=.75+(i%2)*6.05,y=2.0+Math.floor(i/2)*2.1;rect(s,x,y,5.55,1.55,C.white,.2);circle(s,x+.32,y+.38,.54,[C.mint,C.sky,C.yellow,C.violet][i]);addText(s,'+',x+.32,y+.48,.54,.18,{fontSize:20,bold:true,color:C.white,align:'center'});addText(s,a[0],x+1.15,y+.31,3.9,.25,{fontSize:19,bold:true,color:C.navy});addText(s,a[1],x+1.15,y+.78,3.9,.25,{fontSize:15,color:C.muted});});
 rect(s,.75,6.35,11.8,.42,C.navy,.21,C.navy);addText(s,'La meilleure équipe : ton imagination + une IA + ton esprit critique.',1.0,6.45,11.25,.18,{fontSize:15,bold:true,color:C.white,align:'center'});footer(s,6);
}

// 7 deepfakes
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,7,'Attention : les fausses infos et les deepfakes','Une image ou une vidéo peut sembler vraie… sans l’être.');
 rect(s,.72,2.0,5.55,3.93,C.paleCoral,.25,C.paleCoral); addText(s,'⚠️',1.05,2.25,.7,.5,{fontSize:34,align:'center'});addText(s,'Un deepfake',1.86,2.28,3.9,.3,{fontSize:25,bold:true,color:C.coral});addText(s,'C’est un faux audio, une fausse image\nou une fausse vidéo faite avec l’IA.',1.05,3.1,4.9,.72,{fontSize:18,color:C.navy,align:'center'});rect(s,1.2,4.25,4.55,1.1,C.white,.15);addText(s,'“Ça a l’air vrai” ≠ “c’est vrai”',1.43,4.62,4.08,.25,{fontSize:18,bold:true,color:C.coral,align:'center'});
 const tests=[['1','Qui a publié ?'],['2','Une autre source confirme ?'],['3','Est-ce trop incroyable ?']];
 tests.forEach((a,i)=>{const x=7.0,y=2.1+i*1.22;circle(s,x,y,.52,[C.blue,C.mint,C.yellow][i]);addText(s,a[0],x,y+.13,.52,.18,{fontSize:15,bold:true,color:C.white,align:'center'});addText(s,a[1],7.75,y+.07,4.1,.3,{fontSize:20,bold:true,color:C.navy});});
 addText(s,'STOP • OBSERVE • VÉRIFIE',7.0,5.85,4.8,.36,{fontSize:18,bold:true,color:C.violet,align:'center'}); footer(s,7);
}

// 8 privacy
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,8,'Tes données personnelles : elles comptent !','Une donnée personnelle est une information qui parle de toi.');
 rect(s,.72,2.05,4.1,3.9,C.paleBlue,.25,C.paleBlue); circle(s,2.08,2.55,1.32,C.blue); addText(s,'🔒',2.08,2.83,1.32,.42,{fontSize:35,align:'center'}); addText(s,'Garde pour toi :',1.1,4.16,3.32,.3,{fontSize:21,bold:true,color:C.navy,align:'center'}); addText(s,'• ton nom complet\n• ton adresse\n• ton école\n• tes mots de passe\n• tes photos privées',1.4,4.62,2.75,.96,{fontSize:16,color:C.muted});
 rect(s,5.3,2.05,6.95,1.1,C.paleMint,.18,C.paleMint);addText(s,'✅ Tu peux demander de l’aide à un adulte.',5.63,2.42,6.25,.25,{fontSize:19,bold:true,color:C.navy});
 rect(s,5.3,3.52,6.95,1.1,C.paleYellow,.18,C.paleYellow);addText(s,'✅ Utilise un pseudo si c’est autorisé.',5.63,3.89,6.25,.25,{fontSize:19,bold:true,color:C.navy});
 rect(s,5.3,4.99,6.95,1.1,C.paleCoral,.18,C.paleCoral);addText(s,'❌ Ne donne jamais un mot de passe.',5.63,5.36,6.25,.25,{fontSize:19,bold:true,color:C.navy}); footer(s,8);
}

// 9 rules
{
 const s=pptx.addSlide(); s.background={color:C.paper}; title(s,9,'5 règles pour utiliser l’IA intelligemment','À garder en tête avant de cliquer, demander ou partager.');
 const rules=[['1','Je vérifie','Je compare avec une source sûre.'],['2','Je protège','Je ne partage pas mes infos privées.'],['3','Je demande','Je parle à un adulte si j’ai un doute.'],['4','Je reste moi','Je réfléchis et je crée aussi par moi-même.'],['5','Je respecte','Je ne triche pas et je reste gentil.']];
 rules.forEach((a,i)=>{const x=.75+(i%3)*4.13,y=1.98+Math.floor(i/3)*2.15;rect(s,x,y,3.63,1.7,[C.paleBlue,C.paleMint,C.paleYellow,C.paleViolet,C.paleCoral][i],.22);circle(s,x+.25,y+.25,.53,[C.blue,C.mint,C.yellow,C.violet,C.coral][i]);addText(s,a[0],x+.25,y+.39,.53,.17,{fontSize:16,bold:true,color:C.white,align:'center'});addText(s,a[1],x+.95,y+.28,2.28,.25,{fontSize:19,bold:true,color:C.navy});addText(s,a[2],x+.28,y+.88,3.05,.45,{fontSize:14,color:C.muted,align:'center'});});
 addText(s,'Ton super-pouvoir : réfléchir avant de croire.',1.0,6.55,11.25,.28,{fontSize:20,bold:true,color:C.navy,align:'center'}); footer(s,9);
}

// 10 Quiz
{
 const s=pptx.addSlide(); s.background={color:C.navy};addText(s,'QUIZ FINAL',.7,.6,2.2,.24,{fontSize:12,color:C.yellow,bold:true,charSpacing:1.4});addText(s,'Ami ou ennemi ?',.7,1.02,7.4,.62,{fontSize:34,bold:true,color:C.white,fontFace:'Aptos Display'});addText(s,'Lève la main : que ferais-tu ?', .72,1.78,5.6,.28,{fontSize:17,color:'DDEBFF'});
 const qs=[['1','Une IA te donne une info surprenante.','🟢 Je vérifie avant de la croire','🔴 Je la partage tout de suite'],['2','Une appli demande ton adresse.','🟢 Je demande à un adulte','🔴 Je réponds sans réfléchir'],['3','Tu fais un exposé.','🟢 Je m’en sers pour chercher des idées','🔴 Je copie tout sans comprendre']];
 qs.forEach((q,i)=>{const y=2.38+i*1.35;rect(s,.72,y,11.88,1.08,C.white,.17);circle(s,.97,y+.26,.52,C.yellow);addText(s,q[0],.97,y+.39,.52,.16,{fontSize:16,bold:true,color:C.navy,align:'center'});addText(s,q[1],1.72,y+.14,4.2,.28,{fontSize:15,bold:true,color:C.navy});rect(s,6.15,y+.17,2.75,.62,C.paleMint,.12,C.paleMint);addText(s,q[2],6.28,y+.31,2.5,.22,{fontSize:12,bold:true,color:C.navy,align:'center'});rect(s,9.18,y+.17,2.9,.62,C.paleCoral,.12,C.paleCoral);addText(s,q[3],9.32,y+.31,2.62,.22,{fontSize:12,bold:true,color:C.navy,align:'center'});});
 addText(s,'Réponse : l’IA est une amie quand on l’utilise avec prudence et intelligence !',.85,6.62,11.6,.25,{fontSize:16,bold:true,color:C.yellow,align:'center'});
}

pptx.writeFile({ fileName: __dirname + '/ia-amie-ou-ennemie.pptx' });
