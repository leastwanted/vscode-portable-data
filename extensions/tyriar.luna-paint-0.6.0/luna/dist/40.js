const a16_0x5671=["selection","sign","now","fire","name","462660oHuuSX","crop-to-selection","webpackChunkluna","selectionService","5fXPvrU","1cleafR","220009XVtPqP","range","Rectangle Selection","1085761puKxzB","7wecbCN","287209FETesi","keyUp","Crop to Selection","_originX","_pointerDownY","width","bottom","_isPointerDown","2nYNEDp","type","_targetX","validate","_pointerDownX","abs","_pointerDownStartTime","_targetY","offsetY","1183918rEUFps","enabled","viewportService","pointerUp","right","_refreshActionEnabledState","285899KxifMv","Deselect","getCoordsFromEvent","pointerDownMove","height","top","_enabled","imageService","_sc","commit","push","_cropToSelectionAction","offsetX","_onUpdate","_updateSelection","keyDown","_originY","191717SZQWPa"],a16_0x359c=function(t,i){return a16_0x5671[t-=139]},a16_0x23e2ad=a16_0x359c;(function(t,i){const e=a16_0x359c;for(;;)try{if(833602==-parseInt(e(168))-parseInt(e(139))+-parseInt(e(187))*-parseInt(e(179))+-parseInt(e(145))*-parseInt(e(172))+parseInt(e(162))*parseInt(e(178))+parseInt(e(174))*parseInt(e(173))-parseInt(e(177)))break;t.push(t.shift())}catch(i){t.push(t.shift())}})(a16_0x5671),(self[a16_0x23e2ad(170)]=self.webpackChunkluna||[])[a16_0x23e2ad(155)]([[40],{6173:(t,i,e)=>{"use strict";const s=a16_0x23e2ad;e.d(i,{f:()=>h});var o=e(1815),n=e(5120);class h extends n.JT{constructor(t,i,e){const s=a16_0x359c;super(),this[s(167)]=t,this[s(188)]=i,this._enabled=e,this[s(158)]=this.register(new o.v),this.onUpdate=this._onUpdate.event}get enabled(){return this[a16_0x359c(151)]}set[s(140)](t){const i=s;this[i(151)]!==t&&(this[i(151)]=t,this[i(158)][i(166)]())}}},3040:(t,i,e)=>{"use strict";const s=a16_0x23e2ad;e.r(i),e.d(i,{default:()=>a});var o=e(5120),n=e(2939),h=e(1003),r=e(6173);class c extends o.JT{constructor(t){const i=a16_0x359c;super(),this._sc=t,this.id=i(163),this.isSelectionTool=!0,this[i(182)]=0,this._originY=0,this._pointerDownStartTime=0,this._pointerDownX=0,this._pointerDownY=0,this[i(156)]=new r.f(i(181),i(169),!1),this.actions=[this[i(156)]],this.register(this[i(153)][i(171)].onUpdate((()=>this._refreshActionEnabledState()))),this[i(144)]()}[s(160)](t,i){const e=s;this._isPointerDown=i,this[e(159)](t)}[s(180)](t,i){this[s(186)]=i,this._updateSelection(t)}pointerDown(t){const i=s;this[i(186)]=!0,this[i(193)]=Date.now(),this[i(191)]=t[i(157)],this[i(183)]=t[i(195)],(this[i(153)].selectionService[i(175)]||void 0!==this._targetX||void 0!==this[i(194)])&&(this[i(189)]=void 0,this[i(194)]=void 0,this[i(153)].selectionService[i(175)]=void 0),[this._originX,this[i(161)]]=this[i(153)][i(141)][i(147)](t)}[s(142)](t){const i=s;if(this[i(186)]=!1,void 0===this[i(189)]||void 0===this[i(194)]){this._sc[i(171)].range=void 0;const t=void 0===this._sc[i(171)][i(175)]?"Deselect":"Rectangle Selection";return void this[i(153)][i(171)][i(154)](t)}const e=Math[i(192)](this._pointerDownX-t[i(157)]),o=Math[i(192)](this[i(183)]-t[i(195)]);if(e<10&&o<10&&Date[i(165)]()-this[i(193)]<75){this._sc[i(171)][i(175)]=void 0;const t=void 0===this._sc.selectionService[i(175)]?"Deselect":"Rectangle Selection";return void this._sc.selectionService[i(154)](t)}this[i(159)](t);const n=void 0===this[i(153)][i(171)].range?i(146):i(176);this._sc[i(171)].commit(n)}[s(148)](t){const i=s;[this[i(189)],this[i(194)]]=this._sc[i(141)][i(147)](t),this._updateSelection(t)}_updateSelection(t){const i=s;if(!this._isPointerDown||void 0===this[i(189)]||void 0===this[i(194)])return;let e=this._targetX-this[i(182)],o=this._targetY-this[i(161)];t.shiftKey&&(Math[i(192)](e)>Math[i(192)](o)?e=o*(Math[i(164)](e)!==Math[i(164)](o)?-1:1):o=e*(Math[i(164)](e)!==Math[i(164)](o)?-1:1));const r=this[i(153)][i(152)][i(184)],c=this[i(153)][i(152)].height,a=(0,h.Pq)();o<0?(a[i(150)]=(0,n.u)(this._originY+o,c),a[i(185)]=(0,n.u)(this[i(161)]+1,c)):(a.bottom=(0,n.u)(this[i(161)]+o+1,c),a[i(150)]=(0,n.u)(this._originY,c)),e<0?(a.left=(0,n.u)(this._originX+e,r),a.right=(0,n.u)(this[i(182)]+1,r)):(a[i(143)]=(0,n.u)(this._originX+e+1,r),a.left=(0,n.u)(this._originX,r)),this[i(153)][i(171)][i(175)]=a,this._sc[i(171)][i(190)](r,c)}[s(144)](){const t=s,i=this._sc[t(171)][t(175)];this[t(156)][t(140)]=!(!i||0===i.left&&0===i[t(150)]&&i[t(143)]===this[t(153)].imageService[t(184)]&&i.bottom===this._sc[t(152)][t(149)])}}const a=c}}]);