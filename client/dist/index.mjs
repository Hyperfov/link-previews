/** 
 * hyperfov-link-previews.js v1.0.0-beta
 * (c) 2021-2022 Christian Broms
 * MIT License
 */
var P=Object.defineProperty,O=Object.defineProperties;var T=Object.getOwnPropertyDescriptors;var b=Object.getOwnPropertySymbols;var S=Object.prototype.hasOwnProperty,C=Object.prototype.propertyIsEnumerable;var w=(n,t,r)=>t in n?P(n,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):n[t]=r,h=(n,t)=>{for(var r in t||={})S.call(t,r)&&w(n,r,t[r]);if(b)for(var r of b(t))C.call(t,r)&&w(n,r,t[r]);return n},k=(n,t)=>O(n,T(t));var l=n=>{console.log(`HYPERFOV LINK PREVIEWS >> ${n}`)},f=n=>{console.warn(`HYPERFOV LINK PREVIEWS >> ${n}`)},p=n=>{console.error(`HYPERFOV LINK PREVIEWS >> ${n}`)};var I=n=>typeof n=="string"?[...document.querySelectorAll(n)]:n instanceof Element?[n]:(p("unknown element type; must be one of String, Element, Element[]"),[]),c=I;var m=class extends HTMLElement{static get observedAttributes(){return["open","template","fetch","fetch-on-open","worker","content"]}constructor(){super(),this._shadow=this.attachShadow({mode:"open"}),this.retrievePage=this.retrievePage.bind(this),this.getAttrOrDefault=this.getAttrOrDefault.bind(this),this.renderContent=this.renderContent.bind(this),this.clearContent=this.clearContent.bind(this),this.renderTemplate=this.renderTemplate.bind(this),this.renderTextElement=this.renderTextElement.bind(this),this.renderImageElement=this.renderImageElement.bind(this),this.fetchOnHover=this.getAttrOrDefault("fetch-on-hover",!0,t=>t==="true"),this.fetch=this.getAttrOrDefault("fetch",!0,t=>t==="true"),this.open=this.getAttrOrDefault("open",!1,t=>t==="true"),this.worker=this.getAttrOrDefault("worker",null),this.template=this.getAttrOrDefault("template",null),this.templateElt=null,this.elements={},this.retrievedPage=!1,this.content=this.getAttrOrDefault("content",null,t=>JSON.parse(t)),this.renderContent(),this.contentRenderers={title:{render:t=>this.renderTextElement("title",t)},description:{render:t=>this.renderTextElement("description",t)},href:{render:t=>this.renderTextElement("href",t)},image:{render:t=>this.renderImageElement("image",t)},favicon:{render:t=>this.renderImageElement("favicon",t)}}}attributeChangedCallback(t){var r;if(t==="open")this.open=this.getAttrOrDefault(t,!1,e=>e==="true");else if(t==="fetch-on-hover")this.fetchOnHover=this.getAttrOrDefault(t,!0,e=>e==="true");else if(t==="fetch")this.fetch=this.getAttrOrDefault(t,!0,e=>e==="true");else if(t==="content"){let e=this.getAttrOrDefault(t,null,i=>JSON.parse(i));(e==null?void 0:e.href)!==((r=this.content)==null?void 0:r.href)&&this.clearContent(),this.content=e}else this[t]=this.getAttrOrDefault(t,null);this.renderContent()}clearContent(){for(let t in this.elements){try{this.removeChild(this.elements[t])}catch(r){}delete this.elements[t]}this.retrievedPage=!1}renderContent(){var t,r;this.templateElt||this.renderTemplate(),this.fetch&&this.worker&&!this.retrievedPage&&((t=this.content)==null?void 0:t.href)&&(!this.fetchOnHover||this.open)&&this.retrievePage();for(let e in this.content)(r=this.contentRenderers[e])==null||r.render(this.content[e])}renderTextElement(t,r){let e=this.elements[t];e||(e=document.createElement("span"),e.id=`lp-${t}`,e.setAttribute("slot",`lp-${t}`),this.appendChild(e),this.elements[t]=e),e.textContent=r}renderImageElement(t,r){let e=this.elements[t];if(!e){e=document.createElement("img"),e.id=`lp-${t}`,e.setAttribute("slot",`lp-${t}`);let o=new Image;o.src=r,o.onload=()=>{e.src=o.src,this.appendChild(e)},this.elements[t]=e}let i=new Image;i.src=r,i.onload=()=>{e.src=i.src}}renderTemplate(){if(this.template&&!this.templateElt){let t=c(this.template);t&&(this.templateElt=t[0].content,this._shadow.appendChild(this.templateElt.cloneNode(!0)))}}retrievePage(){var t,r;this.retrievedPage=!0,l(`Getting: ${(t=this.content)==null?void 0:t.href}`),fetch(`${this.worker}/?page=${(r=this.content)==null?void 0:r.href}`).then(e=>{e.ok&&e.json().then(i=>{for(let o in i)this.content[o]||(this.content[o]=i[o]);this.renderContent()})})}getAttrOrDefault(t,r,e=i=>i){if(this.hasAttribute(t))try{let i=this.getAttribute(t);return e(i)}catch(i){p(`could not parse attribute "${t}" with value ${val}`)}return r}},x=m;var u=n=>n&&typeof n=="object"&&!Array.isArray(n),s=(n,...t)=>{if(!t.length)return n;let r=t.shift();if(u(n)&&u(r))for(let e in r)u(r[e])?(n[e]||Object.assign(n,{[e]:{}}),s(n[e],r[e])):Object.assign(n,{[e]:r[e]});return s(n,...t)};import D,{followCursor as $}from"tippy.js";import"tippy.js/animations/shift-toward.css";import"tippy.js/animations/shift-away.css";import"tippy.js/animations/scale.css";import"tippy.js/animations/perspective.css";var y=()=>`
  <template id="hyperfov-link-preview-template">
  <style>
    .link-popup-wrapper {
      border: var(--lp-border, none);
      padding: var(--lp-padding, 0px);
      background: var(--lp-background, white);
      box-shadow: var(
        --lp-box-shadow,
        0px 5px 15px rgba(101, 101, 110, 0.3)
      );
      border-radius: var(--lp-border-radius, 6px);
      max-width: var(--lp-max-width, 300px);
      font-family: var(--lp-font-family, inherit);
      font-weight: var(--lp-font-weight, normal);
    }

    .link-interior-content div:first-child {
      padding-top: 5px;
    }

    .link-interior-content div:last-child {
      padding-bottom: 5px;
    }

    .link-image {
      flex-shrink: 0;
    }

    .link-url {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      padding: var(--lp-link-padding, 0 10px);
      font-weight: var(--lp-link-font-weight, normal);
      color: var(--lp-link-color, grey);
      font-size: var(--lp-link-font-size, 12px);
      font-family: var(--lp-link-font-family, inherit);
      border: var(--lp-link-border, none);
    }

    .link-title {
      padding: var(--lp-title-padding, 0 10px 3px 10px);
      font-weight: var(--lp-title-font-weight, bold);
      color: var(--lp-title-color, inherit);
      font-size: var(--lp-title-font-size, 16px);
      font-family: var(--lp-title-font-family, inherit);
      border: var(--lp-title-border, none);
    }

    .link-description {
      padding: var(--lp-description-padding, 0 10px 3px 10px);
      font-weight: var(--lp-description-font-weight, normal);
      color: var(--lp-description-color, inherit);
      font-size: var(--lp-description-font-size, 16px);
      font-family: var(--lp-description-font-family, inherit);
      border: var(--lp-description-border, none);
    }

    ::slotted(#lp-image) {
      max-width: 100%;
      border-radius: var(--lp-image-border-radius, 3px 3px 0 0);
      border: var(--lp-image-border, none);
      width: max-content;
      height: auto;
      object-fit: var(--lp-image-object-fit, cover);
      object-position: var(--lp-image-object-position, center center);
      max-height: var(--lp-image-max-height, 150px);
      display: inline-block !important;
      margin: 0 !important;
    }

    ::slotted(#lp-favicon) {
      max-height: 14px;
      max-width: 14px;
      margin: 0 !important;
      margin-right: 5px !important;
      display: inline-block !important;
      width: auto !important;
    }
  </style>
  <div class="link-popup-wrapper">
    <div class="link-image"><slot name="lp-image"></slot></div>
    <div class="link-interior-content">
      <div class="link-title">
        <slot name="lp-favicon"></slot>
        <slot name="lp-title"></slot>
      </div>
      <div class="link-description">
        <slot name="lp-description"></slot>
      </div>
      <div class="link-url"><slot name="lp-href"></slot></div>
    </div>
  </div>
</template>`;var g={content:null,worker:null,fetch:!0,fetchOnHover:!0,template:"basic",tippy:{placement:"bottom-start",animation:"shift-toward"}};customElements.define("link-preview",x);function H(n,t){if(t=s({},g,t),!window.matchMedia("(any-hover: hover)").matches)return l("this device doesn't support hover events; will not add any previews"),null;if(!t.worker&&t.fetch)return f("Missing `worker` in props, skipping. A worker url is required when `fetch` is true"),null;(!t.template||t.template==="basic")&&(document.body.insertAdjacentHTML("afterbegin",y()),t.template="#hyperfov-link-preview-template");let r=c(n),e=[];for(let i of r)if(!t.href&&!i.hasAttribute("href")&&!i.hasAttribute("xlink:href"))f("Element missing href, skipping. Add an href attribute to the element or pass through `href` in props.");else{let o=N(i,t),a=document.createElement("link-preview");E(a,o),document.body.appendChild(a);let v=j(i,a,o),A=d=>{E(a,s({},g,t,d)),d.tippy&&v.setProps(h({},d.tippy))};e.push({setProps:A,tippy:v})}return e.length>0?e:null}function E(n,t){if(t.href)try{let r=new URL(t.href.toString());t.content?t.content.href=r.toString():t.content={href:r.toString()}}catch(r){l(`Unable to parse url ${t.href}`)}n.setAttribute("content",JSON.stringify(t.content)),t.template&&n.setAttribute("template",t.template.toString()),t.worker&&n.setAttribute("worker",t.worker.toString()),t.fetch&&n.setAttribute("fetch",t.fetch.toString()),t.fetchOnHover&&n.setAttribute("fetch-on-hover",t.fetchOnHover.toString())}function N(n,t){let r=h({},t);for(let e of n.attributes){let i=n.getAttribute(e.nodeName);if(e.nodeName==="href"||e.nodeName==="xlink:href")try{let o=new URL(i);r.content?r.content.href=o.toString():r.content={href:o.toString()}}catch(o){l(`Unable to parse url ${t.href}`)}else if(e.nodeName.includes("lp-")){let o=e.nodeName.replace("lp-","").replace("xlink:","");r.content||(r.content={}),r.content[o]=i}}return r}function j(n,t,r){return D(n,k(h({content:t},r.tippy),{plugins:[$],onShow:()=>{t.setAttribute("open","true")},onHide:()=>{t.setAttribute("open","false")},allowHTML:!0}))}l("running");window.linkPreview=H;export{x as LinkPreview,H as linkPreview};
