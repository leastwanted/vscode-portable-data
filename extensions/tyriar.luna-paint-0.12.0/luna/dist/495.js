const a22_0x4acb=["No support for writing icos with ","floor","verticalResolution","34441yWbSIO","undefined","headerSize","Cannot write an .ico with 0 images","createElement","putImageData","map","table","70562sMXsws","keys","-bit image contains alpha channel, increasing to 32-bit","Writing only 32, 24, 8, 4 and 1-bit bmps is supported currently","22045eIDjMm","Color Table","143087kILlIk","webpackChunkluna","toBlob","bitness","toRGBA","Cannot write 1, 4 or 8-bit bmps without color table","compression","reduce","set","Cannot write bmp with bits per pixel ","2479jyWGWG","bitmapWidth","entries","has","split","bitsPerPixel","width","43CioLZd"," bitness, falling back to 32-bit","image/png","warn","data","arrayBuffer","4XJaHwT","244812hcueei","length","Unexpected bits per pixel ","imageSize","Cannot encode .ico png images without browser yet","height","pow","importantColorCount","mimeType","setUint32","ceil"," with ","11031elUWrq","horizontalResolution","colorPlaneCount","bitmapHeight","setUint8","push","2WEqZRp","toBGRA","get","canvas","buffer","size","slice","convertToBlob","paletteColorCount","subarray","setUint16","colors"," color count"],a22_0x56aa=function(t,e){return a22_0x4acb[t-=436]},a22_0x212b09=a22_0x56aa;(function(t,e){const n=a22_0x56aa;for(;;)try{if(158077===-parseInt(n(438))-parseInt(n(498))+parseInt(n(491))*parseInt(n(484))+-parseInt(n(497))*-parseInt(n(460))+parseInt(n(472))*-parseInt(n(444))+parseInt(n(468))+parseInt(n(474)))break;t.push(t.shift())}catch(e){t.push(t.shift())}})(a22_0x4acb),(self[a22_0x212b09(475)]=self[a22_0x212b09(475)]||[])[a22_0x212b09(443)]([[495],{9094:(t,e,n)=>{"use strict";var a,o;n.d(e,{P:()=>a,V:()=>o}),(a||(a={}))[a22_0x56aa(478)]=function(t,e){let n=0;const a=4*e;for(let e=0;e<a;e+=4)n=t[e],t[e]=t[e+2],t[e+2]=n},(o||(o={}))[a22_0x56aa(445)]=function(t,e){return a.toRGBA(t,e)}},4085:(t,e,n)=>{"use strict";function a(t,e){return Math[a22_0x56aa(436)](t/e)*e}n.d(e,{g:()=>a})},7495:(t,e,n)=>{"use strict";n.r(e),n.d(e,{writeIco:()=>c,writeIcoEntries:()=>u,writeIcoHeader:()=>l,writeIcoImageData:()=>h});var a=n(9094),o=n(4085);function r(t,e,n){const a=a22_0x56aa,r=(0,o.g)(t[a(485)]*t.bitsPerPixel,32)/8,i=new Uint8Array(e.height*r);if(0===n[a(449)])return i;let s=0,c=0,l=0;for(let o=0;o<t[a(441)];o++){const u=o*r;for(let r=0;r<t.bitmapWidth;r++){s=4*((e[a(503)]-o-1)*e[a(490)]+r);const h=e[a(495)][s]+","+e[a(495)][s+1]+","+e[a(495)][s+2]+","+e[a(495)][s+3];switch(t[a(489)]){case 1:c=u+Math.floor(r/8),l=7-r%8;break;case 4:c=u+Math[a(458)](r/2),l=r%2==0?4:0;break;case 8:c=u+r;break;default:throw new Error(a(500)+t[a(489)])}i[c]|=(n[a(446)](h)||0)<<l}}return i}function i(t){const e=a22_0x56aa,n=t.reduce(((t,n)=>t+n[e(499)]),0),a=new Uint8Array(n);let o=0;for(const n of t)a[e(482)](n,o),o+=n[e(499)];return a}const s=[1,4,8,16,24,32];async function c(t){const e=a22_0x56aa,n=l(t[e(499)]),a=t.map((t=>h(t))),o=await Promise.all(a),r=u(t,o.map((t=>t[e(452)])),o[e(466)]((t=>t[e(489)])));let s=n.length+r[e(481)](((t,n)=>t+n[e(499)]),0);for(const[t,n]of r[e(486)]()){const a=new DataView(n.buffer);a[e(507)](8,o[t][e(495)][e(499)],!0),a[e(507)](12,s,!0),s+=o[t][e(495)].length}return i([n,...r,...o[e(466)]((t=>t[e(495)]))])}function l(t){const e=a22_0x56aa;if(0===t)throw new Error(e(463));const n=new Uint8Array(6),a=new DataView(n[e(448)]);return a[e(454)](2,1,!0),a[e(454)](4,t,!0),n}function u(t,e,n){const a=a22_0x56aa,o=[];for(let r=0;r<t[a(499)];r++){const i=t[r],s=new Uint8Array(16),c=new DataView(s.buffer);c[a(442)](0,i.width>255?0:i[a(490)]),c.setUint8(1,i.height>255?0:i[a(503)]),c[a(442)](2,e[r]||0),c[a(442)](4,1),c[a(454)](6,n[r],!0),o[a(443)](s)}return o}async function h(t){const e=a22_0x56aa;return t.mimeType&&t[e(506)]!==e(493)?function(t){const e=a22_0x56aa;let n=t[e(477)]<=24?function(t){const e=a22_0x56aa,n=new Map;let a=!1,o=0;for(let r=0;r<t[e(503)];r++)for(let i=0;i<t[e(490)];i++){const s=4*(r*t[e(490)]+i);if(o=t[e(495)][s+3],0===o)continue;255!==o&&(a=!0);const c=t.data[s]+","+t[e(495)][s+1]+","+t[e(495)][s+2]+","+o;!n[e(487)](c)&&n[e(482)](c,n[e(449)])}return{colors:n,usesAlphaChannel:a}}(t):void 0;n&&(t[e(477)]<24&&n.colors[e(449)]>Math[e(504)](2,t.bitness)&&(console[e(494)](t.bitness+"-bit image contains more colors than bits per pixel allows, increasing to 24-bit"),t[e(477)]=24),n.usesAlphaChannel&&(console[e(494)](t[e(477)]+e(470)),t[e(477)]=32),t[e(477)]>=24&&(n=void 0));let o=t.bitness;!s.includes(t[e(477)])&&(console[e(494)](e(457)+t[e(477)]+e(492)),o=32);const c={type:1,headerSize:40,bitmapWidth:t[e(490)],bitmapHeight:t[e(503)],colorPlaneCount:1,bitsPerPixel:o,compression:0,imageSize:0,horizontalResolution:0,verticalResolution:0,paletteColorCount:0,importantColorCount:0},l=n?function(t,e,n){const a=a22_0x56aa;if(e[a(449)]>Math.pow(2,t[a(489)]))throw console.error(a(473),Array.from(e[a(469)]())),new Error(a(483)+t[a(489)]+a(437)+e[a(449)]+a(456));const o=new Uint8Array(4*e[a(449)]);for(const[t,n]of e[a(486)]()){const[e,r,i,s]=t[a(488)](",")[a(466)]((t=>parseInt(t)));o[4*n]=i,o[4*n+1]=r,o[4*n+2]=e}return a(452)in t&&(t[a(452)]=e[a(449)]),{data:o,table:e}}(c,n[e(455)]):void 0,u=function(t,e,n){const o=a22_0x56aa;switch(t[o(489)]){case 1:case 4:case 8:if(!n)throw new Error(o(479));return r(t,e,n[o(467)]);case 24:return function(t,e){const n=a22_0x56aa,a=3*e[n(490)],o=new Uint8Array(a*e.height);let r=0;for(let i=0;i<t[n(441)];i++){const s=i*a;for(let a=0;a<t[n(485)];a++)r=4*((e[n(503)]-i-1)*e.width+a),o[s+3*a]=e[n(495)][r+2],o[s+3*a+1]=e[n(495)][r+1],o[s+3*a+2]=e.data[r]}return o}(t,e);case 32:return function(t,e){const n=a22_0x56aa,o=e[n(495)][n(450)]();a.V.toBGRA(o,t.bitmapWidth*t[n(441)]);const r=new Uint8Array(o),i=4*t[n(485)];let s=0;for(let e=0;e<t.bitmapHeight;e++)s=t[n(441)]-(e+1),r[n(482)](o[n(453)](s*i,(s+1)*i),e*i);return r}(t,e);default:throw new Error(o(471))}}(c,t,l),h=r({type:1,headerSize:40,bitmapWidth:t[e(490)],bitmapHeight:t.height,colorPlaneCount:1,bitsPerPixel:1,compression:0,imageSize:0,horizontalResolution:0,verticalResolution:0,paletteColorCount:0,importantColorCount:0},t,function(t){const e=a22_0x56aa,n=new Map;for(let a=0;a<t[e(503)];a++)for(let o=0;o<t[e(490)];o++){const r=4*(a*t.width+o),i=t[e(495)][r]+","+t[e(495)][r+1]+","+t.data[r+2]+","+t[e(495)][r+3];255===t[e(495)][r+3]?n[e(482)](i,0):n[e(482)](i,1)}return n}(t));return{data:i([(p={...c,bitmapHeight:2*t[e(503)],imageSize:u.length+h.length},function(t){const e=a22_0x56aa,n=new Uint8Array(40),a=new DataView(n[e(448)]);return a.setUint32(0,t[e(462)],!0),a[e(507)](4,t[e(485)],!0),a.setUint32(8,t[e(441)],!0),a[e(454)](12,t[e(440)],!0),a[e(454)](14,t[e(489)],!0),a[e(454)](16,t[e(480)],!0),a[e(454)](20,t[e(501)],!0),a[e(454)](24,t[e(439)],!0),a[e(454)](28,t[e(459)],!0),a[e(454)](32,t.paletteColorCount,!0),a.setUint16(36,t[e(505)],!0),n}(p)),l?l.data:new Uint8Array(0),u,h]),paletteColorCount:c[e(452)],bitsPerPixel:o};var p}(t):async function(t){const e=a22_0x56aa;if(typeof navigator===e(461))throw new Error(e(502));let n;"OffscreenCanvas"in window?n=new OffscreenCanvas(t[e(490)],t[e(503)]):(n=document[e(464)](e(447)),n[e(490)]=t[e(490)],n[e(503)]=t[e(503)]),n.getContext("2d")[e(465)](new ImageData(new Uint8ClampedArray(t.data),t.width,t.height),0,0);const a=e(476)in n?await new Promise((t=>n.toBlob(t,e(493)))):await n[e(451)]({type:e(493)});if(null===a)throw new Error("Failed to encode canvas to png");return{data:new Uint8Array(await a[e(496)]()),bitsPerPixel:32}}(t)}}}]);