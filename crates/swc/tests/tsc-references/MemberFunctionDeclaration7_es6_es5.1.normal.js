import _class_call_check from "@swc/helpers/lib/_class_call_check.js";
import regeneratorRuntime from "regenerator-runtime";
// @target: es6
var C = /*#__PURE__*/ function() {
    "use strict";
    function C() {
        _class_call_check(this, C);
    }
    var _proto = C.prototype;
    _proto.foo = regeneratorRuntime.mark(function foo() {
        return regeneratorRuntime.wrap(function foo$(_ctx) {
            while(1)switch(_ctx.prev = _ctx.next){
                case 0:
                case "end":
                    return _ctx.stop();
            }
        }, foo);
    });
    return C;
}();
