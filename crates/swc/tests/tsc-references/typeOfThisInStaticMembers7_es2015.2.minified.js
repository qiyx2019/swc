import _get from "@swc/helpers/lib/_get.js";
import _get_prototype_of from "@swc/helpers/lib/_get_prototype_of.js";
class C {
}
C.a = 1, C.b = C.a + 1;
class D extends C {
}
D.c = 2, D.d = D.c + 1, D.e = 1 + _get(_get_prototype_of(D), "a", D) + (D.c + 1) + 1;
