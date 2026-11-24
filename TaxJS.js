////////////////////////////////////////////////////////
/////////////    TaxJs.js from Tax    //////////////////
////////////////////////////////////////////////////////

const t = function (elem) {
    if (typeof elem === "string") {
        let element = document.querySelectorAll(elem);

        if (element.length === 1) {
            return element[0];
        } else if (element.length > 1) {
            return element;
        } else {
            console.error(`TaxJS: 获取元素 ${elem} 不存在`);
            return null;
        }
    } else {
        console.error(`TaxJS: 参数必须是字符串，实际是 ${typeof elem}`);
        return null;
    }
};

t.getByCls = function (elem) {
    const elements = document.getElementsByClassName(elem);
    const arr = Array.from(elements);

    if (arr.length === 0) {
        console.error(`TaxJS.cls: 未找到类名为 "${elem}" 的元素`);
        return [];
    } else if (arr.length === 1) {
        return arr[0];
    } else {
        return arr;
    }
};

t.getById = function (elem) {
    return document.getElementById(elem);
};

t.create = function (elem, where) {
    let doc = document.createElement(elem);
    if (where) {
        where.appendChild(doc);
    } else {
        document.body.appendChild(doc);
    }
    return doc;
};

/* ---------- Element 扩展 ---------- */

Element.prototype.sty = function (style, value) {
    if (typeof style === 'string' && value !== undefined) {
        this.style[style] = value;
    } else if (typeof style === 'object') {
        for (let key in style) {
            this.style[key] = style[key];
        }
    }
    return this;
};

NodeList.prototype.sty = function (style, value) {
    for (let i = 0; i < this.length; i++) {
        if (typeof style === 'string' && value !== undefined) {
            this[i].style[style] = value;
        } else if (typeof style === 'object') {
            for (let key in style) {
                this[i].style[key] = style[key];
            }
        }
    }
    return this;
};

Element.prototype.html = function (cont) {
    this.innerHTML = cont;
    return this;
};

Element.prototype.text = function (cont) {
    this.innerText = cont;
    return this;
};

Element.prototype.val = function (cont) {
    if (cont !== undefined) {
        this.value = cont;
        return this;
    }
    return this.value;
};

Element.prototype.delCls = function (cls) {
    this.classList.remove(cls);
    return this;
};

Element.prototype.getClsList = function () {
    return this.className;
};

Element.prototype.getCls = function (cls) {
    return this.classList.contains(cls);
};

Element.prototype.attset = function (att, value) {
    this.setAttribute(att, value);
    return this;
};

Element.prototype.addCls = function (cls) {
    this.classList.add(cls);
    return this;
};

Element.prototype.attdel = function (att) {
    this.removeAttribute(att);
    return this;
};

// 修复：原 attget 无参数调用 getAttribute()
Element.prototype.attget = function (att) {
    return this.getAttribute(att);
};

Element.prototype.parent = function () {
    return this.parentElement;
};

Element.prototype.child = function (index) {
    if (index !== undefined) {
        return this.children[index] || null;
    }
    return this.children;
};

Element.prototype.brother = function () {
    const parent = this.parentElement;
    if (!parent) return [];

    const brothers = [];
    for (let i = 0; i < parent.children.length; i++) {
        if (parent.children[i] !== this) {
            brothers.push(parent.children[i]);
        }
    }
    return brothers;
};

Element.prototype.on = function (act, f, op) {
    this.addEventListener(act, f, op);
    return this;
};

/* ---------- 动画（重写）---------- */

