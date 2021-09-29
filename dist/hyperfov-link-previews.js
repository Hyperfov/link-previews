(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.HyperfovLinkPreviews = {}));
})(this, (function (exports) { 'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
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
    function append_styles(target, style_sheet_id, styles) {
        const append_styles_to = get_root_for_style(target);
        if (!append_styles_to.getElementById(style_sheet_id)) {
            const style = element('style');
            style.id = style_sheet_id;
            style.textContent = styles;
            append_stylesheet(append_styles_to, style);
        }
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
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
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
    function create_component(block) {
        block && block.c();
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
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
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
    }

    /* src/Wrapper.svelte generated by Svelte v3.43.0 */

    function add_css$1(target) {
    	append_styles(target, "svelte-nmotuc", ".preview.svelte-nmotuc{z-index:1000;position:absolute;transition:opacity 0.5s;visibility:hidden;opacity:0}.preview.visible.svelte-nmotuc{opacity:1;visibility:visible}.hyperfov-preview-element-wrapper.svelte-nmotuc{font-family:sans-serif;color:black;max-width:100%;text-decoration:none;padding:10px;margin-top:5px;font-weight:normal;font-style:normal;font-size:14px;border:1px solid black;background-color:white}.preview-wrapper.svelte-nmotuc{position:absolute}");
    }

    function create_fragment$2(ctx) {
    	let span;
    	let t;
    	let div1;
    	let div0;
    	let div0_resize_listener;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[17].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[16], null);

    	return {
    		c() {
    			span = element("span");
    			t = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			attr(span, "class", "preview-wrapper svelte-nmotuc");
    			set_style(span, "top", /*eltPos*/ ctx[0].y + "px");
    			set_style(span, "left", /*eltPos*/ ctx[0].x + "px");
    			set_style(span, "height", /*eltPos*/ ctx[0].height + "px");
    			set_style(span, "width", /*eltPos*/ ctx[0].width + "px");
    			attr(div0, "class", "hyperfov-preview-element-wrapper svelte-nmotuc");
    			add_render_callback(() => /*div0_elementresize_handler*/ ctx[19].call(div0));
    			attr(div1, "class", "preview svelte-nmotuc");
    			set_style(div1, "top", /*top*/ ctx[5] + "px");
    			set_style(div1, "left", /*left*/ ctx[6] + "px");
    			set_style(div1, "height", /*height*/ ctx[7] + "px");
    			set_style(div1, "width", /*width*/ ctx[8] + "px");
    			attr(div1, "id", /*id*/ ctx[1]);
    			toggle_class(div1, "visible", /*visible*/ ctx[4]);
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			/*span_binding*/ ctx[18](span);
    			insert(target, t, anchor);
    			insert(target, div1, anchor);
    			append(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			div0_resize_listener = add_resize_listener(div0, /*div0_elementresize_handler*/ ctx[19].bind(div0));
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(span, "mouseover", /*toggleOn*/ ctx[11]),
    					listen(span, "mousemove", function () {
    						if (is_function(/*position*/ ctx[2] === "cursor"
    						? /*onMove*/ ctx[10]
    						: null)) (/*position*/ ctx[2] === "cursor"
    						? /*onMove*/ ctx[10]
    						: null).apply(this, arguments);
    					}),
    					listen(span, "focus", /*toggleOn*/ ctx[11]),
    					listen(span, "mouseout", /*toggleOff*/ ctx[12]),
    					listen(span, "blur", /*toggleOff*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!current || dirty & /*eltPos*/ 1) {
    				set_style(span, "top", /*eltPos*/ ctx[0].y + "px");
    			}

    			if (!current || dirty & /*eltPos*/ 1) {
    				set_style(span, "left", /*eltPos*/ ctx[0].x + "px");
    			}

    			if (!current || dirty & /*eltPos*/ 1) {
    				set_style(span, "height", /*eltPos*/ ctx[0].height + "px");
    			}

    			if (!current || dirty & /*eltPos*/ 1) {
    				set_style(span, "width", /*eltPos*/ ctx[0].width + "px");
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 65536)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[16],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[16])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[16], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*top*/ 32) {
    				set_style(div1, "top", /*top*/ ctx[5] + "px");
    			}

    			if (!current || dirty & /*left*/ 64) {
    				set_style(div1, "left", /*left*/ ctx[6] + "px");
    			}

    			if (!current || dirty & /*height*/ 128) {
    				set_style(div1, "height", /*height*/ ctx[7] + "px");
    			}

    			if (!current || dirty & /*width*/ 256) {
    				set_style(div1, "width", /*width*/ ctx[8] + "px");
    			}

    			if (!current || dirty & /*id*/ 2) {
    				attr(div1, "id", /*id*/ ctx[1]);
    			}

    			if (dirty & /*visible*/ 16) {
    				toggle_class(div1, "visible", /*visible*/ ctx[4]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			/*span_binding*/ ctx[18](null);
    			if (detaching) detach(t);
    			if (detaching) detach(div1);
    			if (default_slot) default_slot.d(detaching);
    			div0_resize_listener();
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { showContent } = $$props;
    	let { showImg } = $$props;
    	let { eltPos } = $$props;
    	let { id } = $$props;
    	let { position } = $$props;
    	let { fetchData } = $$props;
    	let cursorPos;
    	let visible = false;
    	let top;
    	let left;
    	let height = showContent ? 172 : 60;
    	let width = showContent && showImg ? 400 : 272;
    	let renderedHeight = height;
    	let element;

    	const positionPreview = actualHeight => {
    		// keep the previews a bit away from the sides
    		const addedMargin = 40;

    		if (cursorPos) {
    			$$invalidate(5, top = cursorPos.y + addedMargin / 2);
    			$$invalidate(6, left = cursorPos.x + addedMargin / 2);
    		} else if (element) {
    			const linkPos = element.getBoundingClientRect();
    			const fullWidth = width + addedMargin;
    			const fullHeight = actualHeight + addedMargin;
    			const windowWidth = window.innerWidth;
    			const windowHeight = window.innerHeight;

    			if (windowWidth - linkPos.x < fullWidth) {
    				$$invalidate(6, left = windowWidth - fullWidth + window.scrollX);
    			} else {
    				$$invalidate(6, left = linkPos.x + window.scrollX);
    			}

    			if (windowHeight - (linkPos.y + linkPos.height) < fullHeight) {
    				$$invalidate(5, top = linkPos.y - actualHeight - linkPos.height + 5 + window.scrollY);
    			} else {
    				$$invalidate(5, top = linkPos.y + linkPos.height + window.scrollY);
    			}
    		}
    	};

    	const onMove = e => {
    		cursorPos = {
    			x: e.clientX + window.scrollX,
    			y: e.clientY + window.scrollY
    		};

    		positionPreview(renderedHeight);
    	};

    	const toggleOn = () => {
    		if (fetchData) fetchData();
    		positionPreview(renderedHeight);
    		$$invalidate(4, visible = true);
    	};

    	const toggleOff = () => {
    		$$invalidate(4, visible = false);
    	};

    	function span_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			element = $$value;
    			$$invalidate(9, element);
    		});
    	}

    	function div0_elementresize_handler() {
    		renderedHeight = this.clientHeight;
    		$$invalidate(3, renderedHeight);
    	}

    	$$self.$$set = $$props => {
    		if ('showContent' in $$props) $$invalidate(13, showContent = $$props.showContent);
    		if ('showImg' in $$props) $$invalidate(14, showImg = $$props.showImg);
    		if ('eltPos' in $$props) $$invalidate(0, eltPos = $$props.eltPos);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    		if ('fetchData' in $$props) $$invalidate(15, fetchData = $$props.fetchData);
    		if ('$$scope' in $$props) $$invalidate(16, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*showContent, showImg*/ 24576) {
    			{
    				$$invalidate(7, height = showContent ? 172 : 60);
    				$$invalidate(8, width = showContent && showImg ? 400 : 272);
    			}
    		}

    		if ($$self.$$.dirty & /*renderedHeight*/ 8) {
    			{
    				// reposition when height changes
    				positionPreview(renderedHeight);
    			}
    		}
    	};

    	return [
    		eltPos,
    		id,
    		position,
    		renderedHeight,
    		visible,
    		top,
    		left,
    		height,
    		width,
    		element,
    		onMove,
    		toggleOn,
    		toggleOff,
    		showContent,
    		showImg,
    		fetchData,
    		$$scope,
    		slots,
    		span_binding,
    		div0_elementresize_handler
    	];
    }

    class Wrapper extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$2,
    			create_fragment$2,
    			safe_not_equal,
    			{
    				showContent: 13,
    				showImg: 14,
    				eltPos: 0,
    				id: 1,
    				position: 2,
    				fetchData: 15
    			},
    			add_css$1
    		);
    	}
    }

    function cubicIn(t) {
        return t * t * t;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/Interior.svelte generated by Svelte v3.43.0 */

    function add_css(target) {
    	append_styles(target, "svelte-1edsy5l", ".hyperfov-link-title.svelte-1edsy5l{font-weight:bold}.hyperfov-link-content-wrapper.svelte-1edsy5l{display:flex;margin-bottom:15px}.hyperfov-link-image.svelte-1edsy5l{height:120px;object-fit:cover;object-position:center center;width:100%;min-width:150px}.hyperfov-link-image.left.svelte-1edsy5l{padding-left:10px}.hyperfov-link-url.svelte-1edsy5l{font-size:12px;color:grey;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.hyperfov-link-content.svelte-1edsy5l{display:inline-block;position:relative;height:120px;overflow:hidden;background-color:white}.hyperfov-link-content.svelte-1edsy5l::after{content:\"\";position:absolute;bottom:0;left:0;width:275px;height:50px;background-image:linear-gradient(#ffffff00, #ffffff)}.hyperfov-loading.svelte-1edsy5l{width:5px;height:5px;background-color:black;border-radius:50%;animation:svelte-1edsy5l-fade 1s ease infinite;margin-bottom:2px;display:inline-block}@keyframes svelte-1edsy5l-fade{from{opacity:1}to{opacity:0.1}}");
    }

    // (14:0) {#if showContent || showImg}
    function create_if_block_2(ctx) {
    	let div;
    	let t;
    	let div_transition;
    	let current;
    	let if_block0 = /*showContent*/ ctx[0] && create_if_block_4(ctx);
    	let if_block1 = /*showImg*/ ctx[1] && create_if_block_3(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			attr(div, "class", "hyperfov-link-content-wrapper svelte-1edsy5l");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append(div, t);
    			if (if_block1) if_block1.m(div, null);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*showContent*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div, t);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*showImg*/ ctx[1]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 300, easing: cubicIn }, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, { duration: 300, easing: cubicIn }, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching && div_transition) div_transition.end();
    		}
    	};
    }

    // (19:4) {#if showContent}
    function create_if_block_4(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let if_block = /*title*/ ctx[4] && create_if_block_5(ctx);

    	return {
    		c() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			t1 = text(/*content*/ ctx[2]);
    			attr(div, "class", "hyperfov-link-content svelte-1edsy5l");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append(div, t0);
    			append(div, t1);
    		},
    		p(ctx, dirty) {
    			if (/*title*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_5(ctx);
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*content*/ 4) set_data(t1, /*content*/ ctx[2]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block) if_block.d();
    		}
    	};
    }

    // (21:8) {#if title}
    function create_if_block_5(ctx) {
    	let div;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(/*title*/ ctx[4]);
    			attr(div, "class", "hyperfov-link-title svelte-1edsy5l");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*title*/ 16) set_data(t, /*title*/ ctx[4]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (27:4) {#if showImg}
    function create_if_block_3(ctx) {
    	let img;
    	let img_src_value;

    	return {
    		c() {
    			img = element("img");
    			attr(img, "class", "hyperfov-link-image svelte-1edsy5l");
    			if (!src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) attr(img, "src", img_src_value);
    			attr(img, "alt", /*title*/ ctx[4]);
    			toggle_class(img, "left", /*showContent*/ ctx[0]);
    		},
    		m(target, anchor) {
    			insert(target, img, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*imgSrc*/ 8 && !src_url_equal(img.src, img_src_value = /*imgSrc*/ ctx[3])) {
    				attr(img, "src", img_src_value);
    			}

    			if (dirty & /*title*/ 16) {
    				attr(img, "alt", /*title*/ ctx[4]);
    			}

    			if (dirty & /*showContent*/ 1) {
    				toggle_class(img, "left", /*showContent*/ ctx[0]);
    			}
    		},
    		d(detaching) {
    			if (detaching) detach(img);
    		}
    	};
    }

    // (38:0) {#if !showContent && title}
    function create_if_block_1(ctx) {
    	let div;
    	let t;

    	return {
    		c() {
    			div = element("div");
    			t = text(/*title*/ ctx[4]);
    			attr(div, "class", "hyperfov-link-title svelte-1edsy5l");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*title*/ 16) set_data(t, /*title*/ ctx[4]);
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    		}
    	};
    }

    // (42:2) {#if fetching || fetching === null}
    function create_if_block(ctx) {
    	let span;
    	let span_transition;
    	let current;

    	return {
    		c() {
    			span = element("span");
    			attr(span, "class", "hyperfov-loading svelte-1edsy5l");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			current = true;
    		},
    		p(new_ctx, dirty) {
    		},
    		i(local) {
    			if (current) return;

    			add_render_callback(() => {
    				if (!span_transition) span_transition = create_bidirectional_transition(span, slide, { duration: 300, easing: cubicIn }, true);
    				span_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			if (!span_transition) span_transition = create_bidirectional_transition(span, slide, { duration: 300, easing: cubicIn }, false);
    			span_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    			if (detaching && span_transition) span_transition.end();
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let t0;
    	let t1;
    	let div;
    	let t2;
    	let t3;
    	let current;
    	let if_block0 = (/*showContent*/ ctx[0] || /*showImg*/ ctx[1]) && create_if_block_2(ctx);
    	let if_block1 = !/*showContent*/ ctx[0] && /*title*/ ctx[4] && create_if_block_1(ctx);
    	let if_block2 = (/*fetching*/ ctx[6] || /*fetching*/ ctx[6] === null) && create_if_block();

    	return {
    		c() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div = element("div");
    			if (if_block2) if_block2.c();
    			t2 = space();
    			t3 = text(/*href*/ ctx[5]);
    			attr(div, "class", "hyperfov-link-url svelte-1edsy5l");
    		},
    		m(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert(target, t0, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t1, anchor);
    			insert(target, div, anchor);
    			if (if_block2) if_block2.m(div, null);
    			append(div, t2);
    			append(div, t3);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*showContent*/ ctx[0] || /*showImg*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*showContent, showImg*/ 3) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*showContent*/ ctx[0] && /*title*/ ctx[4]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1(ctx);
    					if_block1.c();
    					if_block1.m(t1.parentNode, t1);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*fetching*/ ctx[6] || /*fetching*/ ctx[6] === null) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*fetching*/ 64) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block();
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*href*/ 32) set_data(t3, /*href*/ ctx[5]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block2);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block0);
    			transition_out(if_block2);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach(t0);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t1);
    			if (detaching) detach(div);
    			if (if_block2) if_block2.d();
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { showContent } = $$props;
    	let { showImg } = $$props;
    	let { content } = $$props;
    	let { imgSrc } = $$props;
    	let { title } = $$props;
    	let { href } = $$props;
    	let { fetching } = $$props;

    	$$self.$$set = $$props => {
    		if ('showContent' in $$props) $$invalidate(0, showContent = $$props.showContent);
    		if ('showImg' in $$props) $$invalidate(1, showImg = $$props.showImg);
    		if ('content' in $$props) $$invalidate(2, content = $$props.content);
    		if ('imgSrc' in $$props) $$invalidate(3, imgSrc = $$props.imgSrc);
    		if ('title' in $$props) $$invalidate(4, title = $$props.title);
    		if ('href' in $$props) $$invalidate(5, href = $$props.href);
    		if ('fetching' in $$props) $$invalidate(6, fetching = $$props.fetching);
    	};

    	return [showContent, showImg, content, imgSrc, title, href, fetching];
    }

    class Interior extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				showContent: 0,
    				showImg: 1,
    				content: 2,
    				imgSrc: 3,
    				title: 4,
    				href: 5,
    				fetching: 6
    			},
    			add_css
    		);
    	}
    }

    /**
     * Implementation of atob() according to the HTML and Infra specs, except that
     * instead of throwing INVALID_CHARACTER_ERR we return null.
     */
    function atob$1(data) {
      // Web IDL requires DOMStrings to just be converted using ECMAScript
      // ToString, which in our case amounts to using a template literal.
      data = `${data}`;
      // "Remove all ASCII whitespace from data."
      data = data.replace(/[ \t\n\f\r]/g, "");
      // "If data's length divides by 4 leaving no remainder, then: if data ends
      // with one or two U+003D (=) code points, then remove them from data."
      if (data.length % 4 === 0) {
        data = data.replace(/==?$/, "");
      }
      // "If data's length divides by 4 leaving a remainder of 1, then return
      // failure."
      //
      // "If data contains a code point that is not one of
      //
      // U+002B (+)
      // U+002F (/)
      // ASCII alphanumeric
      //
      // then return failure."
      if (data.length % 4 === 1 || /[^+/0-9A-Za-z]/.test(data)) {
        return null;
      }
      // "Let output be an empty byte sequence."
      let output = "";
      // "Let buffer be an empty buffer that can have bits appended to it."
      //
      // We append bits via left-shift and or.  accumulatedBits is used to track
      // when we've gotten to 24 bits.
      let buffer = 0;
      let accumulatedBits = 0;
      // "Let position be a position variable for data, initially pointing at the
      // start of data."
      //
      // "While position does not point past the end of data:"
      for (let i = 0; i < data.length; i++) {
        // "Find the code point pointed to by position in the second column of
        // Table 1: The Base 64 Alphabet of RFC 4648. Let n be the number given in
        // the first cell of the same row.
        //
        // "Append to buffer the six bits corresponding to n, most significant bit
        // first."
        //
        // atobLookup() implements the table from RFC 4648.
        buffer <<= 6;
        buffer |= atobLookup(data[i]);
        accumulatedBits += 6;
        // "If buffer has accumulated 24 bits, interpret them as three 8-bit
        // big-endian numbers. Append three bytes with values equal to those
        // numbers to output, in the same order, and then empty buffer."
        if (accumulatedBits === 24) {
          output += String.fromCharCode((buffer & 0xff0000) >> 16);
          output += String.fromCharCode((buffer & 0xff00) >> 8);
          output += String.fromCharCode(buffer & 0xff);
          buffer = accumulatedBits = 0;
        }
        // "Advance position by 1."
      }
      // "If buffer is not empty, it contains either 12 or 18 bits. If it contains
      // 12 bits, then discard the last four and interpret the remaining eight as
      // an 8-bit big-endian number. If it contains 18 bits, then discard the last
      // two and interpret the remaining 16 as two 8-bit big-endian numbers. Append
      // the one or two bytes with values equal to those one or two numbers to
      // output, in the same order."
      if (accumulatedBits === 12) {
        buffer >>= 4;
        output += String.fromCharCode(buffer);
      } else if (accumulatedBits === 18) {
        buffer >>= 2;
        output += String.fromCharCode((buffer & 0xff00) >> 8);
        output += String.fromCharCode(buffer & 0xff);
      }
      // "Return output."
      return output;
    }
    /**
     * A lookup table for atob(), which converts an ASCII character to the
     * corresponding six-bit number.
     */

    const keystr$1 =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function atobLookup(chr) {
      const index = keystr$1.indexOf(chr);
      // Throw exception if character is not in the lookup string; should not be hit in tests
      return index < 0 ? undefined : index;
    }

    var atob_1 = atob$1;

    /**
     * btoa() as defined by the HTML and Infra specs, which mostly just references
     * RFC 4648.
     */
    function btoa$1(s) {
      let i;
      // String conversion as required by Web IDL.
      s = `${s}`;
      // "The btoa() method must throw an "InvalidCharacterError" DOMException if
      // data contains any character whose code point is greater than U+00FF."
      for (i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) > 255) {
          return null;
        }
      }
      let out = "";
      for (i = 0; i < s.length; i += 3) {
        const groupsOfSix = [undefined, undefined, undefined, undefined];
        groupsOfSix[0] = s.charCodeAt(i) >> 2;
        groupsOfSix[1] = (s.charCodeAt(i) & 0x03) << 4;
        if (s.length > i + 1) {
          groupsOfSix[1] |= s.charCodeAt(i + 1) >> 4;
          groupsOfSix[2] = (s.charCodeAt(i + 1) & 0x0f) << 2;
        }
        if (s.length > i + 2) {
          groupsOfSix[2] |= s.charCodeAt(i + 2) >> 6;
          groupsOfSix[3] = s.charCodeAt(i + 2) & 0x3f;
        }
        for (let j = 0; j < groupsOfSix.length; j++) {
          if (typeof groupsOfSix[j] === "undefined") {
            out += "=";
          } else {
            out += btoaLookup(groupsOfSix[j]);
          }
        }
      }
      return out;
    }

    /**
     * Lookup table for btoa(), which converts a six-bit number into the
     * corresponding ASCII character.
     */
    const keystr =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function btoaLookup(index) {
      if (index >= 0 && index < 64) {
        return keystr[index];
      }

      // Throw INVALID_CHARACTER_ERR exception here -- won't be hit in the tests.
      return undefined;
    }

    var btoa_1 = btoa$1;

    const atob = atob_1;
    const btoa = btoa_1;

    var abab = {
      atob,
      btoa
    };

    /* src/LinkPreview.wc.svelte generated by Svelte v3.43.0 */

    function create_default_slot(ctx) {
    	let interior;
    	let current;

    	interior = new Interior({
    			props: {
    				showContent: /*showContent*/ ctx[8],
    				showImg: /*showImg*/ ctx[7],
    				content: /*content*/ ctx[4],
    				title: /*title*/ ctx[6],
    				href: /*href*/ ctx[0],
    				imgSrc: /*imgSrc*/ ctx[5],
    				fetching: /*fetching*/ ctx[9]
    			}
    		});

    	return {
    		c() {
    			create_component(interior.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(interior, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const interior_changes = {};
    			if (dirty & /*showContent*/ 256) interior_changes.showContent = /*showContent*/ ctx[8];
    			if (dirty & /*showImg*/ 128) interior_changes.showImg = /*showImg*/ ctx[7];
    			if (dirty & /*content*/ 16) interior_changes.content = /*content*/ ctx[4];
    			if (dirty & /*title*/ 64) interior_changes.title = /*title*/ ctx[6];
    			if (dirty & /*href*/ 1) interior_changes.href = /*href*/ ctx[0];
    			if (dirty & /*imgSrc*/ 32) interior_changes.imgSrc = /*imgSrc*/ ctx[5];
    			if (dirty & /*fetching*/ 512) interior_changes.fetching = /*fetching*/ ctx[9];
    			interior.$set(interior_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(interior.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(interior.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(interior, detaching);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let wrapper;
    	let current;

    	wrapper = new Wrapper({
    			props: {
    				href: /*href*/ ctx[0],
    				showContent: /*showContent*/ ctx[8],
    				showImg: /*showImg*/ ctx[7],
    				eltPos: /*eltPos*/ ctx[10],
    				position: /*position*/ ctx[2],
    				fetchData: /*fetchon*/ ctx[3] === "hover"
    				? /*fetchData*/ ctx[11]
    				: null,
    				id: "" + (/*id*/ ctx[1] + "-sub"),
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(wrapper.$$.fragment);
    			this.c = noop;
    		},
    		m(target, anchor) {
    			mount_component(wrapper, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const wrapper_changes = {};
    			if (dirty & /*href*/ 1) wrapper_changes.href = /*href*/ ctx[0];
    			if (dirty & /*showContent*/ 256) wrapper_changes.showContent = /*showContent*/ ctx[8];
    			if (dirty & /*showImg*/ 128) wrapper_changes.showImg = /*showImg*/ ctx[7];
    			if (dirty & /*position*/ 4) wrapper_changes.position = /*position*/ ctx[2];

    			if (dirty & /*fetchon*/ 8) wrapper_changes.fetchData = /*fetchon*/ ctx[3] === "hover"
    			? /*fetchData*/ ctx[11]
    			: null;

    			if (dirty & /*id*/ 2) wrapper_changes.id = "" + (/*id*/ ctx[1] + "-sub");

    			if (dirty & /*$$scope, showContent, showImg, content, title, href, imgSrc, fetching*/ 17393) {
    				wrapper_changes.$$scope = { dirty, ctx };
    			}

    			wrapper.$set(wrapper_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(wrapper.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(wrapper.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(wrapper, detaching);
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { eltpos } = $$props;
    	let { href } = $$props;
    	let { id } = $$props;
    	let { worker } = $$props;
    	let { position } = $$props;
    	let { fetchon } = $$props;
    	let eltPos = JSON.parse(abab.atob(eltpos));
    	let content;
    	let title;
    	let imgSrc;
    	let showImg = false;
    	let showContent = false;
    	let fetching = null;

    	const fetchData = async () => {
    		if (fetching !== false) {
    			$$invalidate(12, worker = abab.atob(worker));
    			const workerUrl = new URL(worker);
    			workerUrl.searchParams.append("page", href);
    			const res = await fetch(workerUrl);

    			if (res.ok) {
    				const json = await res.json();
    				$$invalidate(4, content = json.description);
    				$$invalidate(6, title = json.title);
    				$$invalidate(5, imgSrc = json.image);
    			}

    			$$invalidate(9, fetching = false);
    		}
    	};

    	onMount(() => {
    		if (fetchon === "load") fetchData();
    	});

    	$$self.$$set = $$props => {
    		if ('eltpos' in $$props) $$invalidate(13, eltpos = $$props.eltpos);
    		if ('href' in $$props) $$invalidate(0, href = $$props.href);
    		if ('id' in $$props) $$invalidate(1, id = $$props.id);
    		if ('worker' in $$props) $$invalidate(12, worker = $$props.worker);
    		if ('position' in $$props) $$invalidate(2, position = $$props.position);
    		if ('fetchon' in $$props) $$invalidate(3, fetchon = $$props.fetchon);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*content, imgSrc*/ 48) {
    			{
    				$$invalidate(8, showContent = content && content !== "null");
    				$$invalidate(7, showImg = imgSrc && imgSrc !== "null");
    			}
    		}
    	};

    	return [
    		href,
    		id,
    		position,
    		fetchon,
    		content,
    		imgSrc,
    		title,
    		showImg,
    		showContent,
    		fetching,
    		eltPos,
    		fetchData,
    		worker,
    		eltpos
    	];
    }

    class LinkPreview_wc extends SvelteElement {
    	constructor(options) {
    		super();

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
    				eltpos: 13,
    				href: 0,
    				id: 1,
    				worker: 12,
    				position: 2,
    				fetchon: 3
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
    		return ["eltpos", "href", "id", "worker", "position", "fetchon"];
    	}

    	get eltpos() {
    		return this.$$.ctx[13];
    	}

    	set eltpos(eltpos) {
    		this.$$set({ eltpos });
    		flush();
    	}

    	get href() {
    		return this.$$.ctx[0];
    	}

    	set href(href) {
    		this.$$set({ href });
    		flush();
    	}

    	get id() {
    		return this.$$.ctx[1];
    	}

    	set id(id) {
    		this.$$set({ id });
    		flush();
    	}

    	get worker() {
    		return this.$$.ctx[12];
    	}

    	set worker(worker) {
    		this.$$set({ worker });
    		flush();
    	}

    	get position() {
    		return this.$$.ctx[2];
    	}

    	set position(position) {
    		this.$$set({ position });
    		flush();
    	}

    	get fetchon() {
    		return this.$$.ctx[3];
    	}

    	set fetchon(fetchon) {
    		this.$$set({ fetchon });
    		flush();
    	}
    }

    customElements.define("link-preview", LinkPreview_wc);

    // This file replaces `index.js` in bundlers like webpack or Rollup,

    {
      // All bundlers will remove this block in the production bundle.
      if (
        typeof navigator !== 'undefined' &&
        navigator.product === 'ReactNative' &&
        typeof crypto === 'undefined'
      ) {
        throw new Error(
          'React Native does not have a built-in secure random generator. ' +
            'If you don’t need unpredictable IDs use `nanoid/non-secure`. ' +
            'For secure IDs, import `react-native-get-random-values` ' +
            'before Nano ID.'
        )
      }
      if (typeof msCrypto !== 'undefined' && typeof crypto === 'undefined') {
        throw new Error(
          'Import file with `if (!window.crypto) window.crypto = window.msCrypto`' +
            ' before importing Nano ID to fix IE 11 support'
        )
      }
      if (typeof crypto === 'undefined') {
        throw new Error(
          'Your browser does not have secure random generator. ' +
            'If you don’t need unpredictable IDs, you can use nanoid/non-secure.'
        )
      }
    }

    let nanoid = (size = 21) => {
      let id = '';
      let bytes = crypto.getRandomValues(new Uint8Array(size));

      // A compact alternative for `for (var i = 0; i < step; i++)`.
      while (size--) {
        // It is incorrect to use bytes exceeding the alphabet size.
        // The following mask reduces the random byte in the 0-255 value
        // range to the 0-63 value range. Therefore, adding hacks, such
        // as empty string fallback or magic numbers, is unneccessary because
        // the bitmask trims bytes down to the alphabet size.
        let byte = bytes[size] & 63;
        if (byte < 36) {
          // `0-9a-z`
          id += byte.toString(36);
        } else if (byte < 62) {
          // `A-Z`
          id += (byte - 26).toString(36).toUpperCase();
        } else if (byte < 63) {
          id += '_';
        } else {
          id += '-';
        }
      }
      return id
    };

    const defaultLinkGetter = () => {
      return document.getElementsByTagName("a");
    };

    window.setPagePreviews = function (options = {}) {
      options = {
        workerUrl: "",
        styles: null,
        fetchOn: "hover",
        getLinks: defaultLinkGetter,
        assignStyles: () => null,
        assignPositions: () => "below",
        ...options,
      };

      const pageATags = [...options.getLinks()];

      // get the positions of all the links
      for (const a of pageATags) {
        const aPos = a.getBoundingClientRect();
        // adjust if the page starts scrolled
        aPos.x += window.scrollX;
        aPos.y += window.scrollY;

        const shadowId = nanoid();
        const position = options.assignPositions(a) || "below";

        // add preview component to the element
        a.innerHTML += `<link-preview id="${shadowId}" eltpos="${abab.btoa(
      JSON.stringify(aPos)
    )}" position="${position}" worker=${abab.btoa(options.workerUrl)} href="${
      a.href
    }" fetchon="${options.fetchOn}"></link-preview>`;

        // get the styles either from the result of assigning styles or default
        const styles = options.assignStyles(a) || options.styles;
        const styleRules = [];

        // copy the relevant styles over
        for (const rule of styles?.rules) {
          if (rule.selectorText.indexOf(".hyperfov") !== -1) {
            styleRules.push(rule.cssText);
          }
        }

        // add the id to any user-defined styles so they have precedence
        const thisRuleset = [...styleRules].map(
          (r) => `#${shadowId}-sub * ${r}\n#${shadowId}-sub > ${r}`
        );

        const shadow = document.getElementById(shadowId);

        // add the relevant styles to the shadow dom
        const shadowStyle = document.createElement("style");
        shadowStyle.innerHTML = thisRuleset.join("\n");
        shadow.shadowRoot.appendChild(shadowStyle);
      }
    };

    exports.Interior = Interior;
    exports.LinkPreview = LinkPreview_wc;
    exports.Wrapper = Wrapper;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
