import _class_call_check from "@swc/helpers/lib/_class_call_check.js";
import _inherits from "@swc/helpers/lib/_inherits.js";
import _create_super from "@swc/helpers/lib/_create_super.js";
var Base = function Base(c) {
    "use strict";
    _class_call_check(this, Base);
};
var D = /*#__PURE__*/ function(Base) {
    "use strict";
    _inherits(D, Base);
    var _super = _create_super(D);
    function D() {
        _class_call_check(this, D);
        var _this;
        _this = _super.call(this, i);
        var s = {
            t: _this._t
        };
        var i = Factory.create(s);
        return _this;
    }
    return D;
}(Base);