Element.prototype.animate = function (anim, time = 400) {
    if (typeof anim !== 'string') {
        throw new Error('动画类型必须是字符串');
    }
    if (typeof time !== 'number' || time <= 0) {
        throw new Error('动画时间必须是正数');
    }

    const element = this;
    const duration = time;
    const animType = anim.toLowerCase();

    if (!element || !(element instanceof Element)) {
        console.warn('TaxJS: 无效的DOM元素');
        return element;
    }

    if (element._isAnimating) {
        console.warn('TaxJS: 元素正在执行动画中，跳过当前动画');
        return element;
    }

    // 修复：toggle 先判断，再分发，避免递归时被 _isAnimating 拦截
    let realType = animType;
    if (animType === 'toggle') {
        const isHidden = element.style.opacity === '0'
            || getComputedStyle(element).opacity === '0'
            || element.style.display === 'none';
        realType = isHidden ? 'show' : 'hide';
    }

    switch (realType) {
        case 'show':
        case 'fadein':
            element.style.display = '';
            fade(element, 0, 1, duration);
            break;
        case 'hide':
        case 'fadeout':
            fade(element, 1, 0, duration);
            break;
        case 'slideup':
            slide(element, 'up', duration);
            break;
        case 'slidedown':
            slide(element, 'down', duration);
            break;
        default:
            console.warn(`TaxJS: 未知动画类型 "${anim}"`);
            element._isAnimating = false;
            return element;
    }
    return element;

    function fade(el, from, to, duration) {
        el._isAnimating = true;
        el.style.opacity = from;
        el.style.visibility = 'visible';

        const steps = 20;
        const step = (to - from) / steps;
        const intervalTime = duration / steps;

        let opacity = from;
        const interval = setInterval(() => {
            opacity += step;
            el.style.opacity = Math.max(0, Math.min(1, opacity)).toFixed(2);

            if ((step > 0 && opacity >= 1) || (step < 0 && opacity <= 0)) {
                el.style.opacity = to;
                if (to === 0) el.style.display = 'none'; // 淡出后隐藏
                clearInterval(interval);
                el._isAnimating = false;
            }
        }, intervalTime);
    }

    function slide(el, direction, duration) {
        el._isAnimating = true;
        if (direction === 'up') {
            const height = el.offsetHeight;
            el.style.height = height + 'px';
            el.style.overflow = 'hidden';
            el.style.visibility = 'visible';

            const steps = 20;
            const step = height / steps;
            let currentHeight = height;

            const interval = setInterval(() => {
                currentHeight -= step;
                el.style.height = Math.max(0, currentHeight) + 'px';

                if (currentHeight <= 0) {
                    el.style.display = 'none';
                    el.style.height = '';
                    el.style.overflow = '';
                    el._isAnimating = false;
                    clearInterval(interval);
                }
            }, duration / steps);
        } else if (direction === 'down') {
            const originalDisplay = el.style.display;
            el.style.display = '';
            const scrollHeight = el.scrollHeight;
            el.style.height = '0px';
            el.style.overflow = 'hidden';
            el.style.visibility = 'visible';

            const steps = 20;
            const step = scrollHeight / steps;
            let currentHeight = 0;

            const interval = setInterval(() => {
                currentHeight += step;
                el.style.height = Math.min(scrollHeight, currentHeight) + 'px';

                if (currentHeight >= scrollHeight) {
                    el.style.height = '';
                    el.style.overflow = '';
                    el.style.display = originalDisplay;
                    el._isAnimating = false;
                    clearInterval(interval);
                }
            }, duration / steps);
        }
    }
};

/* ---------- 数学工具 ---------- */

const tMa = {
    tu: function (val) { return Math.ceil(val); },
    td: function (val) { return Math.floor(val); },
    tr: function (val, precision = 0) {
        const multiplier = Math.pow(10, precision);
        return Math.round(val * multiplier) / multiplier;
    }
};

/* ---------- 数组扩展 ---------- */

Array.prototype.atg = function (...arrs) {
    for (let arr of arrs) {
        if (Array.isArray(arr)) {
            for (let item of arr) this.push(item);
        }
    }
    return this;
};

const atg = function (...arrs) {
    return arrs.flat();
};

