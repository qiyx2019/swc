import _class_call_check from "@swc/helpers/lib/_class_call_check.js";
import _construct from "@swc/helpers/lib/_construct.js";
import _tagged_template_literal from "@swc/helpers/lib/_tagged_template_literal.js";
import _to_consumable_array from "@swc/helpers/lib/_to_consumable_array.js";
import _class_static_private_method_get from "@swc/helpers/lib/_class_static_private_method_get.js";
function _templateObject() {
    var data = _tagged_template_literal([
        "head",
        "middle",
        "tail"
    ]);
    _templateObject = function _templateObject() {
        return data;
    };
    return data;
}
function _templateObject1() {
    var data = _tagged_template_literal([
        "test",
        "and",
        ""
    ]);
    _templateObject1 = function _templateObject1() {
        return data;
    };
    return data;
}
function _templateObject2() {
    var data = _tagged_template_literal([
        "head",
        "middle",
        "tail"
    ]);
    _templateObject2 = function _templateObject2() {
        return data;
    };
    return data;
}
// @target: es2015
var AA = /*#__PURE__*/ function() {
    "use strict";
    function AA() {
        _class_call_check(this, AA);
    }
    var _proto = AA.prototype;
    _proto.test = function test() {
        var _instance, _instance1;
        _class_static_private_method_get(AA, AA, method).call(AA);
        var func = _class_static_private_method_get(AA, AA, method);
        func();
        new (_class_static_private_method_get(AA, AA, method))();
        var arr = [
            1,
            2
        ];
        (_instance = _class_static_private_method_get(AA, AA, method2)).call.apply(_instance, [
            AA,
            0
        ].concat(_to_consumable_array(arr), [
            3
        ]));
        var b = _construct(_class_static_private_method_get(AA, AA, method2), [
            0
        ].concat(_to_consumable_array(arr), [
            3
        ])); //Error 
        var str = _class_static_private_method_get(AA, AA, method2).bind(AA)(_templateObject(), 1, 2);
        _class_static_private_method_get(AA.getClass(), AA, method2).bind(AA)(_templateObject1(), 1, 2);
        (_instance1 = _class_static_private_method_get(AA.getClass(), AA, method2)).call.apply(_instance1, [
            AA,
            0
        ].concat(_to_consumable_array(arr), [
            3
        ]));
        var b2 = _construct(_class_static_private_method_get(AA.getClass(), AA, method2), [
            0
        ].concat(_to_consumable_array(arr), [
            3
        ])); //Error 
        var str2 = _class_static_private_method_get(AA.getClass(), AA, method2).bind(AA)(_templateObject2(), 1, 2);
    };
    AA.getClass = function getClass() {
        return AA;
    };
    return AA;
}();
AA.x = 1;
function method() {
    this.x = 10;
}
function method2(a) {
    for(var _len = arguments.length, b = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
        b[_key - 1] = arguments[_key];
    }
}
