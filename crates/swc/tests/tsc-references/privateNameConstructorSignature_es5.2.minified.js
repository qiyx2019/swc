import _class_call_check from "@swc/helpers/lib/_class_call_check.js";
import _class_private_field_init from "@swc/helpers/lib/_class_private_field_init.js";
import _class_private_field_set from "@swc/helpers/lib/_class_private_field_set.js";
var _x = new WeakMap(), C = function() {
    "use strict";
    function C() {
        _class_call_check(this, C), _class_private_field_init(this, _x, {
            writable: !0,
            value: void 0
        });
    }
    return C.test = function() {
        _class_private_field_set(new C(), _x, 10), new new C()().x = 123;
    }, C;
}();
