var app=function(){"use strict";function e(){}function t(e){return e()}function n(){return Object.create(null)}function s(e){e.forEach(t)}function i(e){return"function"==typeof e}function o(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function r(t,...n){if(null==t)return e;const s=t.subscribe(...n);return s.unsubscribe?()=>s.unsubscribe():s}function c(e){let t;return r(e,(e=>t=e))(),t}function a(e,t,n){e.$$.on_destroy.push(r(t,n))}function u(e,t,n){return e.set(n),t}function l(e,t){e.appendChild(t)}function h(e,t,n){e.insertBefore(t,n||null)}function d(e){e.parentNode.removeChild(e)}function f(e){return document.createElement(e)}function p(e){return document.createTextNode(e)}function m(){return p(" ")}function b(e,t,n,s){return e.addEventListener(t,n,s),()=>e.removeEventListener(t,n,s)}function g(e,t,n){null==n?e.removeAttribute(t):e.getAttribute(t)!==n&&e.setAttribute(t,n)}function w(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}let $;function P(e){$=e}function y(e){(function(){if(!$)throw new Error("Function called outside component initialization");return $})().$$.on_mount.push(e)}const C=[],M=[],v=[],k=[],_=Promise.resolve();let x=!1;function S(e){v.push(e)}const E=new Set;let A=0;function N(){const e=$;do{for(;A<C.length;){const e=C[A];A++,P(e),T(e.$$)}for(P(null),C.length=0,A=0;M.length;)M.pop()();for(let e=0;e<v.length;e+=1){const t=v[e];E.has(t)||(E.add(t),t())}v.length=0}while(C.length);for(;k.length;)k.pop()();x=!1,E.clear(),P(e)}function T(e){if(null!==e.fragment){e.update(),s(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(S)}}const L=new Set;function q(e,t){-1===e.$$.dirty[0]&&(C.push(e),x||(x=!0,_.then(N)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function D(o,r,c,a,u,l,h,f=[-1]){const p=$;P(o);const m=o.$$={fragment:null,ctx:null,props:l,update:e,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(r.context||(p?p.$$.context:[])),callbacks:n(),dirty:f,skip_bound:!1,root:r.target||p.$$.root};h&&h(m.root);let b=!1;if(m.ctx=c?c(o,r.props||{},((e,t,...n)=>{const s=n.length?n[0]:t;return m.ctx&&u(m.ctx[e],m.ctx[e]=s)&&(!m.skip_bound&&m.bound[e]&&m.bound[e](s),b&&q(o,e)),t})):[],m.update(),b=!0,s(m.before_update),m.fragment=!!a&&a(m.ctx),r.target){if(r.hydrate){const e=function(e){return Array.from(e.childNodes)}(r.target);m.fragment&&m.fragment.l(e),e.forEach(d)}else m.fragment&&m.fragment.c();r.intro&&((g=o.$$.fragment)&&g.i&&(L.delete(g),g.i(w))),function(e,n,o,r){const{fragment:c,on_mount:a,on_destroy:u,after_update:l}=e.$$;c&&c.m(n,o),r||S((()=>{const n=a.map(t).filter(i);u?u.push(...n):s(n),e.$$.on_mount=[]})),l.forEach(S)}(o,r.target,r.anchor,r.customElement),N()}var g,w;P(p)}class F{constructor({id:e,name:t,description:n,price:s,isCps:i,oneTimePurchase:o=!1},r=(()=>null)){if(this.disabled=!1,this.amountPurchased=0,this.id=e,this.name=t,this.price=s,this.description=n,this.isCps=i,this.coffeePerSecond=0,this.totalCoffeePerSecond=0,this.basePrice=s,this.oneTimePurchase=o,this.callback=r,this.isCps&&this.id>0){let e=Math.ceil(10*Math.pow(1*this.id,.5*this.id+2))/10,t=Math.pow(10,Math.ceil(Math.log(Math.ceil(e))/Math.LN10))/100;this.coffeePerSecond=Math.round(e/t)*t,this.basePrice=(1*this.id+9+(this.id<5?0:5*Math.pow(this.id-5,1.75)))*Math.pow(10,this.id)*Math.max(1,this.id-14),t=Math.pow(10,Math.ceil(Math.log(Math.ceil(this.basePrice))/Math.LN10))/100,this.basePrice=Math.round(this.basePrice/t)*t,this.price=this.basePrice}}purchase(){return this.amountPurchased++,this.increasePrice(),this.callback(),this.isCps&&(this.totalCoffeePerSecond=this.coffeePerSecond*this.amountPurchased),this.oneTimePurchase&&(this.disabled=!0),this}increasePrice(){this.price=Math.ceil(this.basePrice*Math.pow(1.15,this.amountPurchased))}}const I=[];function O(t,n=e){let s;const i=new Set;function r(e){if(o(t,e)&&(t=e,s)){const e=!I.length;for(const e of i)e[1](),I.push(e,t);if(e){for(let e=0;e<I.length;e+=2)I[e][0](I[e+1]);I.length=0}}}return{set:r,update:function(e){r(e(t))},subscribe:function(o,c=e){const a=[o,c];return i.add(a),1===i.size&&(s=n(r)||e),o(t),()=>{i.delete(a),0===i.size&&(s(),s=null)}}}}const j=O(0),z=O(0),B=O(1),G=O(0),J=O(0),K=O(1),V=O(1),Y=function(t,n,o){const c=!Array.isArray(t),a=c?[t]:t,u=n.length<2;return l=t=>{let o=!1;const l=[];let h=0,d=e;const f=()=>{if(h)return;d();const s=n(c?l[0]:l,t);u?t(s):d=i(s)?s:e},p=a.map(((e,t)=>r(e,(e=>{l[t]=e,h&=~(1<<t),o&&f()}),(()=>{h|=1<<t}))));return o=!0,f(),function(){s(p),d()}},{subscribe:O(o,l).subscribe};var l}([J,K,V],(([e,t,n])=>Math.ceil((1+e*t)*n))),H=[new F({name:"Increment Click Power",price:10,description:"Increase the power of your clicks by 1"},(()=>{J.set(c(J)+1)})),new F({name:"10% Click Power increase",price:100,description:"Increase the power of your clicks by 10%"},(()=>{V.set(c(V)+.1)})),new F({name:"Double ClickPower increase",price:1e3,oneTimePurchase:!0,description:"Increase the power of your clicks by 2x"},(()=>{K.set(c(K)+1)})),new F({id:1,name:"Frenchpress",description:"Drips a coffee drop now and then",isCps:!0}),new F({id:2,name:"Capsule Machine",description:"Get a quick cup of coffee",isCps:!0}),new F({id:3,name:"Mocha Master",description:"Can make a pot of coffee rather quick",isCps:!0}),new F({id:4,name:"Cappuccino Machine",description:"Now we're getting fancy coffee worth more",isCps:!0}),new F({id:5,name:"Espresso Machine",description:"Long sleepless nights?",isCps:!0}),new F({id:6,name:"KitchenAid Classic",description:"Even helps clean the kitchen",isCps:!0}),new F({id:7,name:"Coisinart Grind & Brew",description:"Your neighbors start showing up for breakfast",isCps:!0}),new F({id:8,name:"Breville The Oracle Touch",description:"Developers has moved in with you",isCps:!0}),new F({id:9,name:"De'Longhi Dinamica Plus",description:"Every morning a ray of sunlight shines on your house",isCps:!0}),new F({id:10,name:"Nespresso Vertuo Next",description:"Jesus sometimes stops by for a cup",isCps:!0})],Q=O(0),R=(e=>{const{subscribe:t,set:n,update:s}=O(e);return{subscribe:t,purchase:t=>{const s=e.find((e=>e.name===t)),i=s.price;return s.purchase(),n(e),i}}})(H);function U(e,t,n){const s=e.slice();return s[13]=t[n],s}function W(e){let t,n=e[13].amountPurchased+"";return{c(){t=p(n)},m(e,n){h(e,t,n)},p(e,s){8&s&&n!==(n=e[13].amountPurchased+"")&&w(t,n)},d(e){e&&d(t)}}}function X(t){let n;return{c(){n=p("Purchased")},m(e,t){h(e,n,t)},p:e,d(e){e&&d(n)}}}function Z(e){let t,n,s=se(e[13].price)+"";return{c(){t=p(s),n=p(" ☕")},m(e,s){h(e,t,s),h(e,n,s)},p(e,n){8&n&&s!==(s=se(e[13].price)+"")&&w(t,s)},d(e){e&&d(t),e&&d(n)}}}function ee(e){let t,n,s,i,o=se(e[13].coffeePerSecond)+"";return{c(){t=f("p"),n=p("("),s=p(o),i=p(" ☕/sec)"),g(t,"class","svelte-1r6bo5e")},m(e,o){h(e,t,o),l(t,n),l(t,s),l(t,i)},p(e,t){8&t&&o!==(o=se(e[13].coffeePerSecond)+"")&&w(s,o)},d(e){e&&d(t)}}}function te(e){let t,n,s,i,o,r,c,a,u,$,P,y,C,M,v=e[13].name+"",k=e[13].description+"",_=!e[13].disabled&&e[13].amountPurchased>0&&W(e);function x(e,t){return e[13].disabled?X:Z}let S=x(e),E=S(e),A=e[13].isCps&&ee(e);function N(){return e[7](e[13])}return{c(){t=f("li"),n=f("button"),_&&_.c(),s=m(),i=p(v),o=m(),r=f("small"),c=p(k),a=m(),u=f("aside"),E.c(),$=m(),A&&A.c(),y=m(),g(r,"class","svelte-1r6bo5e"),g(u,"class","svelte-1r6bo5e"),g(n,"class","upgrades svelte-1r6bo5e"),n.disabled=P=e[1]<e[13].price||e[13].disabled},m(e,d){h(e,t,d),l(t,n),_&&_.m(n,null),l(n,s),l(n,i),l(n,o),l(n,r),l(r,c),l(n,a),l(n,u),E.m(u,null),l(u,$),A&&A.m(u,null),l(t,y),C||(M=b(n,"click",N),C=!0)},p(t,o){!(e=t)[13].disabled&&e[13].amountPurchased>0?_?_.p(e,o):(_=W(e),_.c(),_.m(n,s)):_&&(_.d(1),_=null),8&o&&v!==(v=e[13].name+"")&&w(i,v),8&o&&k!==(k=e[13].description+"")&&w(c,k),S===(S=x(e))&&E?E.p(e,o):(E.d(1),E=S(e),E&&(E.c(),E.m(u,$))),e[13].isCps?A?A.p(e,o):(A=ee(e),A.c(),A.m(u,null)):A&&(A.d(1),A=null),10&o&&P!==(P=e[1]<e[13].price||e[13].disabled)&&(n.disabled=P)},d(e){e&&d(t),_&&_.d(),E.d(),A&&A.d(),C=!1,M()}}}function ne(t){let n,s,i,o,r,c,a,u,$,P,y,C,M,v,k,_,x,S,E,A,N,T,L,q=se(Math.ceil(t[1]))+"",D=se(t[2]*t[4])+"",F=t[3],I=[];for(let e=0;e<F.length;e+=1)I[e]=te(U(t,F,e));return{c(){n=f("main"),s=p("v1.3 test\n\t"),i=f("section"),o=f("h1"),r=p(q),c=p(" ☕"),a=m(),u=f("button"),u.textContent="Click",$=m(),P=f("small"),y=p(D),C=p(" ☕/sec"),M=m(),v=f("small"),k=p(t[0]),_=p(" 👆"),x=m(),S=f("aside"),E=f("h2"),E.textContent="Shop",A=m(),N=f("ul");for(let e=0;e<I.length;e+=1)I[e].c();g(o,"class","svelte-1r6bo5e"),g(P,"class","svelte-1r6bo5e"),g(v,"class","svelte-1r6bo5e"),g(i,"class","clicking-side svelte-1r6bo5e"),g(N,"class","svelte-1r6bo5e"),g(S,"class","shop svelte-1r6bo5e"),g(n,"class","svelte-1r6bo5e")},m(e,d){h(e,n,d),l(n,s),l(n,i),l(i,o),l(o,r),l(o,c),l(i,a),l(i,u),l(i,$),l(i,P),l(P,y),l(P,C),l(i,M),l(i,v),l(v,k),l(v,_),l(n,x),l(n,S),l(S,E),l(S,A),l(S,N);for(let e=0;e<I.length;e+=1)I[e].m(N,null);T||(L=b(u,"click",t[6]),T=!0)},p(e,[t]){if(2&t&&q!==(q=se(Math.ceil(e[1]))+"")&&w(r,q),20&t&&D!==(D=se(e[2]*e[4])+"")&&w(y,D),1&t&&w(k,e[0]),42&t){let n;for(F=e[3],n=0;n<F.length;n+=1){const s=U(e,F,n);I[n]?I[n].p(s,t):(I[n]=te(s),I[n].c(),I[n].m(N,null))}for(;n<I.length;n+=1)I[n].d(1);I.length=F.length}},i:e,o:e,d(e){e&&d(n),function(e,t){for(let n=0;n<e.length;n+=1)e[n]&&e[n].d(t)}(I,e),T=!1,L()}}}function se(e){return e.toLocaleString("en")}function ie(e,t,n){let s,i,o,r,c,l,h;a(e,Y,(e=>n(0,s=e))),a(e,j,(e=>n(1,i=e))),a(e,G,(e=>n(9,o=e))),a(e,z,(e=>n(2,r=e))),a(e,R,(e=>n(3,c=e))),a(e,Q,(e=>n(10,l=e))),a(e,B,(e=>n(4,h=e)));let d=0;function f(e){let t=(e-d)/1e3;d=e,u(j,i+=r*h*t,i),requestAnimationFrame(f)}function p(e){u(j,i-=R.purchase(e),i),u(Q,l++,l);let t=0;for(const e of c)e.isCps&&(t+=e.totalCoffeePerSecond);u(z,r=t,r)}y((()=>{requestAnimationFrame(f)}));return[s,i,r,c,h,p,function(){u(G,o++,o),u(j,i+=s,i)},e=>p(e.name)]}return new class extends class{$destroy(){!function(e,t){const n=e.$$;null!==n.fragment&&(s(n.on_destroy),n.fragment&&n.fragment.d(t),n.on_destroy=n.fragment=null,n.ctx=[])}(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}{constructor(e){super(),D(this,e,ie,ne,o,{})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map