Array.prototype.swap = function (i, j) {
    if (i >= 0 && i < this.length && j >= 0 && j < this.length) {
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};

Array.prototype.clear = function () {
    this.length = 0;
    return this;
};

Array.prototype.uni = function () {
    return [...new Set(this)];
};

Array.prototype.frontAdd = function (...arr) {
    this.unshift(...arr);
    return this;
};

Array.prototype.backAdd = function (...arr) {
    this.push(...arr);
    return this;
};

// 修复：shift/pop 不接受参数，只删一个
Array.prototype.frontDelete = function () {
    this.shift();
    return this;
};

Array.prototype.backDelete = function () {
    this.pop();
    return this;
};

Array.prototype.deleteIndex = function (index) {
    if (index >= 0 && index < this.length) {
        this.splice(index, 1);
    }
    return this;
};

Array.prototype.deleteValue = function (value) {
    for (let i = this.length - 1; i >= 0; i--) {
        if (this[i] === value) this.splice(i, 1);
    }
    return this;
};

// 修复：改名 findAll，避免覆盖原生 find
Array.prototype.findAll = function (value) {
    const firstIndex = this.indexOf(value);
    const allIndexes = [];
    let count = 0;

    for (let i = 0; i < this.length; i++) {
        if (this[i] === value) {
            allIndexes.push(i);
            count++;
        }
    }
    return {
        in: firstIndex !== -1,
        firstIndex: firstIndex,
        index: allIndexes,
        count: count,
        value: value
    };
};

Array.prototype.change = function (index, newValue) {
    if (index >= 0 && index < this.length) {
        this[index] = newValue;
    }
    return this;
};

/* ---------- 对象扩展（不建议，但保留修复）---------- */
// 注意：扩展 Object.prototype 属反模式，建议改用独立函数 objGet/objSet
Object.prototype.get = function (val) {
    return this[val];
};

Object.prototype.set = function (val, nowval) {
    this[val] = nowval;
    return this;
};

/* ---------- AJAX ---------- */

// 修复：使用局部变量，不用隐式全局；挂到 ajax.xhr 上
const ajax = (function () {
    let xhr;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    return {
        xhr: xhr,
        open: function (...args) {
            return this.xhr.open(...args);
        },
        get(url, callback) {
            this.xhr.open('GET', url, true);
            this.xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        callback(null, this.responseText);
                    } else {
                        callback(new Error('Request failed: ' + this.status), null);
                    }
                }
            };
            this.xhr.send();
        },
        post(url, data, callback) {
            this.xhr.open('POST', url, true);
            this.xhr.setRequestHeader('Content-Type', 'application/json');
            this.xhr.onreadystatechange = function () {
                if (this.readyState === 4) {
                    if (this.status === 200) {
                        callback(null, this.responseText);
                    } else {
                        callback(new Error('Request failed: ' + this.status), null);
                    }
                }
            };
            this.xhr.send(JSON.stringify(data));
        },
        send(...args) {
            return this.xhr.send(...args);
        }
    };
})();

/* ---------- 路由 ---------- */

t.router = {
    routes: {},
    _inited: false,

    register: function (path, handler) {
        this.routes[path] = handler;
        return this;
    },

    // 修复：navigate 增加 silent 参数，popstate 时不重复 pushState
    navigate: function (path, silent) {
        const handler = this.routes[path] || this.routes['/404'] || function () {
            console.warn(`TaxJS Router: 未找到路径 "${path}" 对应的路由`);
        };
        handler();
        if (!silent) {
            history.pushState(null, '', path);
        }
        return this;
    },

    init: function () {
        if (this._inited) return this;
        this._inited = true;
        // 修复：保存绑定后的函数引用，便于解绑
        this._popHandler = this._onPopState.bind(this);
        window.addEventListener('popstate', this._popHandler);
        this.navigate(window.location.pathname, true);
        return this;
    },

    destroy: function () {
        if (this._popHandler) {
            window.removeEventListener('popstate', this._popHandler);
            this._popHandler = null;
        }
        this._inited = false;
        return this;
    },

    _onPopState: function () {
        // 修复：popstate 时静默导航，避免再次 pushState 污染历史
        this.navigate(window.location.pathname, true);
    }
};
