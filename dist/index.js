(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.app = factory());
})(this, (function () { 'use strict';

    function noop() { }
    const identity = x => x;
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    // unfortunately this can't be a constant as that wouldn't be tree-shakeable
    // so we cache the result instead
    let crossorigin;
    function is_crossorigin() {
        if (crossorigin === undefined) {
            crossorigin = false;
            try {
                if (typeof window !== 'undefined' && window.parent) {
                    void window.parent.document;
                }
            }
            catch (error) {
                crossorigin = true;
            }
        }
        return crossorigin;
    }
    function add_resize_listener(node, fn) {
        const computed_style = getComputedStyle(node);
        if (computed_style.position === 'static') {
            node.style.position = 'relative';
        }
        const iframe = element('iframe');
        iframe.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; ' +
            'overflow: hidden; border: 0; opacity: 0; pointer-events: none; z-index: -1;');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        const crossorigin = is_crossorigin();
        let unsubscribe;
        if (crossorigin) {
            iframe.src = "data:text/html,<script>onresize=function(){parent.postMessage(0,'*')}</script>";
            unsubscribe = listen(window, 'message', (event) => {
                if (event.source === iframe.contentWindow)
                    fn();
            });
        }
        else {
            iframe.src = 'about:blank';
            iframe.onload = () => {
                unsubscribe = listen(iframe.contentWindow, 'resize', fn);
            };
        }
        append(node, iframe);
        return () => {
            if (crossorigin) {
                unsubscribe();
            }
            else if (unsubscribe && iframe.contentWindow) {
                unsubscribe();
            }
            detach(iframe);
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    function attribute_to_object(attributes) {
        const result = {};
        for (const attribute of attributes) {
            result[attribute.name] = attribute.value;
        }
        return result;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                const { on_mount } = this.$$;
                this.$$.on_disconnect = on_mount.map(run).filter(is_function);
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            disconnectedCallback() {
                run_all(this.$$.on_disconnect);
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set($$props) {
                if (this.$$set && !is_empty($$props)) {
                    this.$$.skip_bound = true;
                    this.$$set($$props);
                    this.$$.skip_bound = false;
                }
            }
        };
    }

    function cubicIn(t) {
        return t * t * t;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/Component.svelte generated by Svelte v3.43.0 */

    function create_if_block(ctx) {
    	let a;
    	let div1;
    	let style;
    	let t1;
    	let div0;
    	let t2;
    	let t3;
    	let div0_resize_listener;
    	let div1_transition;
    	let current;
    	let if_block0 = (/*showContent*/ ctx[10] || /*showImg*/ ctx[11]) && create_if_block_3(ctx);
    	let if_block1 = /*node*/ ctx[2] && create_if_block_2(ctx);
    	let if_block2 = /*external*/ ctx[4] && create_if_block_1(ctx);

    	return {
    		c() {
    			a = element("a");
    			div1 = element("div");
    			style = element("style");
    			style.textContent = ".link-content p {\n\t\t\t\t\t\tmargin: 0;\n\t\t\t\t\t\tmargin-bottom: 10px;\n\t\t\t\t\t}\n\n\t\t\t\t\t.link-content a {\n\t\t\t\t\t\tcolor: black;\n\t\t\t\t\t\tpointer-events: none;\n\t\t\t\t\t\ttext-decoration: none;\n\t\t\t\t\t\tfont-size: 16px !important;\n\t\t\t\t\t}";
    			t1 = space();
    			div0 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			attr(div0, "class", "link");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[17].call(div0));
    			attr(div1, "class", "preview");
    			set_style(div1, "position", "fixed");
    			set_style(div1, "top", /*top*/ ctx[7] + "px");
    			set_style(div1, "left", /*left*/ ctx[8] + "px");
    			set_style(div1, "height", /*height*/ ctx[12] + "px");
    			set_style(div1, "width", /*width*/ ctx[13] + "px");
    			toggle_class(div1, "external", /*external*/ ctx[4]);
    			attr(a, "href", /*href*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, a, anchor);
    			append(a, div1);
    			append(div1, style);
    			append(div1, t1);
    			append(div1, div0);
    			if (if_block0) if_block0.m(div0, null);
    			append(div0, t2);
    			if (if_block1) if_block1.m(div0, null);
    			append(div0, t3);
    			if (if_block2) if_block2.m(div0, null);
    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[17].bind(div0));
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (/*showContent*/ ctx[10] || /*showImg*/ ctx[11]) if_block0.p(ctx, dirty);

    			if (/*node*/ ctx[2]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div0, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*external*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*top*/ 128) {
    				set_style(div1, "top", /*top*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*left*/ 256) {
    				set_style(div1, "left", /*left*/ ctx[8] + "px");
    			}

    			if (dirty & /*external*/ 16) {
    				toggle_class(div1, "external", /*external*/ ctx[4]);
    			}

    			if (!current || dirty & /*href*/ 1) {
    				attr(a, "href", /*href*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 150, easing: cubicIn }, true);
    				div1_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, fade, { duration: 150, easing: cubicIn }, false);
    			div1_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(a);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			div0_resize_listener();
    			if (detaching && div1_transition) div1_transition.end();
    		}
    	};
    }

    // (92:5) {#if showContent || showImg}
    function create_if_block_3(ctx) {
    	let div;
    	let t;
    	let if_block0 = /*showContent*/ ctx[10] && create_if_block_5(ctx);
    	let if_block1 = /*showImg*/ ctx[11] && create_if_block_4(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(div, "class", "link-content-wrapper");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t);
    			if (if_block1) if_block1.m(div, null);
    		},
    		p(ctx, dirty) {
    			if (/*showContent*/ ctx[10]) if_block0.p(ctx, dirty);
    			if (/*showImg*/ ctx[11]) if_block1.p(ctx, dirty);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    }

    // (94:7) {#if showContent}
    function create_if_block_5(ctx) {
    	let div;

    	return {
    		c() {
    			div = element("div");
    			attr(div, "class", "link-content");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			div.innerHTML = /*content*/ ctx[1];
    		},
    		p(ctx, dirty) {
    			if (dirty & /*content*/ 2) div.innerHTML = /*content*/ ctx[1];		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (97:7) {#if showImg}
    function create_if_block_4(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", "link-image");
    			if (!src_url_equal(img.src, img_src_value = /*imgsrc*/ ctx[3])) attr(img, "src", img_src_value);
    			attr(img, "alt", /*node*/ ctx[2]);
    			toggle_class(img, "left", /*showContent*/ ctx[10]);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*imgsrc*/ 8 && !src_url_equal(img.src, img_src_value = /*imgsrc*/ ctx[3])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*node*/ 4) {
    				attr(img, "alt", /*node*/ ctx[2]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    // (102:5) {#if node}
    function create_if_block_2(ctx) {
    	let div;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(/*node*/ ctx[2]);
    			attr(div, "class", "link-node");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*node*/ 4) set_data(t, /*node*/ ctx[2]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (105:5) {#if external}
    function create_if_block_1(ctx) {
    	let div;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(/*href*/ ctx[0]);
    			attr(div, "class", "link-url");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*href*/ 1) set_data(t, /*href*/ ctx[0]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let span1;
    	let span0;
    	let a;
    	let slot;
    	let a_target_value;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*visible*/ ctx[6] && create_if_block(ctx);

    	return {
    		c() {
    			span1 = element("span");
    			span0 = element("span");
    			a = element("a");
    			slot = element("slot");
    			t = space();
    			if (if_block) if_block.c();
    			this.c = noop;
    			attr(a, "href", /*href*/ ctx[0]);
    			attr(a, "target", a_target_value = /*external*/ ctx[4] ? 'blank' : '');
    			toggle_class(a, "external", /*external*/ ctx[4]);
    			attr(span1, "class", "preview-wrapper");
    		},
    		m(target, anchor) {
    			insert(target, span1, anchor);
    			append(span1, span0);
    			append(span0, a);
    			append(a, slot);
    			/*a_binding*/ ctx[16](a);
    			append(span1, t);
    			if (if_block) if_block.m(span1, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(span0, "mouseover", /*toggleOn*/ ctx[14]),
    					listen(span0, "focus", /*toggleOn*/ ctx[14]),
    					listen(span0, "mouseout", /*toggleOff*/ ctx[15]),
    					listen(span0, "blur", /*toggleOff*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (!current || dirty & /*href*/ 1) {
    				attr(a, "href", /*href*/ ctx[0]);
    			}

    			if (!current || dirty & /*external*/ 16 && a_target_value !== (a_target_value = /*external*/ ctx[4] ? 'blank' : '')) {
    				attr(a, "target", a_target_value);
    			}

    			if (dirty & /*external*/ 16) {
    				toggle_class(a, "external", /*external*/ ctx[4]);
    			}

    			if (/*visible*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*visible*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(span1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span1);
    			/*a_binding*/ ctx[16](null);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { href } = $$props;
    	let { content } = $$props;
    	let { node } = $$props;
    	let { imgsrc } = $$props;
    	let { external = false } = $$props;
    	let visible = false;
    	let top;
    	let left;
    	const showContent = content && content !== 'null';
    	const showImg = imgsrc && imgsrc !== 'null';
    	const height = showContent ? 172 : 60;
    	const width = showContent && showImg ? 400 : 272;
    	let renderedHeight = height;
    	let element;

    	const positionPreview = actualHeight => {
    		if (element) {
    			const linkPos = element.getBoundingClientRect();

    			// keep the previews a bit away from the sides
    			const addedMargin = 40;

    			const fullWidth = width + addedMargin;
    			const fullHeight = actualHeight + addedMargin;
    			const windowWidth = window.innerWidth;
    			const windowHeight = window.innerHeight;

    			if (windowWidth - linkPos.x < fullWidth) {
    				$$invalidate(8, left = windowWidth - fullWidth);
    			} else {
    				$$invalidate(8, left = linkPos.x);
    			}

    			if (windowHeight - (linkPos.y + linkPos.height) < fullHeight) {
    				$$invalidate(7, top = linkPos.y - actualHeight - linkPos.height + 5);
    			} else {
    				$$invalidate(7, top = linkPos.y + linkPos.height);
    			}
    		}
    	};

    	const toggleOn = () => {
    		positionPreview(renderedHeight);
    		$$invalidate(6, visible = true);
    	};

    	const toggleOff = () => {
    		$$invalidate(6, visible = false);
    	};

    	function a_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	function div0_elementresize_handler() {
    		renderedHeight = this.clientHeight;
    		$$invalidate(5, renderedHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('content' in $$props) $$invalidate(1, content = $$props.content);
    		if ('node' in $$props) $$invalidate(2, node = $$props.node);
    		if ('imgsrc' in $$props) $$invalidate(3, imgsrc = $$props.imgsrc);
    		if ('external' in $$props) $$invalidate(4, external = $$props.external);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*renderedHeight*/ 32) {
    			{
    				// reposition when height changes
    				positionPreview(renderedHeight);
    			}
    		}
    	};

    	return [
    		href,
    		content,
    		node,
    		imgsrc,
    		external,
    		renderedHeight,
    		visible,
    		top,
    		left,
    		element,
    		showContent,
    		showImg,
    		height,
    		width,
    		toggleOn,
    		toggleOff,
    		a_binding,
    		div0_elementresize_handler
    	];
    }

    class Component extends SvelteElement {
    	constructor(options) {
    		super();
    		this.shadowRoot.innerHTML = `<style>.preview-wrapper{--internal:#a31621;--external:#1d31e2}.preview{z-index:1000;--color:var(--internal)}.preview.external{--color:var(--external)}.link{max-width:100%;background-color:white;color:black;text-decoration:none;padding:10px;border:2px solid var(--color);border-bottom:4px solid var(--color);margin-top:5px;border-radius:10px;font-weight:normal;font-style:normal}.link-content{font-size:16px;line-height:110%;display:inline-block;position:relative;height:120px;overflow:hidden}.link-node{color:var(--color);font-family:var(--sans);font-weight:bold}.link-content-wrapper{display:flex;border-bottom:1px solid var(--color);margin-bottom:5px}.link-image{height:120px;object-fit:cover;object-position:center center;width:100%;min-width:150px}.link-image.left{padding-left:10px}.link-url{font-size:12px;font-family:var(--sans)}.link-content::after{content:'';position:absolute;bottom:0;left:0;width:275px;height:50px;background-image:linear-gradient(transparent, white)}a{color:black;transition:color 0.3s;font-size:18px;line-height:125%}a.external:hover{color:var(--external) !important}a:hover{color:var(--internal) !important}a:visited{color:black}</style>`;

    		init(
    			this,
    			{
    				target: this.shadowRoot,
    				props: attribute_to_object(this.attributes),
    				customElement: true
    			},
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				href: 0,
    				content: 1,
    				node: 2,
    				imgsrc: 3,
    				external: 4
    			},
    			null
    		);

    		if (options) {
    			if (options.target) {
    				insert(options.target, this, options.anchor);
    			}

    			if (options.props) {
    				this.$set(options.props);
    				flush();
    			}
    		}
    	}

    	static get observedAttributes() {
    		return ["href", "content", "node", "imgsrc", "external"];
    	}

    	get href() {
    		return this.$$.ctx[0];
    	}

    	set href(href) {
    		this.$$set({ href });
    		flush();
    	}

    	get content() {
    		return this.$$.ctx[1];
    	}

    	set content(content) {
    		this.$$set({ content });
    		flush();
    	}

    	get node() {
    		return this.$$.ctx[2];
    	}

    	set node(node) {
    		this.$$set({ node });
    		flush();
    	}

    	get imgsrc() {
    		return this.$$.ctx[3];
    	}

    	set imgsrc(imgsrc) {
    		this.$$set({ imgsrc });
    		flush();
    	}

    	get external() {
    		return this.$$.ctx[4];
    	}

    	set external(external) {
    		this.$$set({ external });
    		flush();
    	}
    }

    customElements.define("page-preview", Component);

    console.log("HELLO");

    return Component;

}));
//# sourceMappingURL=index.js.map
