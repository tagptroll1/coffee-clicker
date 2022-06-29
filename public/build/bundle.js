
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
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
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
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
        seen_callbacks.clear();
        set_current_component(saved_component);
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
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    class Upgrade {
        constructor({ id, name, description, price, isCps, oneTimePurchase = false, }, callback = () => null) {
            this.disabled = false;
            this.amountPurchased = 0;
            this.id = id;
            this.name = name;
            this.price = price;
            this.description = description;
            this.isCps = isCps;
            this.coffeePerSecond = 0;
            this.totalCoffeePerSecond = 0;
            this.basePrice = price;
            this.oneTimePurchase = oneTimePurchase;
            this.callback = callback;
            if (this.isCps && this.id > 0) {
                let cps = Math.ceil(Math.pow(this.id * 1, this.id * 0.5 + 2) * 10) / 10;
                //clamp 14,467,199 to 14,000,000 (there's probably a more elegant way to do that)
                let digits = Math.pow(10, Math.ceil(Math.log(Math.ceil(cps)) / Math.LN10)) / 100;
                this.coffeePerSecond = Math.round(cps / digits) * digits;
                this.basePrice = (this.id * 1 + 9 + (this.id < 5 ? 0 : Math.pow(this.id - 5, 1.75) * 5)) * Math.pow(10, this.id) * Math.max(1, this.id - 14);
                digits = Math.pow(10, Math.ceil(Math.log(Math.ceil(this.basePrice)) / Math.LN10)) / 100;
                this.basePrice = Math.round(this.basePrice / digits) * digits;
                this.price = this.basePrice;
            }
        }
        purchase() {
            this.amountPurchased++;
            this.increasePrice();
            this.callback();
            if (this.isCps) {
                this.totalCoffeePerSecond = this.coffeePerSecond * this.amountPurchased;
            }
            if (this.oneTimePurchase) {
                this.disabled = true;
            }
            return this;
        }
        increasePrice() {
            this.price = Math.ceil(this.basePrice * Math.pow(1.15, this.amountPurchased));
        }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    // Money / Passive Income
    const money = writable(0);
    const moneyPerSecond = writable(0);
    const moneyPercentModifier = writable(1);
    // Clicks
    const clicks = writable(0);
    const clickAddition = writable(0);
    const clickMultiplier = writable(1);
    const clickPercentModifier = writable(1);
    const clickPower = derived([clickAddition, clickMultiplier, clickPercentModifier], ([$add, $mult, $perc]) => {
        return Math.ceil((1 + $add * $mult) * $perc);
    });
    const upgrds = [
        new Upgrade({ name: "Increment Click Power", price: 10, description: "Increase the power of your clicks by 1" }, () => { clickAddition.set(get_store_value(clickAddition) + 1); }),
        new Upgrade({ name: "10% Click Power increase", price: 100, description: "Increase the power of your clicks by 10%" }, () => { clickPercentModifier.set(get_store_value(clickPercentModifier) + 0.1); }),
        new Upgrade({ name: "Double ClickPower increase", price: 1000, oneTimePurchase: true, description: "Increase the power of your clicks by 2x" }, () => { clickMultiplier.set(get_store_value(clickMultiplier) + 1); }),
        new Upgrade({ id: 1, name: "Frenchpress", description: "Drips a coffee drop now and then", isCps: true }),
        new Upgrade({ id: 2, name: "Capsule Machine", description: "Get a quick cup of coffee", isCps: true }),
        new Upgrade({ id: 3, name: "Mocha Master", description: "Can make a pot of coffee rather quick", isCps: true }),
        new Upgrade({ id: 4, name: "Cappuccino Machine", description: "Now we're getting fancy coffee worth more", isCps: true }),
        new Upgrade({ id: 5, name: "Espresso Machine", description: "Long sleepless nights?", isCps: true }),
        new Upgrade({ id: 6, name: "KitchenAid Classic", description: "Even helps clean the kitchen", isCps: true }),
        new Upgrade({ id: 7, name: "Coisinart Grind & Brew", description: "Your neighbors start showing up for breakfast", isCps: true }),
        new Upgrade({ id: 8, name: "Breville The Oracle Touch", description: "Developers has moved in with you", isCps: true }),
        new Upgrade({ id: 9, name: "De'Longhi Dinamica Plus", description: "Every morning a ray of sunlight shines on your house", isCps: true }),
        new Upgrade({ id: 10, name: "Nespresso Vertuo Next", description: "Jesus sometimes stops by for a cup", isCps: true }),
    ];
    // Coffee machines
    // Nespresso Vertuo Next
    // De'Longhi Dinamica Plus
    // Breville The Oracle Touch
    // Coisinart Grind & Brew
    // KitchenAid Classic
    // Espresso Machine
    // Cappuccino Machine
    // Capsule Machine
    // Upgrades
    const upgradesPurchased = writable(0);
    const upgrades = (upgrades => {
        const { subscribe, set, update } = writable(upgrades);
        return {
            subscribe,
            purchase: (upgradeName) => {
                const upgrade = upgrades.find(u => u.name === upgradeName);
                const moneySpent = upgrade.price;
                upgrade.purchase();
                set(upgrades);
                return moneySpent;
            },
            set
        };
    })(upgrds);

    /* src\App.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;

    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (132:6) {#if !upgrade.disabled && upgrade.amountPurchased > 0}
    function create_if_block_2(ctx) {
    	let t_value = /*upgrade*/ ctx[19].amountPurchased + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$upgrades*/ 8 && t_value !== (t_value = /*upgrade*/ ctx[19].amountPurchased + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(132:6) {#if !upgrade.disabled && upgrade.amountPurchased > 0}",
    		ctx
    	});

    	return block;
    }

    // (142:7) {:else }
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Purchased");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(142:7) {:else }",
    		ctx
    	});

    	return block;
    }

    // (140:7) {#if !upgrade.disabled}
    function create_if_block_1(ctx) {
    	let t0_value = beautifyNumber(/*upgrade*/ ctx[19].price) + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			t0 = text(t0_value);
    			t1 = text(" ☕");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, t1, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$upgrades*/ 8 && t0_value !== (t0_value = beautifyNumber(/*upgrade*/ ctx[19].price) + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(t1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(140:7) {#if !upgrade.disabled}",
    		ctx
    	});

    	return block;
    }

    // (145:7) {#if upgrade.isCps}
    function create_if_block(ctx) {
    	let p;
    	let t0;
    	let t1_value = beautifyNumber(/*upgrade*/ ctx[19].coffeePerSecond) + "";
    	let t1;
    	let t2;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("(");
    			t1 = text(t1_value);
    			t2 = text(" ☕/sec)");
    			attr_dev(p, "class", "svelte-1r6bo5e");
    			add_location(p, file, 145, 8, 4654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    			append_dev(p, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$upgrades*/ 8 && t1_value !== (t1_value = beautifyNumber(/*upgrade*/ ctx[19].coffeePerSecond) + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(145:7) {#if upgrade.isCps}",
    		ctx
    	});

    	return block;
    }

    // (129:3) {#each $upgrades as upgrade}
    function create_each_block(ctx) {
    	let li;
    	let button;
    	let t0;
    	let t1_value = /*upgrade*/ ctx[19].name + "";
    	let t1;
    	let t2;
    	let small;
    	let t3_value = /*upgrade*/ ctx[19].description + "";
    	let t3;
    	let t4;
    	let aside;
    	let t5;
    	let button_disabled_value;
    	let t6;
    	let mounted;
    	let dispose;
    	let if_block0 = !/*upgrade*/ ctx[19].disabled && /*upgrade*/ ctx[19].amountPurchased > 0 && create_if_block_2(ctx);

    	function select_block_type(ctx, dirty) {
    		if (!/*upgrade*/ ctx[19].disabled) return create_if_block_1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block1 = current_block_type(ctx);
    	let if_block2 = /*upgrade*/ ctx[19].isCps && create_if_block(ctx);

    	function click_handler() {
    		return /*click_handler*/ ctx[7](/*upgrade*/ ctx[19]);
    	}

    	const block = {
    		c: function create() {
    			li = element("li");
    			button = element("button");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			t1 = text(t1_value);
    			t2 = space();
    			small = element("small");
    			t3 = text(t3_value);
    			t4 = space();
    			aside = element("aside");
    			if_block1.c();
    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			attr_dev(small, "class", "svelte-1r6bo5e");
    			add_location(small, file, 136, 6, 4445);
    			attr_dev(aside, "class", "svelte-1r6bo5e");
    			add_location(aside, file, 138, 6, 4489);
    			attr_dev(button, "class", "upgrades svelte-1r6bo5e");
    			button.disabled = button_disabled_value = /*$money*/ ctx[1] < /*upgrade*/ ctx[19].price || /*upgrade*/ ctx[19].disabled;
    			add_location(button, file, 130, 5, 4187);
    			add_location(li, file, 129, 4, 4177);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, button);
    			if (if_block0) if_block0.m(button, null);
    			append_dev(button, t0);
    			append_dev(button, t1);
    			append_dev(button, t2);
    			append_dev(button, small);
    			append_dev(small, t3);
    			append_dev(button, t4);
    			append_dev(button, aside);
    			if_block1.m(aside, null);
    			append_dev(aside, t5);
    			if (if_block2) if_block2.m(aside, null);
    			append_dev(li, t6);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (!/*upgrade*/ ctx[19].disabled && /*upgrade*/ ctx[19].amountPurchased > 0) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2(ctx);
    					if_block0.c();
    					if_block0.m(button, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (dirty & /*$upgrades*/ 8 && t1_value !== (t1_value = /*upgrade*/ ctx[19].name + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$upgrades*/ 8 && t3_value !== (t3_value = /*upgrade*/ ctx[19].description + "")) set_data_dev(t3, t3_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(aside, t5);
    				}
    			}

    			if (/*upgrade*/ ctx[19].isCps) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block(ctx);
    					if_block2.c();
    					if_block2.m(aside, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*$money, $upgrades*/ 10 && button_disabled_value !== (button_disabled_value = /*$money*/ ctx[1] < /*upgrade*/ ctx[19].price || /*upgrade*/ ctx[19].disabled)) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    			if (if_block0) if_block0.d();
    			if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(129:3) {#each $upgrades as upgrade}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let section;
    	let h1;
    	let t0_value = beautifyNumber(Math.ceil(/*$money*/ ctx[1])) + "";
    	let t0;
    	let t1;
    	let t2;
    	let button;
    	let t4;
    	let small0;
    	let t5_value = beautifyNumber(/*$moneyPerSecond*/ ctx[2] * /*$moneyPercentModifier*/ ctx[4]) + "";
    	let t5;
    	let t6;
    	let t7;
    	let small1;
    	let t8;
    	let t9;
    	let t10;
    	let aside;
    	let h2;
    	let t12;
    	let small2;
    	let t14;
    	let ul;
    	let mounted;
    	let dispose;
    	let each_value = /*$upgrades*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			main = element("main");
    			section = element("section");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = text(" ☕");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Click";
    			t4 = space();
    			small0 = element("small");
    			t5 = text(t5_value);
    			t6 = text(" ☕/sec");
    			t7 = space();
    			small1 = element("small");
    			t8 = text(/*$clickPower*/ ctx[0]);
    			t9 = text(" 👆");
    			t10 = space();
    			aside = element("aside");
    			h2 = element("h2");
    			h2.textContent = "Shop";
    			t12 = space();
    			small2 = element("small");
    			small2.textContent = "v0.1.5";
    			t14 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h1, "class", "svelte-1r6bo5e");
    			add_location(h1, file, 114, 2, 3838);
    			add_location(button, file, 116, 2, 3890);
    			attr_dev(small0, "class", "svelte-1r6bo5e");
    			add_location(small0, file, 119, 2, 3945);
    			attr_dev(small1, "class", "svelte-1r6bo5e");
    			add_location(small1, file, 120, 2, 4026);
    			attr_dev(section, "class", "clicking-side svelte-1r6bo5e");
    			add_location(section, file, 112, 1, 3803);
    			add_location(h2, file, 125, 2, 4096);
    			attr_dev(small2, "class", "svelte-1r6bo5e");
    			add_location(small2, file, 126, 2, 4112);
    			attr_dev(ul, "class", "svelte-1r6bo5e");
    			add_location(ul, file, 127, 2, 4136);
    			attr_dev(aside, "class", "shop svelte-1r6bo5e");
    			add_location(aside, file, 123, 1, 4072);
    			attr_dev(main, "class", "svelte-1r6bo5e");
    			add_location(main, file, 111, 0, 3795);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, section);
    			append_dev(section, h1);
    			append_dev(h1, t0);
    			append_dev(h1, t1);
    			append_dev(section, t2);
    			append_dev(section, button);
    			append_dev(section, t4);
    			append_dev(section, small0);
    			append_dev(small0, t5);
    			append_dev(small0, t6);
    			append_dev(section, t7);
    			append_dev(section, small1);
    			append_dev(small1, t8);
    			append_dev(small1, t9);
    			append_dev(main, t10);
    			append_dev(main, aside);
    			append_dev(aside, h2);
    			append_dev(aside, t12);
    			append_dev(aside, small2);
    			append_dev(aside, t14);
    			append_dev(aside, ul);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$money*/ 2 && t0_value !== (t0_value = beautifyNumber(Math.ceil(/*$money*/ ctx[1])) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$moneyPerSecond, $moneyPercentModifier*/ 20 && t5_value !== (t5_value = beautifyNumber(/*$moneyPerSecond*/ ctx[2] * /*$moneyPercentModifier*/ ctx[4]) + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*$clickPower*/ 1) set_data_dev(t8, /*$clickPower*/ ctx[0]);

    			if (dirty & /*$money, $upgrades, buyUpgrade, beautifyNumber*/ 42) {
    				each_value = /*$upgrades*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function beautifyNumber(number) {
    	return number.toLocaleString("en");
    }

    function instance($$self, $$props, $$invalidate) {
    	let $clickPower;
    	let $money;
    	let $clicks;
    	let $moneyPerSecond;
    	let $upgrades;
    	let $upgradesPurchased;
    	let $clickPercentModifier;
    	let $clickMultiplier;
    	let $clickAddition;
    	let $moneyPercentModifier;
    	validate_store(clickPower, 'clickPower');
    	component_subscribe($$self, clickPower, $$value => $$invalidate(0, $clickPower = $$value));
    	validate_store(money, 'money');
    	component_subscribe($$self, money, $$value => $$invalidate(1, $money = $$value));
    	validate_store(clicks, 'clicks');
    	component_subscribe($$self, clicks, $$value => $$invalidate(10, $clicks = $$value));
    	validate_store(moneyPerSecond, 'moneyPerSecond');
    	component_subscribe($$self, moneyPerSecond, $$value => $$invalidate(2, $moneyPerSecond = $$value));
    	validate_store(upgrades, 'upgrades');
    	component_subscribe($$self, upgrades, $$value => $$invalidate(3, $upgrades = $$value));
    	validate_store(upgradesPurchased, 'upgradesPurchased');
    	component_subscribe($$self, upgradesPurchased, $$value => $$invalidate(11, $upgradesPurchased = $$value));
    	validate_store(clickPercentModifier, 'clickPercentModifier');
    	component_subscribe($$self, clickPercentModifier, $$value => $$invalidate(12, $clickPercentModifier = $$value));
    	validate_store(clickMultiplier, 'clickMultiplier');
    	component_subscribe($$self, clickMultiplier, $$value => $$invalidate(13, $clickMultiplier = $$value));
    	validate_store(clickAddition, 'clickAddition');
    	component_subscribe($$self, clickAddition, $$value => $$invalidate(14, $clickAddition = $$value));
    	validate_store(moneyPercentModifier, 'moneyPercentModifier');
    	component_subscribe($$self, moneyPercentModifier, $$value => $$invalidate(4, $moneyPercentModifier = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let _lastFrameMs = 0;
    	let tick = 0;

    	function loop(timestamp) {
    		let delta = (timestamp - _lastFrameMs) / 1000;
    		_lastFrameMs = timestamp;
    		set_store_value(money, $money += $moneyPerSecond * $moneyPercentModifier * delta, $money);
    		tick++;

    		if (tick % 500 === 0) {
    			ensureNotNaNValues();

    			console.log({
    				$clicks,
    				$money,
    				$moneyPercentModifier,
    				$moneyPerSecond,
    				$upgrades,
    				$upgradesPurchased
    			});

    			saveSave();
    			tick = 0;
    		}

    		requestAnimationFrame(loop);
    	}

    	function ensureNotNaNValues() {
    		if (!$money || isNaN($money)) {
    			set_store_value(money, $money = 0, $money);
    		}

    		if (!$moneyPerSecond || isNaN($moneyPerSecond)) {
    			set_store_value(moneyPerSecond, $moneyPerSecond = 0, $moneyPerSecond);
    		}

    		if (!$moneyPercentModifier || isNaN($moneyPercentModifier)) {
    			set_store_value(moneyPercentModifier, $moneyPercentModifier = 0, $moneyPercentModifier);
    		}

    		if (!$clicks || isNaN($clicks)) {
    			set_store_value(clicks, $clicks = 0, $clicks);
    		}

    		if (!$upgradesPurchased || isNaN($upgradesPurchased)) {
    			set_store_value(upgradesPurchased, $upgradesPurchased = 0, $upgradesPurchased);
    		}

    		$upgrades.map(u => {
    			if (!u.amountPurchased || isNaN(u.amountPurchased)) {
    				u.amountPurchased = 0;
    			}

    			if (!u.price || isNaN(u.price)) {
    				u.price = Math.ceil(u.basePrice * Math.pow(1.15, u.amountPurchased));
    			}

    			if (!u.totalCoffeePerSecond || isNaN(u.totalCoffeePerSecond)) {
    				u.totalCoffeePerSecond = u.coffeePerSecond * u.amountPurchased;
    			}

    			return u;
    		});
    	}

    	function loadSave() {
    		let save = localStorage.getItem("save");

    		if (save) {
    			let data = JSON.parse(save);
    			set_store_value(clicks, $clicks = data.clicks, $clicks);
    			set_store_value(clickAddition, $clickAddition = data.clickAddition, $clickAddition);
    			set_store_value(clickMultiplier, $clickMultiplier = data.clickMultiplier, $clickMultiplier);
    			set_store_value(clickPercentModifier, $clickPercentModifier = data.clickPercentModifier, $clickPercentModifier);
    			set_store_value(money, $money = data.money, $money);
    			set_store_value(moneyPercentModifier, $moneyPercentModifier = data.moneyPercentModifier, $moneyPercentModifier);
    			let cps = 0;

    			for (const upgrade of $upgrades) {
    				const saveUpgrade = data.upgrades.find(d => d.name === upgrade.name);
    				upgrade.amountPurchased = saveUpgrade.amountPurchased;
    				upgrade.disabled = saveUpgrade.disabled;
    				upgrade.increasePrice();

    				if (upgrade.isCps) {
    					upgrade.coffeePerSecond = saveUpgrade.coffeePerSecond;
    					upgrade.totalCoffeePerSecond = upgrade.coffeePerSecond * upgrade.amountPurchased;
    					cps += upgrade.totalCoffeePerSecond;
    				}
    			}
    			set_store_value(upgradesPurchased, $upgradesPurchased = data.upgradesPurchased, $upgradesPurchased);
    			set_store_value(moneyPerSecond, $moneyPerSecond = cps, $moneyPerSecond);
    		}
    	}

    	function saveSave() {
    		let save = {
    			clicks: $clicks ?? 0,
    			money: $money ?? 0,
    			moneyPercentModifier: $moneyPercentModifier ?? 1,
    			moneyPerSecond: $moneyPerSecond ?? 0,
    			upgrades: $upgrades,
    			upgradesPurchased: $upgradesPurchased ?? 0,
    			clickAddition: $clickAddition ?? 0,
    			clickMultiplier: $clickMultiplier ?? 1,
    			clickPercentModifier: $clickPercentModifier ?? 1
    		};

    		localStorage.setItem("save", JSON.stringify(save));
    	}

    	onMount(() => {
    		loadSave();
    		requestAnimationFrame(loop);
    	});

    	function buyUpgrade(upgradeName) {
    		set_store_value(money, $money -= upgrades.purchase(upgradeName), $money);
    		set_store_value(upgradesPurchased, $upgradesPurchased++, $upgradesPurchased);
    		let cps = 0;

    		for (const upgrade of $upgrades) {
    			if (upgrade.isCps) {
    				cps += upgrade.totalCoffeePerSecond;
    			}
    		}

    		set_store_value(moneyPerSecond, $moneyPerSecond = cps, $moneyPerSecond);
    	}

    	function handleClick() {
    		set_store_value(clicks, $clicks++, $clicks);
    		set_store_value(money, $money += $clickPower, $money);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = upgrade => buyUpgrade(upgrade.name);

    	$$self.$capture_state = () => ({
    		onMount,
    		clickPower,
    		clicks,
    		money,
    		moneyPercentModifier,
    		moneyPerSecond,
    		upgrades,
    		upgradesPurchased,
    		clickAddition,
    		clickMultiplier,
    		clickPercentModifier,
    		_lastFrameMs,
    		tick,
    		loop,
    		ensureNotNaNValues,
    		loadSave,
    		saveSave,
    		buyUpgrade,
    		handleClick,
    		beautifyNumber,
    		$clickPower,
    		$money,
    		$clicks,
    		$moneyPerSecond,
    		$upgrades,
    		$upgradesPurchased,
    		$clickPercentModifier,
    		$clickMultiplier,
    		$clickAddition,
    		$moneyPercentModifier
    	});

    	$$self.$inject_state = $$props => {
    		if ('_lastFrameMs' in $$props) _lastFrameMs = $$props._lastFrameMs;
    		if ('tick' in $$props) tick = $$props.tick;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		$clickPower,
    		$money,
    		$moneyPerSecond,
    		$upgrades,
    		$moneyPercentModifier,
    		buyUpgrade,
    		handleClick,
    		click_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world'
        }
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
