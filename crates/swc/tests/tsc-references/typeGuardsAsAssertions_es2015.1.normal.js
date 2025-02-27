// @strictNullChecks: true
// Repro from #8513
let cond;
export const none = {
    none: ''
};
export function isSome(value) {
    return 'some' in value;
}
function someFrom(some) {
    return {
        some
    };
}
export function fn(makeSome) {
    let result = none;
    result; // None
    while(cond){
        result; // Some<r> | None
        result = someFrom(isSome(result) ? result.some : makeSome());
        result; // Some<r>
    }
}
function foo1() {
    let x = 0;
    x; // number
    while(cond){
        x; // number, then string | number
        x = typeof x === "string" ? x.slice() : "abc";
        x; // string
    }
    x;
}
function foo2() {
    let x = 0;
    x; // number
    while(cond){
        x; // number, then string | number
        if (typeof x === "string") {
            x = x.slice();
        } else {
            x = "abc";
        }
        x; // string
    }
    x;
}
// Type guards as assertions
function f1() {
    let x = undefined;
    x; // undefined
    if (x) {
        x; // string | number (guard as assertion)
    }
    x; // string | number | undefined
}
function f2() {
    let x = undefined;
    x; // undefined
    if (typeof x === "string") {
        x; // string (guard as assertion)
    }
    x; // string | undefined
}
function f3() {
    let x = undefined;
    x; // undefined
    if (!x) {
        return;
    }
    x; // string | number (guard as assertion)
}
function f4() {
    let x = undefined;
    x; // undefined
    if (typeof x === "boolean") {
        x; // nothing (boolean not in declared type)
    }
    x; // undefined
}
function f5(x) {
    if (typeof x === "string" && typeof x === "number") {
        x; // number (guard as assertion)
    } else {
        x; // string | number
    }
    x; // string | number
}
function f6() {
    let x;
    x.slice();
    x = "";
    x.slice();
    x = undefined;
    x.slice();
    x = null;
    x.slice();
    x = undefined;
    x.slice();
    x = "";
    x.slice();
    x = "";
    x.slice();
}
function f7() {
    let x;
    x.slice();
}
