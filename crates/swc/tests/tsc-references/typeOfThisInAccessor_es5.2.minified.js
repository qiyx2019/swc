import _class_call_check from "@swc/helpers/lib/_class_call_check.js";
import _create_class from "@swc/helpers/lib/_create_class.js";
var C = function() {
    "use strict";
    function C() {
        _class_call_check(this, C);
    }
    return _create_class(C, [
        {
            key: "x",
            get: function() {
                return 1;
            }
        }
    ], [
        {
            key: "y",
            get: function() {
                return 1;
            }
        }
    ]), C;
}(), D = function() {
    "use strict";
    function D() {
        _class_call_check(this, D);
    }
    return _create_class(D, [
        {
            key: "x",
            get: function() {
                return 1;
            }
        }
    ], [
        {
            key: "y",
            get: function() {
                return 1;
            }
        }
    ]), D;
}();
