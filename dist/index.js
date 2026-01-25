import hr, { createContext as mr, useReducer as ft, useMemo as z, useContext as vr, useState as _r, useCallback as yr, useEffect as br, useRef as dt } from "react";
import { ResponsiveContainer as pr, LineChart as ht, CartesianGrid as gr, XAxis as Er, YAxis as xr, Tooltip as Sr, Line as mt, Brush as vt, BarChart as _t, Bar as qe, Cell as yt } from "recharts";
var je = { exports: {} }, q = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var er;
function bt() {
  if (er) return q;
  er = 1;
  var e = hr, r = Symbol.for("react.element"), t = Symbol.for("react.fragment"), n = Object.prototype.hasOwnProperty, s = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, i = { key: !0, ref: !0, __self: !0, __source: !0 };
  function f(l, c, d) {
    var m, y = {}, _ = null, T = null;
    d !== void 0 && (_ = "" + d), c.key !== void 0 && (_ = "" + c.key), c.ref !== void 0 && (T = c.ref);
    for (m in c) n.call(c, m) && !i.hasOwnProperty(m) && (y[m] = c[m]);
    if (l && l.defaultProps) for (m in c = l.defaultProps, c) y[m] === void 0 && (y[m] = c[m]);
    return { $$typeof: r, type: l, key: _, ref: T, props: y, _owner: s.current };
  }
  return q.Fragment = t, q.jsx = f, q.jsxs = f, q;
}
var ee = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var rr;
function pt() {
  return rr || (rr = 1, process.env.NODE_ENV !== "production" && function() {
    var e = hr, r = Symbol.for("react.element"), t = Symbol.for("react.portal"), n = Symbol.for("react.fragment"), s = Symbol.for("react.strict_mode"), i = Symbol.for("react.profiler"), f = Symbol.for("react.provider"), l = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), d = Symbol.for("react.suspense"), m = Symbol.for("react.suspense_list"), y = Symbol.for("react.memo"), _ = Symbol.for("react.lazy"), T = Symbol.for("react.offscreen"), P = Symbol.iterator, b = "@@iterator";
    function x(a) {
      if (a === null || typeof a != "object")
        return null;
      var o = P && a[P] || a[b];
      return typeof o == "function" ? o : null;
    }
    var g = e.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function N(a) {
      {
        for (var o = arguments.length, h = new Array(o > 1 ? o - 1 : 0), v = 1; v < o; v++)
          h[v - 1] = arguments[v];
        j("error", a, h);
      }
    }
    function j(a, o, h) {
      {
        var v = g.ReactDebugCurrentFrame, S = v.getStackAddendum();
        S !== "" && (o += "%s", h = h.concat([S]));
        var R = h.map(function(E) {
          return String(E);
        });
        R.unshift("Warning: " + o), Function.prototype.apply.call(console[a], console, R);
      }
    }
    var L = !1, D = !1, V = !1, A = !1, se = !1, Ce;
    Ce = Symbol.for("react.module.reference");
    function $r(a) {
      return !!(typeof a == "string" || typeof a == "function" || a === n || a === i || se || a === s || a === d || a === m || A || a === T || L || D || V || typeof a == "object" && a !== null && (a.$$typeof === _ || a.$$typeof === y || a.$$typeof === f || a.$$typeof === l || a.$$typeof === c || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      a.$$typeof === Ce || a.getModuleId !== void 0));
    }
    function Ar(a, o, h) {
      var v = a.displayName;
      if (v)
        return v;
      var S = o.displayName || o.name || "";
      return S !== "" ? h + "(" + S + ")" : h;
    }
    function Pe(a) {
      return a.displayName || "Context";
    }
    function F(a) {
      if (a == null)
        return null;
      if (typeof a.tag == "number" && N("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof a == "function")
        return a.displayName || a.name || null;
      if (typeof a == "string")
        return a;
      switch (a) {
        case n:
          return "Fragment";
        case t:
          return "Portal";
        case i:
          return "Profiler";
        case s:
          return "StrictMode";
        case d:
          return "Suspense";
        case m:
          return "SuspenseList";
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case l:
            var o = a;
            return Pe(o) + ".Consumer";
          case f:
            var h = a;
            return Pe(h._context) + ".Provider";
          case c:
            return Ar(a, a.render, "ForwardRef");
          case y:
            var v = a.displayName || null;
            return v !== null ? v : F(a.type) || "Memo";
          case _: {
            var S = a, R = S._payload, E = S._init;
            try {
              return F(E(R));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var K = Object.assign, H = 0, we, De, Oe, ke, Le, Ie, $e;
    function Ae() {
    }
    Ae.__reactDisabledLog = !0;
    function Mr() {
      {
        if (H === 0) {
          we = console.log, De = console.info, Oe = console.warn, ke = console.error, Le = console.group, Ie = console.groupCollapsed, $e = console.groupEnd;
          var a = {
            configurable: !0,
            enumerable: !0,
            value: Ae,
            writable: !0
          };
          Object.defineProperties(console, {
            info: a,
            log: a,
            warn: a,
            error: a,
            group: a,
            groupCollapsed: a,
            groupEnd: a
          });
        }
        H++;
      }
    }
    function Fr() {
      {
        if (H--, H === 0) {
          var a = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: K({}, a, {
              value: we
            }),
            info: K({}, a, {
              value: De
            }),
            warn: K({}, a, {
              value: Oe
            }),
            error: K({}, a, {
              value: ke
            }),
            group: K({}, a, {
              value: Le
            }),
            groupCollapsed: K({}, a, {
              value: Ie
            }),
            groupEnd: K({}, a, {
              value: $e
            })
          });
        }
        H < 0 && N("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var he = g.ReactCurrentDispatcher, me;
    function ie(a, o, h) {
      {
        if (me === void 0)
          try {
            throw Error();
          } catch (S) {
            var v = S.stack.trim().match(/\n( *(at )?)/);
            me = v && v[1] || "";
          }
        return `
` + me + a;
      }
    }
    var ve = !1, le;
    {
      var zr = typeof WeakMap == "function" ? WeakMap : Map;
      le = new zr();
    }
    function Me(a, o) {
      if (!a || ve)
        return "";
      {
        var h = le.get(a);
        if (h !== void 0)
          return h;
      }
      var v;
      ve = !0;
      var S = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var R;
      R = he.current, he.current = null, Mr();
      try {
        if (o) {
          var E = function() {
            throw Error();
          };
          if (Object.defineProperty(E.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(E, []);
            } catch (I) {
              v = I;
            }
            Reflect.construct(a, [], E);
          } else {
            try {
              E.call();
            } catch (I) {
              v = I;
            }
            a.call(E.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (I) {
            v = I;
          }
          a();
        }
      } catch (I) {
        if (I && v && typeof I.stack == "string") {
          for (var p = I.stack.split(`
`), k = v.stack.split(`
`), C = p.length - 1, w = k.length - 1; C >= 1 && w >= 0 && p[C] !== k[w]; )
            w--;
          for (; C >= 1 && w >= 0; C--, w--)
            if (p[C] !== k[w]) {
              if (C !== 1 || w !== 1)
                do
                  if (C--, w--, w < 0 || p[C] !== k[w]) {
                    var $ = `
` + p[C].replace(" at new ", " at ");
                    return a.displayName && $.includes("<anonymous>") && ($ = $.replace("<anonymous>", a.displayName)), typeof a == "function" && le.set(a, $), $;
                  }
                while (C >= 1 && w >= 0);
              break;
            }
        }
      } finally {
        ve = !1, he.current = R, Fr(), Error.prepareStackTrace = S;
      }
      var Y = a ? a.displayName || a.name : "", B = Y ? ie(Y) : "";
      return typeof a == "function" && le.set(a, B), B;
    }
    function Vr(a, o, h) {
      return Me(a, !1);
    }
    function Kr(a) {
      var o = a.prototype;
      return !!(o && o.isReactComponent);
    }
    function oe(a, o, h) {
      if (a == null)
        return "";
      if (typeof a == "function")
        return Me(a, Kr(a));
      if (typeof a == "string")
        return ie(a);
      switch (a) {
        case d:
          return ie("Suspense");
        case m:
          return ie("SuspenseList");
      }
      if (typeof a == "object")
        switch (a.$$typeof) {
          case c:
            return Vr(a.render);
          case y:
            return oe(a.type, o, h);
          case _: {
            var v = a, S = v._payload, R = v._init;
            try {
              return oe(R(S), o, h);
            } catch {
            }
          }
        }
      return "";
    }
    var Z = Object.prototype.hasOwnProperty, Fe = {}, ze = g.ReactDebugCurrentFrame;
    function ue(a) {
      if (a) {
        var o = a._owner, h = oe(a.type, a._source, o ? o.type : null);
        ze.setExtraStackFrame(h);
      } else
        ze.setExtraStackFrame(null);
    }
    function Br(a, o, h, v, S) {
      {
        var R = Function.call.bind(Z);
        for (var E in a)
          if (R(a, E)) {
            var p = void 0;
            try {
              if (typeof a[E] != "function") {
                var k = Error((v || "React class") + ": " + h + " type `" + E + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof a[E] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw k.name = "Invariant Violation", k;
              }
              p = a[E](o, E, v, h, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (C) {
              p = C;
            }
            p && !(p instanceof Error) && (ue(S), N("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", v || "React class", h, E, typeof p), ue(null)), p instanceof Error && !(p.message in Fe) && (Fe[p.message] = !0, ue(S), N("Failed %s type: %s", h, p.message), ue(null));
          }
      }
    }
    var Ur = Array.isArray;
    function _e(a) {
      return Ur(a);
    }
    function Yr(a) {
      {
        var o = typeof Symbol == "function" && Symbol.toStringTag, h = o && a[Symbol.toStringTag] || a.constructor.name || "Object";
        return h;
      }
    }
    function Wr(a) {
      try {
        return Ve(a), !1;
      } catch {
        return !0;
      }
    }
    function Ve(a) {
      return "" + a;
    }
    function Ke(a) {
      if (Wr(a))
        return N("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Yr(a)), Ve(a);
    }
    var Be = g.ReactCurrentOwner, Gr = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, Ue, Ye;
    function Jr(a) {
      if (Z.call(a, "ref")) {
        var o = Object.getOwnPropertyDescriptor(a, "ref").get;
        if (o && o.isReactWarning)
          return !1;
      }
      return a.ref !== void 0;
    }
    function Xr(a) {
      if (Z.call(a, "key")) {
        var o = Object.getOwnPropertyDescriptor(a, "key").get;
        if (o && o.isReactWarning)
          return !1;
      }
      return a.key !== void 0;
    }
    function Qr(a, o) {
      typeof a.ref == "string" && Be.current;
    }
    function Hr(a, o) {
      {
        var h = function() {
          Ue || (Ue = !0, N("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", o));
        };
        h.isReactWarning = !0, Object.defineProperty(a, "key", {
          get: h,
          configurable: !0
        });
      }
    }
    function Zr(a, o) {
      {
        var h = function() {
          Ye || (Ye = !0, N("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", o));
        };
        h.isReactWarning = !0, Object.defineProperty(a, "ref", {
          get: h,
          configurable: !0
        });
      }
    }
    var qr = function(a, o, h, v, S, R, E) {
      var p = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: r,
        // Built-in properties that belong on the element
        type: a,
        key: o,
        ref: h,
        props: E,
        // Record the component responsible for creating this element.
        _owner: R
      };
      return p._store = {}, Object.defineProperty(p._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(p, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: v
      }), Object.defineProperty(p, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: S
      }), Object.freeze && (Object.freeze(p.props), Object.freeze(p)), p;
    };
    function et(a, o, h, v, S) {
      {
        var R, E = {}, p = null, k = null;
        h !== void 0 && (Ke(h), p = "" + h), Xr(o) && (Ke(o.key), p = "" + o.key), Jr(o) && (k = o.ref, Qr(o, S));
        for (R in o)
          Z.call(o, R) && !Gr.hasOwnProperty(R) && (E[R] = o[R]);
        if (a && a.defaultProps) {
          var C = a.defaultProps;
          for (R in C)
            E[R] === void 0 && (E[R] = C[R]);
        }
        if (p || k) {
          var w = typeof a == "function" ? a.displayName || a.name || "Unknown" : a;
          p && Hr(E, w), k && Zr(E, w);
        }
        return qr(a, p, k, S, v, Be.current, E);
      }
    }
    var ye = g.ReactCurrentOwner, We = g.ReactDebugCurrentFrame;
    function U(a) {
      if (a) {
        var o = a._owner, h = oe(a.type, a._source, o ? o.type : null);
        We.setExtraStackFrame(h);
      } else
        We.setExtraStackFrame(null);
    }
    var be;
    be = !1;
    function pe(a) {
      return typeof a == "object" && a !== null && a.$$typeof === r;
    }
    function Ge() {
      {
        if (ye.current) {
          var a = F(ye.current.type);
          if (a)
            return `

Check the render method of \`` + a + "`.";
        }
        return "";
      }
    }
    function rt(a) {
      return "";
    }
    var Je = {};
    function tt(a) {
      {
        var o = Ge();
        if (!o) {
          var h = typeof a == "string" ? a : a.displayName || a.name;
          h && (o = `

Check the top-level render call using <` + h + ">.");
        }
        return o;
      }
    }
    function Xe(a, o) {
      {
        if (!a._store || a._store.validated || a.key != null)
          return;
        a._store.validated = !0;
        var h = tt(o);
        if (Je[h])
          return;
        Je[h] = !0;
        var v = "";
        a && a._owner && a._owner !== ye.current && (v = " It was passed a child from " + F(a._owner.type) + "."), U(a), N('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', h, v), U(null);
      }
    }
    function Qe(a, o) {
      {
        if (typeof a != "object")
          return;
        if (_e(a))
          for (var h = 0; h < a.length; h++) {
            var v = a[h];
            pe(v) && Xe(v, o);
          }
        else if (pe(a))
          a._store && (a._store.validated = !0);
        else if (a) {
          var S = x(a);
          if (typeof S == "function" && S !== a.entries)
            for (var R = S.call(a), E; !(E = R.next()).done; )
              pe(E.value) && Xe(E.value, o);
        }
      }
    }
    function at(a) {
      {
        var o = a.type;
        if (o == null || typeof o == "string")
          return;
        var h;
        if (typeof o == "function")
          h = o.propTypes;
        else if (typeof o == "object" && (o.$$typeof === c || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        o.$$typeof === y))
          h = o.propTypes;
        else
          return;
        if (h) {
          var v = F(o);
          Br(h, a.props, "prop", v, a);
        } else if (o.PropTypes !== void 0 && !be) {
          be = !0;
          var S = F(o);
          N("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", S || "Unknown");
        }
        typeof o.getDefaultProps == "function" && !o.getDefaultProps.isReactClassApproved && N("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function nt(a) {
      {
        for (var o = Object.keys(a.props), h = 0; h < o.length; h++) {
          var v = o[h];
          if (v !== "children" && v !== "key") {
            U(a), N("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", v), U(null);
            break;
          }
        }
        a.ref !== null && (U(a), N("Invalid attribute `ref` supplied to `React.Fragment`."), U(null));
      }
    }
    var He = {};
    function Ze(a, o, h, v, S, R) {
      {
        var E = $r(a);
        if (!E) {
          var p = "";
          (a === void 0 || typeof a == "object" && a !== null && Object.keys(a).length === 0) && (p += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var k = rt();
          k ? p += k : p += Ge();
          var C;
          a === null ? C = "null" : _e(a) ? C = "array" : a !== void 0 && a.$$typeof === r ? (C = "<" + (F(a.type) || "Unknown") + " />", p = " Did you accidentally export a JSX literal instead of a component?") : C = typeof a, N("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", C, p);
        }
        var w = et(a, o, h, S, R);
        if (w == null)
          return w;
        if (E) {
          var $ = o.children;
          if ($ !== void 0)
            if (v)
              if (_e($)) {
                for (var Y = 0; Y < $.length; Y++)
                  Qe($[Y], a);
                Object.freeze && Object.freeze($);
              } else
                N("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              Qe($, a);
        }
        if (Z.call(o, "key")) {
          var B = F(a), I = Object.keys(o).filter(function(ct) {
            return ct !== "key";
          }), ge = I.length > 0 ? "{key: someKey, " + I.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!He[B + ge]) {
            var ut = I.length > 0 ? "{" + I.join(": ..., ") + ": ...}" : "{}";
            N(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, ge, B, ut, B), He[B + ge] = !0;
          }
        }
        return a === n ? nt(w) : at(w), w;
      }
    }
    function st(a, o, h) {
      return Ze(a, o, h, !0);
    }
    function it(a, o, h) {
      return Ze(a, o, h, !1);
    }
    var lt = it, ot = st;
    ee.Fragment = n, ee.jsx = lt, ee.jsxs = ot;
  }()), ee;
}
process.env.NODE_ENV === "production" ? je.exports = bt() : je.exports = pt();
var u = je.exports;
const O = {
  SET_CONTEXT: "dashboard/SET_CONTEXT",
  SET_GLOBAL_FILTERS: "dashboard/SET_GLOBAL_FILTERS",
  ADD_SELECTION: "dashboard/ADD_SELECTION",
  REMOVE_SELECTION: "dashboard/REMOVE_SELECTION",
  CLEAR_SELECTIONS: "dashboard/CLEAR_SELECTIONS",
  PUSH_DRILL: "dashboard/PUSH_DRILL",
  POP_DRILL: "dashboard/POP_DRILL",
  SET_PANEL_STATE: "dashboard/SET_PANEL_STATE"
}, gt = ({ dashboardId: e, datasetId: r }) => ({
  type: O.SET_CONTEXT,
  payload: { dashboardId: e, datasetId: r }
}), Et = (e) => ({
  type: O.SET_GLOBAL_FILTERS,
  payload: { filters: e }
}), xt = (e) => ({
  type: O.ADD_SELECTION,
  payload: { selection: e }
}), St = (e) => ({
  type: O.REMOVE_SELECTION,
  payload: { selectionId: e }
}), jt = () => ({
  type: O.CLEAR_SELECTIONS
}), Rt = (e) => ({
  type: O.PUSH_DRILL,
  payload: { entry: e }
}), Nt = () => ({
  type: O.POP_DRILL
}), Tt = (e, r) => ({
  type: O.SET_PANEL_STATE,
  payload: { panelId: e, nextState: r }
}), Ct = (e = {}) => ({
  dashboardId: null,
  datasetId: null,
  globalFilters: [],
  selections: [],
  drillPath: [],
  panelStateById: {},
  ...e
}), Pt = (e, r, t) => ({
  ...e,
  [r]: {
    ...e[r] || {},
    ...t
  }
}), wt = (e, r) => {
  switch (r.type) {
    case O.SET_CONTEXT:
      return {
        ...e,
        dashboardId: r.payload.dashboardId ?? e.dashboardId,
        datasetId: r.payload.datasetId ?? e.datasetId
      };
    case O.SET_GLOBAL_FILTERS:
      return {
        ...e,
        globalFilters: r.payload.filters
      };
    case O.ADD_SELECTION:
      return {
        ...e,
        selections: [...e.selections, r.payload.selection]
      };
    case O.REMOVE_SELECTION:
      return {
        ...e,
        selections: e.selections.filter(
          (t) => t.id !== r.payload.selectionId
        )
      };
    case O.CLEAR_SELECTIONS:
      return {
        ...e,
        selections: []
      };
    case O.PUSH_DRILL:
      return {
        ...e,
        drillPath: [...e.drillPath, r.payload.entry]
      };
    case O.POP_DRILL:
      return {
        ...e,
        drillPath: e.drillPath.slice(0, -1)
      };
    case O.SET_PANEL_STATE:
      return {
        ...e,
        panelStateById: Pt(
          e.panelStateById,
          r.payload.panelId,
          r.payload.nextState
        )
      };
    default:
      return e;
  }
}, jr = mr(null), Rr = mr(null), Dt = (e) => ({
  setDashboardContext: (r) => e(gt(r)),
  setGlobalFilters: (r) => e(Et(r)),
  addSelection: (r) => e(xt(r)),
  removeSelection: (r) => e(St(r)),
  clearSelections: () => e(jt()),
  pushDrillPath: (r) => e(Rt(r)),
  popDrillPath: () => e(Nt()),
  setPanelState: (r, t) => e(Tt(r, t))
}), Ja = ({ children: e, initialState: r }) => {
  const [t, n] = ft(
    wt,
    Ct(r)
  ), s = z(() => Dt(n), [n]);
  return /* @__PURE__ */ u.jsx(jr.Provider, { value: t, children: /* @__PURE__ */ u.jsx(Rr.Provider, { value: s, children: e }) });
}, Xa = () => {
  const e = vr(jr);
  if (!e)
    throw new Error("useDashboardState must be used within a DashboardProvider");
  return e;
}, Qa = () => {
  const e = vr(Rr);
  if (!e)
    throw new Error("useDashboardActions must be used within a DashboardProvider");
  return e;
}, Ot = 12, ce = (e, r) => typeof e != "number" || Number.isNaN(e) ? r : e > 0 ? e : r, kt = (e) => {
  if (!e)
    return "radf-grid__item";
  const r = ce(e.x, 1), t = ce(e.y, 1), n = ce(e.w, Ot), s = ce(e.h, 1);
  return [
    "radf-grid__item",
    `radf-grid__item--col-start-${r}`,
    `radf-grid__item--col-span-${n}`,
    `radf-grid__item--row-start-${t}`,
    `radf-grid__item--row-span-${s}`
  ].join(" ");
};
function Ha({ panels: e, renderPanel: r, className: t }) {
  const n = ["radf-grid", t].filter(Boolean).join(" ");
  return /* @__PURE__ */ u.jsx("div", { className: n, children: e.map((s) => /* @__PURE__ */ u.jsx("div", { className: kt(s.layout), children: r(s) }, s.id)) });
}
function Lt({ title: e, subtitle: r, actions: t }) {
  return !e && !r && !t ? null : /* @__PURE__ */ u.jsxs("div", { className: "radf-panel__header", children: [
    /* @__PURE__ */ u.jsxs("div", { className: "radf-panel__heading", children: [
      e ? /* @__PURE__ */ u.jsx("h2", { className: "radf-panel__title", children: e }) : null,
      r ? /* @__PURE__ */ u.jsx("p", { className: "radf-panel__subtitle", children: r }) : null
    ] }),
    t ? /* @__PURE__ */ u.jsx("div", { className: "radf-panel__actions", children: t }) : null
  ] });
}
function It({ message: e = "Loading data…" }) {
  return /* @__PURE__ */ u.jsxs("div", { className: "radf-panel__state radf-panel__state--loading", children: [
    /* @__PURE__ */ u.jsx("span", { className: "radf-panel__state-icon", "aria-hidden": "true", children: "⏳" }),
    /* @__PURE__ */ u.jsx("p", { className: "radf-panel__state-text", children: e })
  ] });
}
function $t({ title: e = "No data yet", message: r = "Try adjusting filters or refreshing the panel." }) {
  return /* @__PURE__ */ u.jsxs("div", { className: "radf-panel__state radf-panel__state--empty", children: [
    /* @__PURE__ */ u.jsx("p", { className: "radf-panel__state-title", children: e }),
    /* @__PURE__ */ u.jsx("p", { className: "radf-panel__state-text", children: r })
  ] });
}
function At({ title: e = "Something went wrong", message: r = "Please try again." }) {
  return /* @__PURE__ */ u.jsxs("div", { className: "radf-panel__state radf-panel__state--error", children: [
    /* @__PURE__ */ u.jsx("p", { className: "radf-panel__state-title", children: e }),
    /* @__PURE__ */ u.jsx("p", { className: "radf-panel__state-text", children: r })
  ] });
}
const Mt = (e) => e ? typeof e == "string" ? e : e.message || "Something went wrong." : null;
function Ft({ status: e = "ready", isEmpty: r = !1, emptyMessage: t, error: n, children: s }) {
  let i = /* @__PURE__ */ u.jsx("div", { className: "radf-panel__content", children: s });
  return e === "loading" && (i = /* @__PURE__ */ u.jsx(It, {})), e === "error" && (i = /* @__PURE__ */ u.jsx(At, { message: Mt(n) })), (e === "empty" || r) && (i = /* @__PURE__ */ u.jsx($t, { message: t })), /* @__PURE__ */ u.jsx("div", { className: "radf-panel__body", children: i });
}
function Za({
  title: e,
  subtitle: r,
  actions: t,
  className: n,
  status: s,
  error: i,
  isEmpty: f,
  emptyMessage: l,
  footer: c,
  children: d
}) {
  const m = ["radf-panel", n].filter(Boolean).join(" ");
  return /* @__PURE__ */ u.jsxs("section", { className: m, children: [
    /* @__PURE__ */ u.jsx(Lt, { title: e, subtitle: r, actions: t }),
    /* @__PURE__ */ u.jsx(
      Ft,
      {
        status: s,
        error: i,
        isEmpty: f,
        emptyMessage: l,
        children: d
      }
    ),
    c ? /* @__PURE__ */ u.jsx("div", { className: "radf-panel__footer", children: c }) : null
  ] });
}
const zt = (e = []) => e.length ? /* @__PURE__ */ u.jsx("ul", { className: "radf-insight-card__evidence", children: e.map((r, t) => /* @__PURE__ */ u.jsx("li", { className: "radf-insight-card__evidence-item", children: r }, `${r}-${t}`)) }) : null;
function qa({ insights: e = [] }) {
  return /* @__PURE__ */ u.jsx("div", { className: "radf-insights", children: e.map((r) => /* @__PURE__ */ u.jsxs(
    "article",
    {
      className: `radf-insight-card radf-insight-card--${r.severity || "info"}`,
      children: [
        /* @__PURE__ */ u.jsxs("header", { className: "radf-insight-card__header", children: [
          /* @__PURE__ */ u.jsxs("div", { children: [
            /* @__PURE__ */ u.jsx("h3", { className: "radf-insight-card__title", children: r.title }),
            r.source ? /* @__PURE__ */ u.jsxs("p", { className: "radf-insight-card__source", children: [
              "Source: ",
              r.source
            ] }) : null
          ] }),
          r.severity ? /* @__PURE__ */ u.jsx("span", { className: "radf-insight-card__badge", children: r.severity }) : null
        ] }),
        r.narrative ? /* @__PURE__ */ u.jsx("p", { className: "radf-insight-card__narrative", children: r.narrative }) : null,
        zt(r.evidence),
        r.recommendedAction ? /* @__PURE__ */ u.jsxs("p", { className: "radf-insight-card__action", children: [
          /* @__PURE__ */ u.jsx("strong", { children: "Recommended:" }),
          " ",
          r.recommendedAction
        ] }) : null
      ]
    },
    r.id
  )) });
}
const Nr = (e = "registry") => {
  const r = /* @__PURE__ */ new Map();
  return {
    label: e,
    register: (n, s) => {
      if (!n)
        throw new Error(`${e} key is required.`);
      if (!s)
        throw new Error(`${e} component is required.`);
      return r.set(n, s), s;
    },
    get: (n) => r.get(n),
    has: (n) => r.has(n),
    list: () => Array.from(r.keys())
  };
}, Tr = Nr("vizRegistry"), Vt = Nr("insightRegistry"), Ee = (e, r) => Tr.register(e, r), xe = (e, r) => Vt.register(e, r), tr = 12, Kt = 9, Bt = 4, Cr = (e, r, t) => Number.isFinite(e) ? Math.min(t, Math.max(r, Math.trunc(e))) : r, Q = (e, r = tr) => {
  const t = Number.isInteger(e) ? e : 0, n = Number.isInteger(r) && r > 0 ? r : tr;
  return `var(--radf-series-${(t % n + n) % n + 1})`;
}, Se = (e) => `var(--radf-seq-${Cr(e, 1, Kt)})`, W = (e, r) => {
  if (e === "zero")
    return "var(--radf-div-zero)";
  const t = Cr(r, 1, Bt);
  return `var(--radf-div-${e === "neg" ? "neg" : "pos"}-${t})`;
}, Ut = /* @__PURE__ */ new Set(["kpi", "text", "metric", "number", "markdown"]), Yt = /* @__PURE__ */ new Set(["line", "area", "composed", "time-series", "timeseries"]), Wt = /* @__PURE__ */ new Set(["bar", "column", "histogram"]), Gt = /* @__PURE__ */ new Set(["heatmap", "choropleth", "density"]), M = (e) => e == null ? null : String(e), re = (e) => {
  if (!Array.isArray(e))
    return [];
  const r = /* @__PURE__ */ new Set(), t = [];
  return e.forEach((n) => {
    const s = M(n);
    !s || r.has(s) || (r.add(s), t.push(s));
  }), t;
}, Pr = (e) => Array.isArray(e == null ? void 0 : e.series) ? e.series.map((r) => ({
  key: M(r == null ? void 0 : r.key),
  label: (r == null ? void 0 : r.label) ?? M(r == null ? void 0 : r.key)
})).filter((r) => r.key) : [], Jt = ({ encodings: e, options: r, panelConfig: t, data: n }) => {
  const s = Pr(t);
  if (s.length)
    return s.map((i) => i.key);
  if (Array.isArray(r == null ? void 0 : r.seriesKeys) && r.seriesKeys.length)
    return re(r.seriesKeys);
  if (Array.isArray(r == null ? void 0 : r.stackedKeys) && r.stackedKeys.length)
    return re(r.stackedKeys);
  if (Array.isArray(e == null ? void 0 : e.y))
    return re(e.y);
  if (e != null && e.y)
    return re([e.y]);
  if (Array.isArray(n) && n.length > 0) {
    const i = n[0] || {};
    return re(Object.keys(i).filter((f) => f !== (e == null ? void 0 : e.x)));
  }
  return [];
}, ar = (e) => Array.isArray(e == null ? void 0 : e.y) ? e.y[0] : (e == null ? void 0 : e.y) ?? null, Xt = ({ panelConfig: e, vizType: r, options: t }) => e != null && e.paletteIntent ? e.paletteIntent : (t == null ? void 0 : t.diverging) === !0 ? "diverging" : Gt.has(r) ? "sequential" : "categorical", G = ({ seriesKeys: e, seriesDefinitions: r }) => {
  const t = new Map(r.map((i) => [i.key, i.label])), n = e.map((i, f) => ({
    key: i,
    label: t.get(i) ?? i,
    colorVar: Q(f)
  })), s = new Map(n.map((i) => [i.key, i.colorVar]));
  return {
    items: n,
    getColor: (i) => s.get(M(i)) ?? Q(0),
    getLabel: (i) => t.get(M(i)) ?? M(i)
  };
}, Qt = ({ data: e, xKey: r }) => {
  const t = Array.isArray(e) ? e.map((l) => l == null ? void 0 : l[r]).filter((l) => l != null) : [], n = Array.from(new Set(t)), s = n.every((l) => typeof l == "number");
  n.sort((l, c) => s ? l - c : String(l).localeCompare(String(c), void 0, { numeric: !0 }));
  const i = n.map((l, c) => {
    const d = M(l);
    return {
      key: d,
      label: d,
      colorVar: Q(c)
    };
  }), f = new Map(i.map((l) => [l.key, l.colorVar]));
  return {
    items: i,
    getColor: (l) => f.get(M(l)) ?? Q(0),
    getLabel: (l) => M(l)
  };
}, Ht = ({ data: e, valueKey: r }) => {
  const t = Array.isArray(e) ? e.map((d) => d == null ? void 0 : d[r]).filter((d) => typeof d == "number" && Number.isFinite(d)) : [];
  let n = 0, s = 0;
  t.forEach((d) => {
    n = Math.min(n, d), s = Math.max(s, d);
  });
  const i = Math.max(Math.abs(n), Math.abs(s)), f = n < 0 && s > 0;
  return {
    items: [
      { key: "neg", label: "Negative", colorVar: W("neg", 3) },
      { key: "zero", label: "Neutral", colorVar: W("zero") },
      { key: "pos", label: "Positive", colorVar: W("pos", 3) }
    ],
    getColor: (d) => {
      if (!f || !Number.isFinite(d))
        return Q(0);
      if (d === 0)
        return W("zero");
      if (i === 0)
        return W(d < 0 ? "neg" : "pos", 1);
      const m = Math.min(1, Math.abs(d) / i), y = Math.max(1, Math.ceil(m * 4));
      return W(d < 0 ? "neg" : "pos", y);
    },
    getLabel: (d) => d === "neg" ? "Negative" : d === "pos" ? "Positive" : d === "zero" ? "Neutral" : null
  };
}, Zt = ({ data: e, valueKey: r }) => {
  const t = Array.isArray(e) ? e.map((l) => l == null ? void 0 : l[r]).filter((l) => typeof l == "number" && Number.isFinite(l)) : [];
  let n = 0, s = 0;
  t.forEach((l) => {
    n = Math.min(n, l), s = Math.max(s, l);
  });
  const i = s - n;
  return {
    items: [],
    getColor: (l) => {
      if (!Number.isFinite(l))
        return Se(1);
      if (i === 0)
        return Se(5);
      const c = (l - n) / i, d = Math.max(1, Math.min(9, Math.ceil(c * 9)));
      return Se(d);
    },
    getLabel: () => null
  };
}, qt = ({
  panelConfig: e,
  vizType: r,
  encodings: t,
  options: n,
  data: s
}) => {
  if ((e == null ? void 0 : e.panelType) !== "viz" || Ut.has(r))
    return null;
  const i = Xt({ panelConfig: e, vizType: r, options: n });
  if (i === "none")
    return null;
  const f = Pr(e), l = Jt({ encodings: t, options: n, panelConfig: e, data: s }), c = f.length > 0 || Array.isArray(t == null ? void 0 : t.y) || Array.isArray(n == null ? void 0 : n.seriesKeys) && n.seriesKeys.length > 1 || Array.isArray(n == null ? void 0 : n.stackedKeys) && n.stackedKeys.length > 0;
  if (i === "diverging" && (n == null ? void 0 : n.diverging) === !0) {
    const m = ar(t);
    return {
      mode: "diverging",
      ...Ht({ data: s, valueKey: m })
    };
  }
  if (i === "sequential") {
    const m = ar(t);
    return {
      mode: "sequential",
      ...Zt({ data: s, valueKey: m })
    };
  }
  return Yt.has(r) ? c ? {
    mode: "series",
    ...G({ seriesKeys: l, seriesDefinitions: f })
  } : { mode: "single", ...G({
    seriesKeys: l.slice(0, 1),
    seriesDefinitions: f
  }) } : Wt.has(r) ? c ? {
    mode: "series",
    ...G({ seriesKeys: l, seriesDefinitions: f })
  } : (n == null ? void 0 : n.colorBy) === "category" || (n == null ? void 0 : n.legendMode) === "category" || (n == null ? void 0 : n.legend) === !0 ? {
    mode: "category",
    ...Qt({ data: s, xKey: t == null ? void 0 : t.x })
  } : { mode: "single", ...G({
    seriesKeys: l.slice(0, 1),
    seriesDefinitions: f
  }) } : l.length > 1 ? {
    mode: "series",
    ...G({ seriesKeys: l, seriesDefinitions: f })
  } : { mode: "single", ...G({
    seriesKeys: l.slice(0, 1),
    seriesDefinitions: f
  }) };
}, ea = (e) => {
  if (typeof e != "string")
    return "radf-swatch--1";
  const r = e.match(/--radf-series-(\d+)/);
  if (r)
    return `radf-swatch--${r[1]}`;
  const t = e.match(/--radf-seq-(\d+)/);
  if (t)
    return `radf-swatch--seq-${t[1]}`;
  const n = e.match(/--radf-div-neg-(\d+)/);
  if (n)
    return `radf-swatch--div-neg-${n[1]}`;
  const s = e.match(/--radf-div-pos-(\d+)/);
  return s ? `radf-swatch--div-pos-${s[1]}` : e.includes("--radf-div-zero") ? "radf-swatch--div-zero" : "radf-swatch--1";
};
function ra({
  items: e = [],
  hiddenKeys: r,
  onToggle: t,
  position: n = "bottom"
}) {
  if (!e.length)
    return null;
  const s = typeof t == "function";
  return /* @__PURE__ */ u.jsx("div", { className: ["radf-legend", `radf-legend--${n}`].join(" "), children: /* @__PURE__ */ u.jsx("ul", { className: "radf-legend__list", children: e.map((i) => {
    const f = r == null ? void 0 : r.has(i.key), l = ea(i.colorVar);
    return /* @__PURE__ */ u.jsx(
      "li",
      {
        className: [
          "radf-legend__item",
          l,
          s ? "radf-legend__item--toggleable" : "",
          f ? "radf-legend__item--hidden" : ""
        ].filter(Boolean).join(" "),
        children: /* @__PURE__ */ u.jsxs(
          "button",
          {
            className: "radf-legend__button",
            type: "button",
            onClick: () => {
              s && t(i.key);
            },
            children: [
              /* @__PURE__ */ u.jsx("span", { className: "radf-legend__swatch" }),
              /* @__PURE__ */ u.jsx("span", { className: "radf-legend__label", children: i.label })
            ]
          }
        )
      },
      i.key
    );
  }) }) });
}
function en({
  panelConfig: e,
  vizType: r,
  data: t,
  encodings: n,
  options: s,
  handlers: i
}) {
  const f = Tr.get(r), l = z(
    () => qt({
      panelConfig: e,
      vizType: r,
      encodings: n,
      options: s,
      data: t
    }),
    [e, r, n, s, t]
  ), [c, d] = _r(/* @__PURE__ */ new Set()), m = z(() => (l == null ? void 0 : l.items) ?? [], [l]), y = (s == null ? void 0 : s.legendMode) ?? "auto", _ = (s == null ? void 0 : s.legendPosition) ?? "bottom", T = (s == null ? void 0 : s.legend) !== !1 && m.length > 0 && (y !== "auto" || m.length > 1), P = (l == null ? void 0 : l.mode) === "series" || (l == null ? void 0 : l.mode) === "category", b = yr(
    (j) => {
      P && d((L) => {
        const D = new Set(L);
        return D.has(j) ? D.delete(j) : D.add(j), D;
      });
    },
    [P]
  );
  if (br(() => {
    if (!c.size)
      return;
    const j = new Set(m.map((D) => D.key)), L = [...c].filter((D) => j.has(D));
    L.length !== c.size && d(new Set(L));
  }, [m, c]), !f)
    return /* @__PURE__ */ u.jsxs("div", { className: "radf-viz__missing", children: [
      /* @__PURE__ */ u.jsx("p", { className: "radf-viz__missing-title", children: "Visualization unavailable" }),
      /* @__PURE__ */ u.jsxs("p", { className: "radf-viz__missing-text", children: [
        'The viz type "',
        r,
        '" has not been registered yet.'
      ] })
    ] });
  const x = _ === "right" ? "radf-viz__layout radf-viz__layout--right" : "radf-viz__layout", g = T ? /* @__PURE__ */ u.jsx(
    ra,
    {
      items: m,
      hiddenKeys: c,
      onToggle: P ? b : void 0,
      position: _
    }
  ) : null, N = /* @__PURE__ */ u.jsx(
    f,
    {
      data: t,
      encodings: n,
      options: s,
      handlers: i,
      colorAssignment: l,
      hiddenKeys: c
    }
  );
  return /* @__PURE__ */ u.jsxs("div", { className: x, children: [
    _ === "top" ? g : null,
    N,
    _ !== "top" ? g : null
  ] });
}
function wr({ title: e, subtitle: r, footer: t, children: n }) {
  return /* @__PURE__ */ u.jsxs("div", { className: "radf-chart", children: [
    (e || r) && /* @__PURE__ */ u.jsx("div", { className: "radf-chart__header", children: /* @__PURE__ */ u.jsxs("div", { className: "radf-chart__heading", children: [
      e ? /* @__PURE__ */ u.jsx("p", { className: "radf-chart__title", children: e }) : null,
      r ? /* @__PURE__ */ u.jsx("p", { className: "radf-chart__subtitle", children: r }) : null
    ] }) }),
    /* @__PURE__ */ u.jsx("div", { className: "radf-chart__canvas", children: n }),
    t ? /* @__PURE__ */ u.jsx("div", { className: "radf-chart__footer", children: t }) : null
  ] });
}
const Dr = 12, ta = (e) => {
  if (!Array.isArray(e))
    return [];
  const r = /* @__PURE__ */ new Set(), t = [];
  return e.forEach((n) => {
    if (n == null)
      return;
    const s = String(n);
    r.has(s) || (r.add(s), t.push(s));
  }), t;
}, X = (e, r = Dr) => Q(e, r), Or = (e) => ta(e).reduce((t, n, s) => (t[n] = X(s, Dr), t), {}), nr = 12, aa = Array.from(
  { length: nr },
  (e, r) => X(r, nr)
), na = (e) => `radf-chart-color-${(Number.isInteger(e) ? e : 0) % aa.length}`;
function kr({ active: e, label: r, payload: t }) {
  return !e || !t || t.length === 0 ? null : /* @__PURE__ */ u.jsxs("div", { className: "radf-chart-tooltip", children: [
    r ? /* @__PURE__ */ u.jsx("p", { className: "radf-chart-tooltip__label", children: r }) : null,
    /* @__PURE__ */ u.jsx("ul", { className: "radf-chart-tooltip__list", children: t.map((n, s) => /* @__PURE__ */ u.jsxs("li", { className: "radf-chart-tooltip__item", children: [
      /* @__PURE__ */ u.jsx(
        "span",
        {
          className: [
            "radf-chart-tooltip__swatch",
            na(s)
          ].join(" ")
        }
      ),
      /* @__PURE__ */ u.jsx("span", { className: "radf-chart-tooltip__name", children: n.name }),
      /* @__PURE__ */ u.jsx("span", { className: "radf-chart-tooltip__value", children: n.value })
    ] }, n.dataKey || n.name || s)) })
  ] });
}
const sa = (e, r) => e ? Array.isArray(e.y) ? e.y : e.y ? [e.y] : r != null && r.length ? Object.keys(r[0]).filter((t) => t !== e.x) : [] : [];
function ia({
  data: e = [],
  encodings: r = {},
  options: t = {},
  handlers: n = {},
  colorAssignment: s,
  hiddenKeys: i
}) {
  const f = (s == null ? void 0 : s.mode) === "series" || (s == null ? void 0 : s.mode) === "single" ? s.items.map((b) => b.key) : [], l = f.length ? f : sa(r, e), c = l.filter(
    (b) => !(i != null && i.has(String(b)))
  ), d = t.tooltip !== !1, m = t.brush || {}, y = !!m.enabled && e.length > 1, _ = z(
    () => Or(l),
    [l]
  ), T = typeof m.startIndex == "number" ? m.startIndex : void 0, P = typeof m.endIndex == "number" ? m.endIndex : void 0;
  return /* @__PURE__ */ u.jsx(wr, { children: /* @__PURE__ */ u.jsx(pr, { width: "100%", height: 280, children: /* @__PURE__ */ u.jsxs(ht, { data: e, margin: { top: 8, right: 16, left: 0, bottom: 8 }, children: [
    /* @__PURE__ */ u.jsx(gr, { stroke: "var(--radf-chart-grid)", strokeDasharray: "3 3" }),
    /* @__PURE__ */ u.jsx(
      Er,
      {
        dataKey: r.x,
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    /* @__PURE__ */ u.jsx(
      xr,
      {
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    d ? /* @__PURE__ */ u.jsx(Sr, { content: /* @__PURE__ */ u.jsx(kr, {}) }) : null,
    c.map((b, x) => {
      var g;
      return /* @__PURE__ */ u.jsx(
        mt,
        {
          type: "monotone",
          dataKey: b,
          stroke: ((g = s == null ? void 0 : s.getColor) == null ? void 0 : g.call(s, b)) || _[b] || X(x),
          strokeWidth: 2,
          dot: { r: 3 },
          activeDot: { r: 5, onClick: n.onClick },
          onClick: n.onClick
        },
        b
      );
    }),
    y ? /* @__PURE__ */ u.jsx(
      vt,
      {
        className: "radf-chart__brush",
        dataKey: r.x,
        height: 24,
        travellerWidth: 12,
        stroke: "var(--radf-accent-primary)",
        startIndex: T,
        endIndex: P,
        onChange: (b) => {
          n.onBrushChange && n.onBrushChange({
            ...b,
            data: e,
            dataKey: r.x
          });
        }
      }
    ) : null
  ] }) }) });
}
const la = (e, r) => e ? Array.isArray(e.y) ? e.y : e.y ? [e.y] : r != null && r.length ? Object.keys(r[0]).filter((t) => t !== e.x) : [] : [];
function oa({
  data: e = [],
  encodings: r = {},
  options: t = {},
  handlers: n = {},
  colorAssignment: s,
  hiddenKeys: i
}) {
  var x;
  const f = (s == null ? void 0 : s.mode) === "series" || (s == null ? void 0 : s.mode) === "single" ? s.items.map((g) => g.key) : [], l = f.length ? f : la(r, e), c = t.tooltip !== !1, d = t.stacked === !0 || Array.isArray(t.stackedKeys), m = z(
    () => Or(l),
    [l]
  ), y = l.filter(
    (g) => !(i != null && i.has(String(g)))
  ), _ = (s == null ? void 0 : s.mode) === "category", T = (s == null ? void 0 : s.mode) === "series", P = (s == null ? void 0 : s.mode) === "category" || (s == null ? void 0 : s.mode) === "diverging" || (s == null ? void 0 : s.mode) === "sequential", b = _ && (i != null && i.size) ? e.filter((g) => !i.has(String(g == null ? void 0 : g[r.x]))) : e;
  return /* @__PURE__ */ u.jsx(wr, { children: /* @__PURE__ */ u.jsx(pr, { width: "100%", height: 280, children: /* @__PURE__ */ u.jsxs(_t, { data: b, margin: { top: 8, right: 16, left: 0, bottom: 8 }, children: [
    /* @__PURE__ */ u.jsx(gr, { stroke: "var(--radf-chart-grid)", strokeDasharray: "3 3" }),
    /* @__PURE__ */ u.jsx(
      Er,
      {
        dataKey: r.x,
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    /* @__PURE__ */ u.jsx(
      xr,
      {
        tick: { fill: "var(--radf-text-muted)", fontSize: 12 },
        axisLine: { stroke: "var(--radf-border-divider)" }
      }
    ),
    c ? /* @__PURE__ */ u.jsx(Sr, { content: /* @__PURE__ */ u.jsx(kr, {}) }) : null,
    T ? y.map((g, N) => {
      var j;
      return /* @__PURE__ */ u.jsx(
        qe,
        {
          dataKey: g,
          fill: ((j = s == null ? void 0 : s.getColor) == null ? void 0 : j.call(s, g)) || m[g] || X(N),
          stackId: d ? "radf-stack" : void 0,
          radius: [6, 6, 0, 0],
          onClick: n.onClick
        },
        g
      );
    }) : /* @__PURE__ */ u.jsx(
      qe,
      {
        dataKey: r.y,
        fill: ((x = s == null ? void 0 : s.getColor) == null ? void 0 : x.call(s, r.y)) || X(0),
        radius: [6, 6, 0, 0],
        onClick: n.onClick,
        children: P ? b.map((g, N) => {
          var V, A;
          const j = g == null ? void 0 : g[r.x], L = g == null ? void 0 : g[r.y], D = (s == null ? void 0 : s.mode) === "category" ? (V = s == null ? void 0 : s.getColor) == null ? void 0 : V.call(s, j) : (A = s == null ? void 0 : s.getColor) == null ? void 0 : A.call(s, L);
          return /* @__PURE__ */ u.jsx(
            yt,
            {
              fill: D || X(N)
            },
            `cell-${N}`
          );
        }) : null
      }
    )
  ] }) }) });
}
const ua = (e, r) => e != null && e.value ? e.value : e != null && e.y ? e.y : r != null && r.length ? Object.keys(r[0]).find((t) => typeof r[0][t] == "number") : null, ca = (e, r, t = {}) => e == null || Number.isNaN(e) ? "--" : typeof e != "number" ? String(e) : r === "currency" ? e.toLocaleString(void 0, {
  style: "currency",
  currency: t.currency || "USD",
  maximumFractionDigits: 0
}) : r === "percent" ? `${(e * 100).toFixed(1)}%` : r === "integer" ? Math.round(e).toLocaleString() : e.toLocaleString(void 0, { maximumFractionDigits: 2 });
function fa({ data: e = [], encodings: r = {}, options: t = {} }) {
  var l;
  const n = z(() => ua(r, e), [r, e]), s = n ? (l = e == null ? void 0 : e[0]) == null ? void 0 : l[n] : null, i = ca(s, t.format, t), f = t.label || (r == null ? void 0 : r.label);
  return /* @__PURE__ */ u.jsxs("div", { className: "radf-kpi", children: [
    f ? /* @__PURE__ */ u.jsx("div", { className: "radf-kpi__label", children: f }) : null,
    /* @__PURE__ */ u.jsx("div", { className: "radf-kpi__value", children: i }),
    t.caption ? /* @__PURE__ */ u.jsx("div", { className: "radf-kpi__caption", children: t.caption }) : null
  ] });
}
const rn = () => {
  Ee("line", ia), Ee("bar", oa), Ee("kpi", fa);
}, Te = (e, r) => {
  var s;
  if ((s = r == null ? void 0 : r.measures) != null && s.length)
    return r.measures[0];
  const t = e == null ? void 0 : e[0];
  return t && Object.keys(t).find((i) => typeof t[i] == "number") || null;
}, J = (e) => e == null || Number.isNaN(e) ? "0" : Number(e).toLocaleString(void 0, { maximumFractionDigits: 2 }), da = (e, r) => (e || []).map((t) => Number(t == null ? void 0 : t[r])).filter((t) => Number.isFinite(t)), ha = ({ rows: e, querySpec: r, meta: t }) => {
  const n = Te(e, r);
  if (!n)
    return [];
  const s = da(e, n);
  if (s.length < 2)
    return [];
  const i = s[0], f = s[s.length - 1], l = f - i, c = i !== 0 ? l / Math.abs(i) : null, d = l > 0 ? "upward" : l < 0 ? "downward" : "flat", m = c != null ? Math.abs(c) : null, y = m == null ? "info" : m > 0.2 ? "positive" : m > 0.08 ? "info" : "neutral", _ = c == null ? null : `${Math.abs(c * 100).toFixed(1)}%`, T = (t == null ? void 0 : t.rowCount) ?? (e == null ? void 0 : e.length) ?? 0, P = d === "flat" ? `The ${n} metric stayed flat across ${T} points.` : `The ${n} metric moved ${d}, changing ${_ || J(Math.abs(l))} from ${J(i)} to ${J(f)} across ${T} points.`;
  return {
    title: `Trend is ${d}`,
    severity: y,
    narrative: P,
    recommendedAction: d === "downward" ? "Investigate recent drivers impacting the downward shift." : d === "upward" ? "Sustain the current momentum and identify leading contributors." : "Monitor for any emerging shifts over the next period.",
    evidence: [
      `Start: ${J(i)}`,
      `End: ${J(f)}`,
      _ ? `Net change: ${_}` : `Net change: ${J(l)}`
    ]
  };
}, sr = {
  id: "trend",
  label: "Trend Summary",
  analyze: ha
}, ma = (e) => e.reduce((r, t) => r + t, 0) / e.length, va = (e, r) => {
  const t = e.reduce((n, s) => n + (s - r) ** 2, 0) / e.length;
  return Math.sqrt(t);
}, _a = ({ rows: e, querySpec: r }) => {
  const t = Te(e, r);
  if (!t)
    return [];
  const n = (e || []).map((c) => Number(c == null ? void 0 : c[t])).filter((c) => Number.isFinite(c));
  if (n.length < 5)
    return [];
  const s = n[n.length - 1], i = ma(n.slice(0, -1)), f = va(n.slice(0, -1), i);
  if (f === 0)
    return [];
  const l = (s - i) / f;
  return Math.abs(l) < 2.2 ? [] : {
    title: "Recent anomaly detected",
    severity: l > 0 ? "warning" : "negative",
    narrative: `The latest ${t} value deviates from the recent average by ${Math.abs(l).toFixed(1)} standard deviations.`,
    recommendedAction: "Review the contributing drivers behind this spike or dip.",
    evidence: [
      `Latest value: ${s.toLocaleString()}`,
      `Recent average: ${i.toFixed(1)}`
    ]
  };
}, ir = {
  id: "anomaly",
  label: "Anomaly Detection",
  analyze: _a
}, ya = ({ rows: e, querySpec: r }) => {
  var m;
  const t = (m = r == null ? void 0 : r.dimensions) == null ? void 0 : m[0], n = Te(e, r);
  if (!t || !n)
    return [];
  const s = (e || []).filter((y) => y && y[t] != null);
  if (s.length < 2)
    return [];
  const i = s.reduce((y, _) => y + Number(_[n] || 0), 0);
  if (!i)
    return [];
  const f = [...s].sort((y, _) => (_[n] || 0) - (y[n] || 0)), l = f[0], c = Number(l[n] || 0) / i;
  if (c < 0.2)
    return [];
  const d = f.slice(0, 3).map((y) => {
    const _ = Number(y[n] || 0), T = i ? `${(_ / i * 100).toFixed(1)}%` : "0%";
    return `${y[t]}: ${_.toLocaleString()} (${T})`;
  });
  return {
    title: `Top driver: ${l[t]}`,
    severity: "info",
    narrative: `${l[t]} contributes ${(c * 100).toFixed(1)}% of ${n}.`,
    recommendedAction: `Validate why ${l[t]} is outpacing other segments and replicate the drivers if positive.`,
    evidence: d
  };
}, lr = {
  id: "topDrivers",
  label: "Top Drivers",
  analyze: ya
}, tn = () => {
  xe(sr.id, sr), xe(ir.id, ir), xe(lr.id, lr);
}, ba = (e = {}) => ({
  datasetId: e.datasetId ?? null,
  measures: Array.isArray(e.measures) ? [...e.measures] : [],
  dimensions: Array.isArray(e.dimensions) ? [...e.dimensions] : [],
  filters: Array.isArray(e.filters) ? [...e.filters] : [],
  timeRange: e.timeRange ?? null,
  grain: e.grain ?? null,
  sort: e.sort ?? null,
  limit: e.limit ?? null,
  offset: e.offset ?? null,
  timezone: e.timezone ?? null,
  transforms: Array.isArray(e.transforms) ? [...e.transforms] : []
}), te = (e) => e ? Array.isArray(e) ? e : [e] : [], pa = ({
  dimensions: e = [],
  drillPath: r = [],
  drilldownConfig: t
}) => !t || !r.length ? e : r.reduce((n, s) => !(s != null && s.dimension) || !(s != null && s.to) ? n : n.map(
  (i) => i === s.dimension ? s.to : i
), [...e]), ga = (e) => e ? e.filter ? e.filter : e.filters ? e.filters : e.dimension && e.value !== void 0 ? {
  field: e.dimension,
  op: "IN",
  values: [e.value]
} : null : null, Ea = ({ globalFilters: e, selections: r, drillPath: t, panelFilters: n }) => {
  const s = (r || []).flatMap((f) => f.filter ? te(f.filter) : f.filters ? te(f.filters) : []), i = (t || []).flatMap(
    (f) => te(ga(f))
  );
  return [
    ...te(e),
    ...s,
    ...i,
    ...te(n)
  ].filter(Boolean);
}, an = (e = {}, r = {}) => {
  var f;
  const t = e.query || {}, n = e.datasetId ?? r.datasetId ?? null, s = t.dimensions || [], i = Ea({
    globalFilters: r.globalFilters,
    selections: r.selections,
    drillPath: r.drillPath,
    panelFilters: t.filters
  });
  return ba({
    datasetId: n,
    measures: t.measures || [],
    dimensions: pa({
      dimensions: s,
      drillPath: r.drillPath,
      drilldownConfig: (f = e.interactions) == null ? void 0 : f.drilldown
    }),
    filters: i,
    timeRange: t.timeRange ?? r.timeRange ?? null,
    grain: t.grain ?? null,
    sort: t.sort ?? null,
    limit: t.limit ?? null,
    offset: t.offset ?? null,
    timezone: t.timezone ?? r.timezone ?? null,
    transforms: t.transforms || []
  });
}, xa = (e, { validateResult: r } = {}) => ({
  execute: e,
  validateResult: r
}), Sa = (e) => !!(e && typeof e.execute == "function"), ja = (e) => {
  if (!Sa(e))
    throw new Error("DataProvider must implement execute(querySpec, options)");
  return e;
}, fe = (e) => !!(e && typeof e == "object" && !Array.isArray(e)), ne = (e) => fe(e) ? Object.keys(e).sort().reduce((r, t) => {
  const n = e[t];
  return n === void 0 || (r[t] = Array.isArray(n) ? n.map((s) => ne(s)) : fe(n) ? ne(n) : n), r;
}, {}) : e, Ra = (e) => {
  if (!Array.isArray(e))
    return e;
  const r = e.map(
    (n) => fe(n) ? ne(n) : n
  );
  return r.every(
    (n) => n === null || ["string", "number", "boolean"].includes(typeof n)
  ) ? [...r].sort() : r;
}, Na = (e) => {
  if (!fe(e))
    return e;
  const r = Ra(
    e.values ?? (e.value !== void 0 ? [e.value] : [])
  );
  return {
    ...e,
    values: r
  };
}, Ta = (e) => Array.isArray(e) ? e.filter(Boolean).map((t) => Na(t)).map((t) => ({
  sortKey: JSON.stringify(t),
  filter: t
})).sort((t, n) => t.sortKey.localeCompare(n.sortKey)).map((t) => t.filter) : [], or = (e) => Array.isArray(e) ? [...e.filter(Boolean)].sort() : [], Ca = (e = {}) => ({
  datasetId: e.datasetId ?? null,
  measures: or(e.measures),
  dimensions: or(e.dimensions),
  filters: Ta(e.filters),
  timeRange: e.timeRange ?? null,
  grain: e.grain ?? null,
  sort: ne(e.sort ?? null),
  limit: e.limit ?? null,
  offset: e.offset ?? null,
  timezone: e.timezone ?? null,
  transforms: Array.isArray(e.transforms) ? e.transforms.map((r) => ne(r)) : []
}), Re = (e) => Array.isArray(e) ? `[${e.map((r) => Re(r)).join(",")}]` : e && typeof e == "object" ? `{${Object.keys(e).sort().map((t) => `${JSON.stringify(t)}:${Re(e[t])}`).join(",")}}` : JSON.stringify(e), Pa = (e) => {
  let r = 5381;
  for (let t = 0; t < e.length; t += 1)
    r = r * 33 ^ e.charCodeAt(t);
  return (r >>> 0).toString(16);
}, wa = (e = {}) => {
  const r = Ca(e), t = Re(r);
  return `qs_${Pa(t)}`;
}, Da = () => /* @__PURE__ */ new Map(), ur = (e, r, t) => {
  e.has(r) && e.delete(r), e.set(r, t);
}, Oa = ({ maxSize: e = 500 } = {}) => {
  const r = Da(), t = () => {
    if (e <= 0) {
      r.clear();
      return;
    }
    for (; r.size > e; ) {
      const n = r.keys().next().value;
      r.delete(n);
    }
  };
  return {
    get: (n) => {
      if (!r.has(n))
        return;
      const s = r.get(n);
      return ur(r, n, s), s;
    },
    set: (n, s) => (ur(r, n, s), t(), s),
    has: (n) => r.has(n),
    delete: (n) => r.delete(n),
    clear: () => r.clear(),
    entries: () => Array.from(r.entries()),
    size: () => r.size,
    prune: t
  };
}, ka = Oa(), Ne = () => Date.now(), Lr = (e) => !!(e && typeof e == "object" && !Array.isArray(e)), La = (e) => {
  const r = [];
  return Array.isArray(e == null ? void 0 : e.rows) || r.push("rows must be an array"), (e == null ? void 0 : e.meta) != null && !Lr(e.meta) && r.push("meta must be an object when provided"), r;
}, Ia = (e, r, t) => {
  if (!e)
    return [];
  try {
    const n = e(r, t);
    return n == null || n === !0 ? [] : n === !1 ? ["custom validation failed"] : typeof n == "string" ? [n] : Array.isArray(n) ? n : typeof n == "object" && n.valid === !1 ? Array.isArray(n.errors) ? n.errors : typeof n.error == "string" ? [n.error] : ["custom validation failed"] : [];
  } catch (n) {
    return [(n == null ? void 0 : n.message) || "custom validation threw an error"];
  }
}, $a = (e) => ({
  rows: Array.isArray(e == null ? void 0 : e.rows) ? e.rows : [],
  meta: Lr(e == null ? void 0 : e.meta) ? e.meta : null
}), cr = (e) => ({
  status: (e == null ? void 0 : e.status) ?? "idle",
  data: (e == null ? void 0 : e.data) ?? null,
  meta: (e == null ? void 0 : e.meta) ?? null,
  error: (e == null ? void 0 : e.error) ?? null,
  updatedAt: (e == null ? void 0 : e.updatedAt) ?? null
}), fr = (e, r) => !(e != null && e.updatedAt) || r === 0 ? !0 : r === 1 / 0 ? !1 : Ne() - e.updatedAt > r, nn = (e, {
  provider: r,
  cache: t = ka,
  staleTime: n = 3e4,
  enabled: s = !0,
  onSuccess: i,
  onError: f,
  validateResult: l,
  strictResultValidation: c = !1
} = {}) => {
  const d = z(() => ja(r), [r]), m = z(() => wa(e), [e]), y = dt(null), [_, T] = _r(
    () => cr(t.get(m))
  ), P = yr(async (b) => {
    const x = t.get(b);
    if (x != null && x.promise)
      return x.promise;
    const g = new AbortController();
    y.current = g;
    const N = d.execute(e, { signal: g.signal }).then((j) => {
      const L = l || (d == null ? void 0 : d.validateResult), D = [
        ...La(j),
        ...Ia(L, j, e)
      ].filter(Boolean);
      if (D.length > 0) {
        const se = `Invalid provider result: ${D.join("; ")}`;
        if (c)
          throw new Error(se);
        console.warn(se, { result: j, querySpec: e });
      }
      const V = $a(j), A = {
        status: "success",
        data: D.length > 0 ? [] : V.rows,
        meta: D.length > 0 ? null : V.meta,
        error: null,
        updatedAt: Ne()
      };
      return t.set(b, A), t.prune && t.prune(), T(A), i && i(A), A;
    }).catch((j) => {
      if ((j == null ? void 0 : j.name) === "AbortError")
        return null;
      const L = {
        status: "error",
        data: null,
        meta: null,
        error: j,
        updatedAt: Ne()
      };
      return t.set(b, L), t.prune && t.prune(), T(L), f && f(j), L;
    }).finally(() => {
      const j = t.get(b);
      (j == null ? void 0 : j.promise) === N && t.set(b, { ...j, promise: null });
    });
    return t.set(b, {
      status: (x == null ? void 0 : x.status) ?? "loading",
      data: (x == null ? void 0 : x.data) ?? null,
      meta: (x == null ? void 0 : x.meta) ?? null,
      error: (x == null ? void 0 : x.error) ?? null,
      updatedAt: (x == null ? void 0 : x.updatedAt) ?? null,
      promise: N
    }), t.prune && t.prune(), N;
  }, [
    d,
    t,
    f,
    i,
    e,
    c,
    l
  ]);
  return br(() => {
    if (!s)
      return;
    const b = t.get(m);
    return b != null && b.data ? T(cr(b)) : b || T((x) => ({
      ...x,
      status: "loading",
      error: null
    })), (!b || fr(b, n)) && P(m), () => {
      y.current && y.current.abort();
    };
  }, [m, s, n, t, P]), {
    data: _.data,
    meta: _.meta,
    loading: _.status === "loading",
    error: _.error,
    status: _.status,
    updatedAt: _.updatedAt,
    isStale: fr(t.get(m), n),
    refetch: () => P(m)
  };
}, Aa = (e, r) => new Promise((t, n) => {
  if (r != null && r.aborted) {
    n(new DOMException("Aborted", "AbortError"));
    return;
  }
  const s = setTimeout(t, e);
  r && r.addEventListener(
    "abort",
    () => {
      clearTimeout(s), n(new DOMException("Aborted", "AbortError"));
    },
    { once: !0 }
  );
}), Ma = (e) => {
  let r = e;
  return () => {
    r += 1831565813;
    let t = Math.imul(r ^ r >>> 15, r | 1);
    return t ^= t + Math.imul(t ^ t >>> 7, t | 61), ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}, Fa = (e) => {
  const r = JSON.stringify({
    datasetId: e.datasetId,
    measures: e.measures,
    dimensions: e.dimensions,
    filters: e.filters,
    grain: e.grain,
    timeRange: e.timeRange
  });
  let t = 2166136261;
  for (let n = 0; n < r.length; n += 1)
    t ^= r.charCodeAt(n), t = Math.imul(t, 16777619);
  return t >>> 0;
}, de = (e) => Array.isArray(e) ? e : [], Ir = (e) => e ? Array.isArray(e) ? { start: e[0], end: e[1] } : e.start || e.end ? { start: e.start ?? null, end: e.end ?? null } : null : null, dr = (e) => {
  if (!e)
    return null;
  const r = new Date(e);
  return Number.isNaN(r.getTime()) ? null : r;
}, za = (e) => e.toISOString().slice(0, 10), Va = (e, r, t) => Math.min(t, Math.max(r, e)), Ka = (e) => {
  const t = de(e).find(
    (i) => {
      var f, l;
      return i && i.op === "BETWEEN" && Array.isArray(i.values) && i.values.length >= 2 && (((f = i.field) == null ? void 0 : f.includes("date")) || ((l = i.field) == null ? void 0 : l.includes("day")));
    }
  );
  if (!t)
    return null;
  const [n, s] = t.values;
  return !n && !s ? null : { start: n ?? null, end: s ?? null };
}, ae = {
  category: ["Alpha", "Beta", "Gamma", "Delta"],
  region: ["North", "South", "East", "West"],
  segment: ["Consumer", "SMB", "Enterprise"]
}, Ba = (e) => ae[e] ? ae[e] : e != null && e.includes("region") ? ae.region : e != null && e.includes("segment") ? ae.segment : e != null && e.includes("category") ? ae.category : ["A", "B", "C", "D"].map((t, n) => `${e || "dim"}-${t}${n + 1}`), Ua = ({ measures: e, dimensions: r, timeRange: t, random: n }) => {
  const s = de(r);
  if (!s.length)
    return [
      e.reduce((c, d, m) => (c[d] = Math.round(500 + n() * 500 + m * 40), c), {})
    ];
  const i = [], f = s.map((c) => {
    if (c != null && c.includes("date") || c != null && c.includes("day")) {
      const d = Ir(t), m = dr(d == null ? void 0 : d.start) ?? new Date(Date.now() - 6 * 864e5), y = dr(d == null ? void 0 : d.end) ?? /* @__PURE__ */ new Date(), _ = Va(Math.ceil((y - m) / 864e5) + 1, 2, 14);
      return Array.from({ length: _ }, (T, P) => {
        const b = new Date(m);
        return b.setDate(b.getDate() + P), za(b);
      });
    }
    return Ba(c);
  }), l = (c, d) => {
    if (c >= s.length) {
      const y = { ...d };
      e.forEach((_, T) => {
        const P = n() * 0.3 + 0.85;
        y[_] = Math.round(200 * P + T * 50 + n() * 120);
      }), i.push(y);
      return;
    }
    const m = s[c];
    f[c].forEach((y, _) => {
      l(c + 1, {
        ...d,
        [m]: y,
        [`${m}_order`]: _
      });
    });
  };
  return l(0, {}), i;
}, Ya = async (e, { signal: r } = {}) => {
  const t = Fa(e), n = Ma(t), s = 180 + Math.floor(n() * 220);
  await Aa(s, r);
  const i = de(e.measures), f = de(e.dimensions), l = Ir(e.timeRange) ?? Ka(e.filters), c = Ua({
    measures: i,
    dimensions: f,
    timeRange: l,
    random: n
  }), d = c.reduce((m, y) => (i.forEach((_) => {
    m[_] = (m[_] || 0) + (y[_] || 0);
  }), m), {});
  return {
    rows: c,
    meta: {
      total: d,
      rowCount: c.length,
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }
  };
}, sn = xa(Ya);
export {
  Ja as DashboardProvider,
  Ha as GridLayout,
  qa as InsightsPanel,
  sn as MockDataProvider,
  Za as Panel,
  Ft as PanelBody,
  Lt as PanelHeader,
  en as VizRenderer,
  an as buildQuerySpec,
  rn as registerCharts,
  tn as registerInsights,
  Qa as useDashboardActions,
  Xa as useDashboardState,
  nn as useQuery
};
