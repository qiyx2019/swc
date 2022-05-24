import _class_call_check from "@swc/helpers/lib/_class_call_check.js";
// @Filename: a.ts
export var A = function A() {
    "use strict";
    _class_call_check(this, A);
};
// @Filename: c.ts
export * from "./b";
new A(); // Error
