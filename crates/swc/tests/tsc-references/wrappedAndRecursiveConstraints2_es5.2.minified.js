import _class_call_check from "@swc/helpers/lib/_class_call_check.js";
var C = function(x) {
    "use strict";
    _class_call_check(this, C);
};
new C(1), new C(new C(""));
