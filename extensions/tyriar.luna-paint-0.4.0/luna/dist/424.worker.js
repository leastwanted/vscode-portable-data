const a6_0x5aa3=["width","ceil","end","aAmount","871NnNPqY","floor","height","aIndex",'": ',"normal",'" and "',"set","max","start","bIndex","bAmount","right","number","27ualXnW","82229xqoput","913pUvZCs","1kPnxiT","subarray","653VqEMiE","round",'" dimensions are equal',"sqrt","yStart","1409PDiymg",'Images "',"min","40229zZsNdo","update","push","SharedArrayBuffer","destImage","top","1056654MUeCVF","webpackChunkluna"," x ","424514zXvQZY","sourceImage","left","resultIndex",'" dimensions differ',"data","toFixed",'Invalid dimensions for image "',"875833hzzkfi","yEnd"],a6_0x39d7=function(t,n){return a6_0x5aa3[t-=329]},a6_0x2d546b=a6_0x39d7;(function(t,n){const a=a6_0x39d7;for(;;)try{if(635407===-parseInt(a(378))+parseInt(a(350))*parseInt(a(334))+parseInt(a(367))+-parseInt(a(349))+-parseInt(a(370))*parseInt(a(351))+-parseInt(a(348))*-parseInt(a(361))+parseInt(a(353))*-parseInt(a(358)))break;t.push(t.shift())}catch(n){t.push(t.shift())}})(a6_0x5aa3),(self.webpackChunkluna=self[a6_0x2d546b(368)]||[])[a6_0x2d546b(363)]([[424],{424:(t,n,a)=>{"use strict";a.r(n),a.d(n,{run:()=>d});var e=a(517),r=a(166),o=a(742),i=a(979),s=a(888);const d=(t,n,a)=>{const d=a6_0x39d7;(0,o.ap)(a,d(371)),(0,o.ap)(a,d(365)),(0,o.TO)(a,d(371),d(365));const h=a[d(371)],u=a[d(365)],f=(0,r.M_)(h[d(330)],h.height,u[d(330)],u[d(336)]),l=f[d(330)]>=h[d(330)]&&f[d(336)]>=h[d(336)]?s.k:i.g,c={data:new Uint8Array(f[d(330)]*f.height*4),width:f.width,height:f.height},x={id:-1,yStart:t[d(343)]-f[d(366)],yEnd:t[d(332)]-f.top,xStart:-1,xEnd:-1};(x.yEnd>=0||x.yStart<f[d(336)])&&l(h,c,x);let w=0,M=0;const p=new Uint8Array([204,204,204,255]),I=new Uint8Array([255,255,255,255]);let m;for(let n=t[d(343)];n<t[d(332)];n++)for(let t=f[d(372)];t<f[d(372)]+f.width;t++)w=4*(n*u[d(330)]+t),M=4*((n-f.top)*f[d(330)]+t-f.left),255===u[d(375)][w+3]?(u[d(375)][w]=c[d(375)][M],u[d(375)][w+1]=c[d(375)][M+1],u[d(375)][w+2]=c[d(375)][M+2],u[d(375)][w+3]=c[d(375)][M+3]):(m=(Math[d(335)]((t-f[d(372)])/10%2)+Math[d(335)]((n-f[d(366)])/10%2))%2<1?p:I,(0,e.B)(d(339),u[d(375)],w,c[d(375)],M,m,0))}},742:(t,n,a)=>{"use strict";function e(t,n){const a=a6_0x39d7,e=t[n];if(e.width<1||e[a(336)]<1)throw new Error(a(377)+n+a(338)+e.width+a(369)+e[a(336)])}function r(t,n,a){const e=a6_0x39d7,r=t[n],o=t[a];if(r.width===o.width&&r.height===o[e(336)])throw new Error(e(359)+n+e(340)+a+e(355))}a.d(n,{ap:()=>e,TO:()=>r})},979:(t,n,a)=>{"use strict";a.d(n,{g:()=>i});var e=a(525);const r={aIndex:0,bIndex:0,aAmount:0,bAmount:0,resultIndex:0};let o=0;function i(t,n,a,o=(0,e.t)(a)){const i=a6_0x39d7,h=n[i(330)],u=n[i(336)],f=new Float32Array(h);if(h<t[i(330)]){const n=(t[i(330)]-1)/2,a=-(h-1)/2,e=t.width/h;for(let t=0;t<h;t++)f[t]=n+(t+a)*e}else for(let n=0;n<h;n++)f[n]=n/(h-1)*(t[i(330)]-1);const l=new Float32Array(u);if(u<t.height){const n=(t[i(336)]-1)/2,a=-(u-1)/2,e=t[i(336)]/u;for(let t=0;t<u;t++)l[t]=n+(t+a)*e}else for(let n=0;n<u;n++)l[n]=n/(u-1)*(t[i(336)]-1);let c=0,x=0,w=0,M=0,p=0,I=0,m=0,y=0;const A=new Uint8Array(4),b=new Uint8Array(4),_=a[i(329)]-a[i(357)];for(let e=a[i(357)];e<a.yEnd;e++){for(w=0;w<h;w++)c=f[w],x=l[e],M=4*(e*h+w),c===~~c?x===~~x?(p=4*(x*t[i(330)]+c),n[i(375)][M]=t[i(375)][p],n[i(375)][M+1]=t[i(375)][p+1],n.data[M+2]=t[i(375)][p+2],n.data[M+3]=t.data[p+3]):(m=Math[i(335)](x),y=Math[i(331)](x),r[i(337)]=4*(m*t.width+c),r[i(344)]=4*(y*t[i(330)]+c),r[i(333)]=(y-x)/(y-m),r.bAmount=1-r[i(333)],r[i(373)]=M,d(t[i(375)],t[i(375)],n[i(375)])):x===~~x?(s(t,c,x,Math[i(335)](c),Math[i(331)](c),A),n[i(375)][M]=A[0],n.data[M+1]=A[1],n[i(375)][M+2]=A[2],n[i(375)][M+3]=A[3]):(m=Math[i(335)](x),y=Math[i(331)](x),I=Math[i(335)](c),s(t,c,m,I,0,A),s(t,c,y,I,0,b),r[i(337)]=0,r[i(344)]=0,r[i(333)]=(y-x)/(y-m),r.bAmount=1-r[i(333)],r.resultIndex=M,d(A,b,n.data));o[i(362)](+((e-a[i(357)])/_)[i(376)](2))}}function s(t,n,a,e,o,i){const s=a6_0x39d7;r.aIndex=4*(a*t.width+e),r[s(344)]=r[s(337)]+4,r.bAmount=n%1,r[s(333)]=1-r[s(345)],r[s(373)]=0,d(t.data,t.data,i)}function d(t,n,a){const e=a6_0x39d7;if(0===n[r[e(344)]+3])0===t[r[e(337)]+3]?(a[r[e(373)]]=0,a[r[e(373)]+1]=0,a[r.resultIndex+2]=0,a[r[e(373)]+3]=0):(a[r[e(373)]]=t[r[e(337)]+0],a[r[e(373)]+1]=t[r[e(337)]+1],a[r[e(373)]+2]=t[r[e(337)]+2],a[r[e(373)]+3]=t[r[e(337)]+3]*r[e(333)]);else if(0===t[r[e(337)]+3])a[r.resultIndex]=n[r[e(344)]+0],a[r[e(373)]+1]=n[r[e(344)]+1],a[r[e(373)]+2]=n[r[e(344)]+2],a[r.resultIndex+3]=n[r[e(344)]+3]*r.bAmount;else for(o=0;o<4;o++)a[r[e(373)]+o]=t[r[e(337)]+o]*r[e(333)]+n[r.bIndex+o]*r.bAmount}},888:(t,n,a)=>{"use strict";a.d(n,{k:()=>r});var e=a(525);function r(t,n,a,r=(0,e.t)(a)){const o=a6_0x39d7,i=n.width,s=n[o(336)],d=new Uint32Array(i);for(let n=0;n<i;n++)d[n]=(n+.5)/i*t[o(330)];const h=new Uint32Array(s);for(let n=0;n<s;n++)h[n]=Math[o(335)]((n+.5)/s*t[o(336)])*t[o(330)];let u=0,f=0,l=0,c=0;const x=t[o(375)];for(let t=a[o(357)];t<a[o(329)];t++){for(l=4*h[t],f=0;f<i;f++)u=4*(t*i+f),c=l+4*d[f],n[o(375)][u]=x[c],n[o(375)][u+1]=x[c+1],n.data[u+2]=x[c+2],n[o(375)][u+3]=x[c+3];r.update(+(t/s)[o(376)](1))}}},517:(t,n,a)=>{"use strict";const e=a6_0x2d546b;a.d(n,{B:()=>s});const r=new Float32Array(6);let o;const i={normal:(t,n)=>n,darken:(t,n)=>Math.min(t,n),multiply:(t,n)=>t*n,linearBurn:(t,n)=>Math.max(t+n-1,0),lighten:(t,n)=>Math[e(342)](t,n),screen:(t,n)=>1-(1-t)*(1-n),linearDodgeAdd:(t,n)=>Math[e(360)](t+n,1),overlay:(t,n)=>t<.5?2*t*n:1-2*(1-t)*(1-n),softLight:(t,n)=>n<.5?2*t*n+t*t*(1-2*n):Math[e(356)](t)*(2*n-1)+2*t*(1-n),difference:(t,n)=>Math.abs(t-n),exclusion:(t,n)=>t+n-2*t*n};function s(t,n,a,s,h,u=n,f=a){const l=e;return r[0]=s[h+3]/255,0===r[0]?(n[a]=u[f],n[a+1]=u[f+1],n[a+2]=u[f+2],void(n[a+3]=u[f+3])):(r[1]=u[f+3]/255,0===r[1]?(n[a]=s[h],n[a+1]=s[h+1],n[a+2]=s[h+2],void(n[a+3]=s[h+3])):(o=i[t],r[3]=o(u[f]/255,s[h]/255),r[4]=o(u[f+1]/255,s[h+1]/255),r[5]=o(u[f+2]/255,s[h+2]/255),r[2]=r[0]+r[1]*(1-r[0]),n[a]=Math[l(354)](d(u[f]/255,r[1],s[h]/255,r[0],r[3])/r[2]*255),n[a+1]=Math[l(354)](d(u[f+1]/255,r[1],s[h+1]/255,r[0],r[4])/r[2]*255),n[a+2]=Math[l(354)](d(u[f+2]/255,r[1],s[h+2]/255,r[0],r[5])/r[2]*255),void(n[a+3]=Math[l(354)](255*r[2]))))}function d(t,n,a,e,r){return(n-n*e)*t+(e-n*e)*a+n*e*r}},166:(t,n,a)=>{"use strict";function e(t,n){const a=a6_0x39d7,e=n.bottom-n[a(366)],r=n[a(346)]-n.left,o=new Uint8Array(r*e*4);let i=0,s=0;for(let d=0;d<e;d++)s=d+n[a(366)],i=4*(s*t[a(330)]+n[a(372)]),o[a(341)](t[a(375)][a(352)](i,i+4*r),d*r*4);return o}function r(t,n,a,e,r=!0){const o=a6_0x39d7;if(!r&&n<e&&t<a)return{left:Math[o(354)]((a-t)/2),top:Math[o(354)]((e-n)/2),width:t,height:n};const i={left:0,top:0,width:a,height:e};if(n>t){const e=t/n;i.left=Math[o(354)](a*(.5-e/2)),i[o(330)]=Math[o(354)](a*e)}else if(t>n){const a=n/t;i[o(366)]=Math.round(e*(.5-a/2)),i[o(336)]=Math[o(354)](e*a)}return i}a.d(n,{Qf:()=>e,M_:()=>r})}}]);