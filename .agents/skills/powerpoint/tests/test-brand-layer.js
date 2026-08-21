#!/usr/bin/env node
'use strict';
const assert=require('node:assert');
const {resolveTheme}=require('../assets/themes');
const {registry,brandNames,resolveBrand,mergeBrandWithTheme}=require('../assets/brands');
const {createBrandComponents}=require('../assets/brand-components');
const pptxgen=require('pptxgenjs');

const epn=resolveBrand('EPN_RIVIERE_SALEE');
assert.strictEqual(epn.id,'EPN_RIVIERE_SALEE');
assert.strictEqual(epn.metadata.visibleName,'EPN de Rivière-Salée');
assert.strictEqual(epn.metadata.signature,'EPN de Rivière-Salée • Atelier numérique');
assert.strictEqual(epn.palette.background,'FAFAF7'); assert.strictEqual(epn.palette.bluePastel,'A9D6E5');
assert.strictEqual(epn.palette.mint,'BFDCCB'); assert.strictEqual(epn.palette.coral,'F3B6A5'); assert.strictEqual(epn.palette.yellow,'F4DFA0'); assert.strictEqual(epn.palette.text,'243447');
assert.strictEqual(epn.typography.face,'Arial'); assert.strictEqual(epn.graphicSignature.kind,'SEGMENT_DOT_CAPSULE'); assert.strictEqual(epn.graphicSignature.isLogo,false);
assert.deepStrictEqual(Object.values(epn.components).slice(0,4).map(x=>x.label),['À RETENIR','À VOUS DE JOUER','ATTENTION','ASTUCE']);
['senior','kids','education'].forEach((profile)=>{const branded=mergeBrandWithTheme(profile,'EPN_RIVIERE_SALEE');assert.strictEqual(branded.brandId,'EPN_RIVIERE_SALEE');assert.strictEqual(branded.profileName,profile);assert.strictEqual(branded.typography.body.face,'Arial');});
const senior=resolveTheme('senior'),brandedSenior=mergeBrandWithTheme('senior','EPN_RIVIERE_SALEE');
['display','title','subtitle','body','caption','stat'].forEach(role=>assert.ok(brandedSenior.typography[role].size>=senior.typography[role].size,role));
const unbranded=mergeBrandWithTheme('senior',null); assert.deepStrictEqual(unbranded,resolveTheme('senior')); assert.strictEqual(unbranded.brandId,undefined); assert.strictEqual(JSON.stringify(unbranded).includes('EPN_RIVIERE_SALEE'),false);
assert.strictEqual(mergeBrandWithTheme('education','EPN_RIVIERE_SALEE',{deliveryMode:'HANDOUT'}).brandRules.printFriendly,true);
assert.strictEqual(brandNames.length,1); assert.strictEqual(Object.keys(registry).length,1);
const brandComponents=createBrandComponents(new pptxgen(),'EPN_RIVIERE_SALEE');
['addGraphicSignature','addPedagogicalCallout','addActionSteps','addBrandFooter'].forEach(name=>assert.strictEqual(typeof brandComponents[name],'function',name));
console.log('Brand Layer assertions passed');
