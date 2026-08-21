#!/usr/bin/env node
'use strict';
const assert=require('node:assert');
const {METHOD_BY_ROLE,classifyVisual,resolveComposition,buildCompositionAwarePrompt}=require('../assets/visual-intelligence');
const {createVisualBible,createVisualManifest}=require('../assets/visual-bible');

const expected={EDITORIAL_SCENE:'IMAGEGEN',DIAGRAM:'POWERPOINT',PROCESS:'POWERPOINT',TIMELINE:'POWERPOINT',DATA_VISUALIZATION:'POWERPOINT_CHART',FUNCTIONAL_ICON:'VECTOR',REAL_INTERFACE:'SCREENSHOT',DECORATIVE:'OPTIONAL'};
Object.entries(expected).forEach(([role,method])=>assert.strictEqual(classifyVisual(role).imageMethod,method,role));
assert.notStrictEqual(classifyVisual('EDITORIAL_SCENE').imageMethod,'POWERPOINT');
assert.strictEqual(classifyVisual('REAL_INTERFACE').allowImageGen,false); assert.notStrictEqual(classifyVisual('REAL_INTERFACE').imageMethod,'IMAGEGEN');
const c=resolveComposition({layout:'split-right',textPosition:'LEFT',preserve:['face','hands']});
assert.strictEqual(c.subjectPosition,'RIGHT'); assert.strictEqual(c.negativeSpace,'LEFT'); assert.deepStrictEqual(c.preserve,['face','hands']);
const prompt=buildCompositionAwarePrompt('a senior using a laptop',{layout:'split-right',textPosition:'LEFT',preserve:['face','hands','laptop']},{style:'premium editorial illustration',palette:'EPN pastels'});
['right region','negative space on the left','face, hands, laptop','No text'].forEach(part=>assert.ok(prompt.includes(part),part));
const bible=createVisualBible({brand:'EPN_RIVIERE_SALEE',profile:'SENIOR',contentDepth:'ULTRA_DETAILED',deliveryMode:'DUAL',visualRole:'EDITORIAL_SCENE',composition:{layout:'hero',textPosition:'LEFT',subjectPosition:'RIGHT',negativeSpace:'LEFT',cropStrategy:'PRESERVE_FACE_AND_HANDS'},styleInvariants:['palette','light'],sceneVariables:['action']});
assert.strictEqual(bible.BRAND,'EPN_RIVIERE_SALEE'); assert.strictEqual(bible.PROFILE,'SENIOR'); assert.strictEqual(bible.CONTENT_DEPTH,'ULTRA_DETAILED'); assert.strictEqual(bible.DELIVERY_MODE,'DUAL'); assert.strictEqual(bible.VISUAL_ROLE,'EDITORIAL_SCENE'); assert.strictEqual(bible.IMAGE_METHOD,'IMAGEGEN'); assert.strictEqual(bible.SUBJECT_POSITION,'RIGHT'); assert.strictEqual(bible.NEGATIVE_SPACE,'LEFT'); assert.strictEqual(bible.CROP_STRATEGY,'PRESERVE_FACE_AND_HANDS'); assert.deepStrictEqual(bible.STYLE_INVARIANTS,['palette','light']); assert.deepStrictEqual(bible.SCENE_VARIABLES,['action']);
const manifest=createVisualManifest([
  {id:'cover',location:'projection:1',purpose:'Context',kind:'HUMAN_CONTEXT',visualRole:'EDITORIAL_SCENE',reason:'Human scene'},
  {id:'security-lock',location:'projection:4',purpose:'Identify protection',visualRole:'FUNCTIONAL_ICON',iconType:'FUNCTIONAL_ICON',iconRecognizability:'CLEAR',connectorValidation:{status:'VALID'},reason:'Universal lock'},
]);
assert.strictEqual(manifest.entries[0].imageMethod,'IMAGEGEN'); assert.ok(manifest.toMarkdown().includes('VISUAL_OPPORTUNITY'));
assert.strictEqual(manifest.entries[1].iconRecognizability,'CLEAR'); assert.ok(manifest.toMarkdown().includes('ICON_RECOGNIZABILITY: CLEAR')); assert.ok(manifest.toMarkdown().includes('CONNECTORS:'));
console.log('Visual Intelligence assertions passed');
