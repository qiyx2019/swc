function indexOf(source, pat, start = 0) {
    if (start >= source.length) {
        return -1;
    }
    if (start < 0) {
        start = 0;
    }
    const s = pat[0];
    for(let i = start; i < source.length; i++){
        if (source[i] !== s) continue;
        const pin = i;
        let matched = 1;
        let j = i;
        while(matched < pat.length){
            j++;
            if (source[j] !== pat[j - pin]) {
                break;
            }
            matched++;
        }
        if (matched === pat.length) {
            return pin;
        }
    }
    return -1;
}
function lastIndexOf(source, pat, start = source.length - 1) {
    if (start < 0) {
        return -1;
    }
    if (start >= source.length) {
        start = source.length - 1;
    }
    const e = pat[pat.length - 1];
    for(let i = start; i >= 0; i--){
        if (source[i] !== e) continue;
        const pin = i;
        let matched = 1;
        let j = i;
        while(matched < pat.length){
            j--;
            if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
                break;
            }
            matched++;
        }
        if (matched === pat.length) {
            return pin - pat.length + 1;
        }
    }
    return -1;
}
function equals(a, b) {
    if (a.length !== b.length) return false;
    for(let i = 0; i < b.length; i++){
        if (a[i] !== b[i]) return false;
    }
    return true;
}
function startsWith(source, prefix) {
    for(let i = 0, max = prefix.length; i < max; i++){
        if (source[i] !== prefix[i]) return false;
    }
    return true;
}
function concat(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b1 of buf){
        output.set(b1, index);
        index += b1.length;
    }
    return output;
}
function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const DEFAULT_BUFFER_SIZE = 32 * 1024;
async function copyN(r, dest, size) {
    let bytesRead = 0;
    let buf = new Uint8Array(DEFAULT_BUFFER_SIZE);
    while(bytesRead < size){
        if (size - bytesRead < DEFAULT_BUFFER_SIZE) {
            buf = new Uint8Array(size - bytesRead);
        }
        const result = await r.read(buf);
        const nread = result ?? 0;
        bytesRead += nread;
        if (nread > 0) {
            let n = 0;
            while(n < nread){
                n += await dest.write(buf.slice(n, nread));
            }
            assert(n === nread, "could not write");
        }
        if (result === null) {
            break;
        }
    }
    return bytesRead;
}
BigInt(Number.MAX_SAFE_INTEGER);
class StringReader extends Deno.Buffer {
    constructor(s){
        super(new TextEncoder().encode(s).buffer);
    }
}
class MultiReader {
    currentIndex = 0;
    constructor(...readers){
        this.readers = readers;
    }
    async read(p) {
        const r = this.readers[this.currentIndex];
        if (!r) return null;
        const result = await r.read(p);
        if (result === null) {
            this.currentIndex++;
            return 0;
        }
        return result;
    }
}
const osType = (()=>{
    if (globalThis.Deno != null) {
        return Deno.build.os;
    }
    const navigator = globalThis.navigator;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path1) {
    if (typeof path1 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path1)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path2, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path2.length; i <= len; ++i){
        if (i < len) code = path2.charCodeAt(i);
        else if (isPathSeparator1(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code)) {
            if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path2.slice(lastSlash + 1, i);
                else res = path2.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep3, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep3 + base;
}
const sep = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path3;
        if (i >= 0) {
            path3 = pathSegments[i];
        } else if (!resolvedDevice) {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path3 = Deno.cwd();
        } else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path3 = Deno.env.get(`=${resolvedDevice}`) || Deno.cwd();
            if (path3 === undefined || path3.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path3 = `${resolvedDevice}\\`;
            }
        }
        assertPath(path3);
        const len = path3.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute3 = false;
        const code = path3.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute3 = true;
                if (isPathSeparator(path3.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path3.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path3.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path3.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path3.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path3.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path3.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path3.charCodeAt(1) === 58) {
                    device = path3.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path3.charCodeAt(2))) {
                            isAbsolute3 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute3 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path3.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute3;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path4) {
    assertPath(path4);
    const len = path4.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute4 = false;
    const code = path4.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            isAbsolute4 = true;
            if (isPathSeparator(path4.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path4.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path4.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path4.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path4.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path4.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path4.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path4.charCodeAt(1) === 58) {
                device = path4.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path4.charCodeAt(2))) {
                        isAbsolute4 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path4.slice(rootEnd), !isAbsolute4, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute4) tail = ".";
    if (tail.length > 0 && isPathSeparator(path4.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute4) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute4) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path5) {
    assertPath(path5);
    const len = path5.length;
    if (len === 0) return false;
    const code = path5.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    } else if (isWindowsDeviceRoot(code)) {
        if (len > 2 && path5.charCodeAt(1) === 58) {
            if (isPathSeparator(path5.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path6 = paths[i];
        assertPath(path6);
        if (path6.length > 0) {
            if (joined === undefined) joined = firstPart = path6;
            else joined += `\\${path6}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path7) {
    if (typeof path7 !== "string") return path7;
    if (path7.length === 0) return "";
    const resolvedPath = resolve(path7);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== 63 && code !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path7;
}
function dirname(path8) {
    assertPath(path8);
    const len = path8.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path8.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path8.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path8.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path8.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path8.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path8;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path8.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path8.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return path8;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path8.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path8.slice(0, end);
}
function basename(path9, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path9);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path9.length >= 2) {
        const drive = path9.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path9.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path9.length) {
        if (ext.length === path9.length && ext === path9) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path9.length - 1; i >= start; --i){
            const code = path9.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path9.length;
        return path9.slice(start, end);
    } else {
        for(i = path9.length - 1; i >= start; --i){
            if (isPathSeparator(path9.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path9.slice(start, end);
    }
}
function extname(path10) {
    assertPath(path10);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path10.length >= 2 && path10.charCodeAt(1) === 58 && isWindowsDeviceRoot(path10.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path10.length - 1; i >= start; --i){
        const code = path10.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path10.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse(path11) {
    assertPath(path11);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path11.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code = path11.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = 1;
            if (isPathSeparator(path11.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path11.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path11.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path11.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path11.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path11.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path11;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path11;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        ret.root = ret.dir = path11;
        return ret;
    }
    if (rootEnd > 0) ret.root = path11.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path11.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code = path11.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path11.slice(startPart, end);
        }
    } else {
        ret.name = path11.slice(startPart, startDot);
        ret.base = path11.slice(startPart, end);
        ret.ext = path11.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path11.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path12 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path12 = `\\\\${url.hostname}${path12}`;
    }
    return path12;
}
function toFileUrl(path13) {
    if (!isAbsolute(path13)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path13.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\][^/\\]))?(.*)/);
    const url = new URL("file:///");
    url.pathname = pathname.replace(/%/g, "%25");
    if (hostname != null) {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod = {
    sep: sep,
    delimiter: delimiter,
    resolve: resolve,
    normalize: normalize,
    isAbsolute: isAbsolute,
    join: join,
    relative: relative,
    toNamespacedPath: toNamespacedPath,
    dirname: dirname,
    basename: basename,
    extname: extname,
    format: format,
    parse: parse,
    fromFileUrl: fromFileUrl,
    toFileUrl: toFileUrl
};
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path14;
        if (i >= 0) path14 = pathSegments[i];
        else {
            if (globalThis.Deno == null) {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path14 = Deno.cwd();
        }
        assertPath(path14);
        if (path14.length === 0) {
            continue;
        }
        resolvedPath = `${path14}/${resolvedPath}`;
        resolvedAbsolute = path14.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path15) {
    assertPath(path15);
    if (path15.length === 0) return ".";
    const isAbsolute5 = path15.charCodeAt(0) === 47;
    const trailingSeparator = path15.charCodeAt(path15.length - 1) === 47;
    path15 = normalizeString(path15, !isAbsolute5, "/", isPosixPathSeparator);
    if (path15.length === 0 && !isAbsolute5) path15 = ".";
    if (path15.length > 0 && trailingSeparator) path15 += "/";
    if (isAbsolute5) return `/${path15}`;
    return path15;
}
function isAbsolute1(path16) {
    assertPath(path16);
    return path16.length > 0 && path16.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path17 = paths[i];
        assertPath(path17);
        if (path17.length > 0) {
            if (!joined) joined = path17;
            else joined += `/${path17}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path18) {
    return path18;
}
function dirname1(path19) {
    assertPath(path19);
    if (path19.length === 0) return ".";
    const hasRoot = path19.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path19.length - 1; i >= 1; --i){
        if (path19.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path19.slice(0, end);
}
function basename1(path20, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path20);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path20.length) {
        if (ext.length === path20.length && ext === path20) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path20.length - 1; i >= 0; --i){
            const code = path20.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path20.length;
        return path20.slice(start, end);
    } else {
        for(i = path20.length - 1; i >= 0; --i){
            if (path20.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path20.slice(start, end);
    }
}
function extname1(path21) {
    assertPath(path21);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path21.length - 1; i >= 0; --i){
        const code = path21.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path21.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse1(path22) {
    assertPath(path22);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path22.length === 0) return ret;
    const isAbsolute6 = path22.charCodeAt(0) === 47;
    let start;
    if (isAbsolute6) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path22.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code = path22.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute6) {
                ret.base = ret.name = path22.slice(1, end);
            } else {
                ret.base = ret.name = path22.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute6) {
            ret.name = path22.slice(1, startDot);
            ret.base = path22.slice(1, end);
        } else {
            ret.name = path22.slice(startPart, startDot);
            ret.base = path22.slice(startPart, end);
        }
        ret.ext = path22.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path22.slice(0, startPart - 1);
    else if (isAbsolute6) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path23) {
    if (!isAbsolute1(path23)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = path23.replace(/%/g, "%25").replace(/\\/g, "%5C");
    return url;
}
const mod1 = {
    sep: sep1,
    delimiter: delimiter1,
    resolve: resolve1,
    normalize: normalize1,
    isAbsolute: isAbsolute1,
    join: join1,
    relative: relative1,
    toNamespacedPath: toNamespacedPath1,
    dirname: dirname1,
    basename: basename1,
    extname: extname1,
    format: format1,
    parse: parse1,
    fromFileUrl: fromFileUrl1,
    toFileUrl: toFileUrl1
};
const path = isWindows ? mod : mod1;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join2 , normalize: normalize2 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path;
const DEFAULT_BUF_SIZE = 4096;
const MIN_BUF_SIZE = 16;
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class BufferFullError extends Error {
    constructor(partial){
        super("Buffer full");
        this.partial = partial;
        this.name = "BufferFullError";
    }
}
class PartialReadError extends Deno.errors.UnexpectedEof {
    name = "PartialReadError";
    constructor(){
        super("Encountered UnexpectedEof, data only partially read");
    }
}
class BufReader {
    r = 0;
    w = 0;
    eof = false;
    static create(r, size = 4096) {
        return r instanceof BufReader ? r : new BufReader(r, size);
    }
    constructor(rd, size = 4096){
        if (size < 16) {
            size = MIN_BUF_SIZE;
        }
        this._reset(new Uint8Array(size), rd);
    }
    size() {
        return this.buf.byteLength;
    }
    buffered() {
        return this.w - this.r;
    }
    async _fill() {
        if (this.r > 0) {
            this.buf.copyWithin(0, this.r, this.w);
            this.w -= this.r;
            this.r = 0;
        }
        if (this.w >= this.buf.byteLength) {
            throw Error("bufio: tried to fill full buffer");
        }
        for(let i = 100; i > 0; i--){
            const rr = await this.rd.read(this.buf.subarray(this.w));
            if (rr === null) {
                this.eof = true;
                return;
            }
            assert(rr >= 0, "negative read");
            this.w += rr;
            if (rr > 0) {
                return;
            }
        }
        throw new Error(`No progress after ${100} read() calls`);
    }
    reset(r) {
        this._reset(this.buf, r);
    }
    _reset(buf, rd) {
        this.buf = buf;
        this.rd = rd;
        this.eof = false;
    }
    async read(p) {
        let rr = p.byteLength;
        if (p.byteLength === 0) return rr;
        if (this.r === this.w) {
            if (p.byteLength >= this.buf.byteLength) {
                const rr = await this.rd.read(p);
                const nread = rr ?? 0;
                assert(nread >= 0, "negative read");
                return rr;
            }
            this.r = 0;
            this.w = 0;
            rr = await this.rd.read(this.buf);
            if (rr === 0 || rr === null) return rr;
            assert(rr >= 0, "negative read");
            this.w += rr;
        }
        const copied = copy(this.buf.subarray(this.r, this.w), p, 0);
        this.r += copied;
        return copied;
    }
    async readFull(p) {
        let bytesRead = 0;
        while(bytesRead < p.length){
            try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                    if (bytesRead === 0) {
                        return null;
                    } else {
                        throw new PartialReadError();
                    }
                }
                bytesRead += rr;
            } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
            }
        }
        return p;
    }
    async readByte() {
        while(this.r === this.w){
            if (this.eof) return null;
            await this._fill();
        }
        const c = this.buf[this.r];
        this.r++;
        return c;
    }
    async readString(delim) {
        if (delim.length !== 1) {
            throw new Error("Delimiter should be a single character");
        }
        const buffer = await this.readSlice(delim.charCodeAt(0));
        if (buffer === null) return null;
        return new TextDecoder().decode(buffer);
    }
    async readLine() {
        let line;
        try {
            line = await this.readSlice(LF);
        } catch (err) {
            let { partial  } = err;
            assert(partial instanceof Uint8Array, "bufio: caught error from `readSlice()` without `partial` property");
            if (!(err instanceof BufferFullError)) {
                throw err;
            }
            if (!this.eof && partial.byteLength > 0 && partial[partial.byteLength - 1] === CR) {
                assert(this.r > 0, "bufio: tried to rewind past start of buffer");
                this.r--;
                partial = partial.subarray(0, partial.byteLength - 1);
            }
            return {
                line: partial,
                more: !this.eof
            };
        }
        if (line === null) {
            return null;
        }
        if (line.byteLength === 0) {
            return {
                line,
                more: false
            };
        }
        if (line[line.byteLength - 1] == LF) {
            let drop = 1;
            if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
            }
            line = line.subarray(0, line.byteLength - drop);
        }
        return {
            line,
            more: false
        };
    }
    async readSlice(delim) {
        let s = 0;
        let slice;
        while(true){
            let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
            if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
            }
            if (this.eof) {
                if (this.r === this.w) {
                    return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
            }
            if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
            }
            s = this.w - this.r;
            try {
                await this._fill();
            } catch (err) {
                err.partial = slice;
                throw err;
            }
        }
        return slice;
    }
    async peek(n) {
        if (n < 0) {
            throw Error("negative count");
        }
        let avail = this.w - this.r;
        while(avail < n && avail < this.buf.byteLength && !this.eof){
            try {
                await this._fill();
            } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
            }
            avail = this.w - this.r;
        }
        if (avail === 0 && this.eof) {
            return null;
        } else if (avail < n && this.eof) {
            return this.buf.subarray(this.r, this.r + avail);
        } else if (avail < n) {
            throw new BufferFullError(this.buf.subarray(this.r, this.w));
        }
        return this.buf.subarray(this.r, this.r + n);
    }
}
class AbstractBufBase {
    usedBufferBytes = 0;
    err = null;
    size() {
        return this.buf.byteLength;
    }
    available() {
        return this.buf.byteLength - this.usedBufferBytes;
    }
    buffered() {
        return this.usedBufferBytes;
    }
}
class BufWriter extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriter ? writer : new BufWriter(writer, size);
    }
    constructor(writer, size = 4096){
        super();
        this.writer = writer;
        if (size <= 0) {
            size = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    async flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            await Deno.writeAll(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    async write(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = await this.writer.write(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
class BufWriterSync extends AbstractBufBase {
    static create(writer, size = 4096) {
        return writer instanceof BufWriterSync ? writer : new BufWriterSync(writer, size);
    }
    constructor(writer, size = 4096){
        super();
        this.writer = writer;
        if (size <= 0) {
            size = DEFAULT_BUF_SIZE;
        }
        this.buf = new Uint8Array(size);
    }
    reset(w) {
        this.err = null;
        this.usedBufferBytes = 0;
        this.writer = w;
    }
    flush() {
        if (this.err !== null) throw this.err;
        if (this.usedBufferBytes === 0) return;
        try {
            Deno.writeAllSync(this.writer, this.buf.subarray(0, this.usedBufferBytes));
        } catch (e) {
            this.err = e;
            throw e;
        }
        this.buf = new Uint8Array(this.buf.length);
        this.usedBufferBytes = 0;
    }
    writeSync(data) {
        if (this.err !== null) throw this.err;
        if (data.length === 0) return 0;
        let totalBytesWritten = 0;
        let numBytesWritten = 0;
        while(data.byteLength > this.available()){
            if (this.buffered() === 0) {
                try {
                    numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                    this.err = e;
                    throw e;
                }
            } else {
                numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
                this.usedBufferBytes += numBytesWritten;
                this.flush();
            }
            totalBytesWritten += numBytesWritten;
            data = data.subarray(numBytesWritten);
        }
        numBytesWritten = copy(data, this.buf, this.usedBufferBytes);
        this.usedBufferBytes += numBytesWritten;
        totalBytesWritten += numBytesWritten;
        return totalBytesWritten;
    }
}
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
function str(buf) {
    if (buf == null) {
        return "";
    } else {
        return new TextDecoder().decode(buf);
    }
}
function charCode(s) {
    return s.charCodeAt(0);
}
class TextProtoReader {
    constructor(r){
        this.r = r;
    }
    async readLine() {
        const s = await this.readLineSlice();
        if (s === null) return null;
        return str(s);
    }
    async readMIMEHeader() {
        const m = new Headers();
        let line;
        let buf = await this.r.peek(1);
        if (buf === null) {
            return null;
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            line = await this.readLineSlice();
        }
        buf = await this.r.peek(1);
        if (buf === null) {
            throw new Deno.errors.UnexpectedEof();
        } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
            throw new Deno.errors.InvalidData(`malformed MIME header initial line: ${str(line)}`);
        }
        while(true){
            const kv = await this.readLineSlice();
            if (kv === null) throw new Deno.errors.UnexpectedEof();
            if (kv.byteLength === 0) return m;
            let i = kv.indexOf(charCode(":"));
            if (i < 0) {
                throw new Deno.errors.InvalidData(`malformed MIME header line: ${str(kv)}`);
            }
            const key = str(kv.subarray(0, i));
            if (key == "") {
                continue;
            }
            i++;
            while(i < kv.byteLength && (kv[i] == charCode(" ") || kv[i] == charCode("\t"))){
                i++;
            }
            const value = str(kv.subarray(i)).replace(invalidHeaderCharRegex, encodeURI);
            try {
                m.append(key, value);
            } catch  {}
        }
    }
    async readLineSlice() {
        let line;
        while(true){
            const r = await this.r.readLine();
            if (r === null) return null;
            const { line: l , more  } = r;
            if (!line && !more) {
                if (this.skipSpace(l) === 0) {
                    return new Uint8Array(0);
                }
                return l;
            }
            line = line ? concat(line, l) : l;
            if (!more) {
                break;
            }
        }
        return line;
    }
    skipSpace(l) {
        let n = 0;
        for(let i = 0; i < l.length; i++){
            if (l[i] === charCode(" ") || l[i] === charCode("\t")) {
                continue;
            }
            n++;
        }
        return n;
    }
}
const encoder = new TextEncoder();
function matchAfterPrefix(buf, prefix, eof) {
    if (buf.length === prefix.length) {
        return eof ? 1 : 0;
    }
    const c = buf[prefix.length];
    if (c === " ".charCodeAt(0) || c === "\t".charCodeAt(0) || c === "\r".charCodeAt(0) || c === "\n".charCodeAt(0) || c === "-".charCodeAt(0)) {
        return 1;
    }
    return -1;
}
function scanUntilBoundary(buf, dashBoundary, newLineDashBoundary, total, eof) {
    if (total === 0) {
        if (startsWith(buf, dashBoundary)) {
            switch(matchAfterPrefix(buf, dashBoundary, eof)){
                case -1:
                    return dashBoundary.length;
                case 0:
                    return 0;
                case 1:
                    return null;
            }
        }
        if (startsWith(dashBoundary, buf)) {
            return 0;
        }
    }
    const i = indexOf(buf, newLineDashBoundary);
    if (i >= 0) {
        switch(matchAfterPrefix(buf.slice(i), newLineDashBoundary, eof)){
            case -1:
                return i + newLineDashBoundary.length;
            case 0:
                return i;
            case 1:
                return i > 0 ? i : null;
        }
    }
    if (startsWith(newLineDashBoundary, buf)) {
        return 0;
    }
    const j = lastIndexOf(buf, newLineDashBoundary.slice(0, 1));
    if (j >= 0 && startsWith(newLineDashBoundary, buf.slice(j))) {
        return j;
    }
    return buf.length;
}
class PartReader {
    constructor(mr, headers){
        this.mr = mr;
        this.headers = headers;
        this.n = 0;
        this.total = 0;
    }
    async read(p) {
        const br = this.mr.bufReader;
        let peekLength = 1;
        while(this.n === 0){
            peekLength = Math.max(peekLength, br.buffered());
            const peekBuf = await br.peek(peekLength);
            if (peekBuf === null) {
                throw new Deno.errors.UnexpectedEof();
            }
            const eof = peekBuf.length < peekLength;
            this.n = scanUntilBoundary(peekBuf, this.mr.dashBoundary, this.mr.newLineDashBoundary, this.total, eof);
            if (this.n === 0) {
                assert(eof === false);
                peekLength++;
            }
        }
        if (this.n === null) {
            return null;
        }
        const nread = Math.min(p.length, this.n);
        const buf = p.subarray(0, nread);
        const r = await br.readFull(buf);
        assert(r === buf);
        this.n -= nread;
        this.total += nread;
        return nread;
    }
    close() {}
    getContentDispositionParams() {
        if (this.contentDispositionParams) return this.contentDispositionParams;
        const cd = this.headers.get("content-disposition");
        const params = {};
        assert(cd != null, "content-disposition must be set");
        const comps = decodeURI(cd).split(";");
        this.contentDisposition = comps[0];
        comps.slice(1).map((v)=>v.trim()).map((kv)=>{
            const [k, v] = kv.split("=");
            if (v) {
                const s = v.charAt(0);
                const e = v.charAt(v.length - 1);
                if (s === e && s === '"' || s === "'") {
                    params[k] = v.substr(1, v.length - 2);
                } else {
                    params[k] = v;
                }
            }
        });
        return this.contentDispositionParams = params;
    }
    get fileName() {
        return this.getContentDispositionParams()["filename"];
    }
    get formName() {
        const p = this.getContentDispositionParams();
        if (this.contentDisposition === "form-data") {
            return p["name"];
        }
        return "";
    }
}
function skipLWSPChar(u) {
    const ret = new Uint8Array(u.length);
    const sp = " ".charCodeAt(0);
    const ht = "\t".charCodeAt(0);
    let j = 0;
    for(let i = 0; i < u.length; i++){
        if (u[i] === sp || u[i] === ht) continue;
        ret[j++] = u[i];
    }
    return ret.slice(0, j);
}
class MultipartReader {
    constructor(reader, boundary1){
        this.boundary = boundary1;
        this.newLine = encoder.encode("\r\n");
        this.newLineDashBoundary = encoder.encode(`\r\n--${this.boundary}`);
        this.dashBoundaryDash = encoder.encode(`--${this.boundary}--`);
        this.dashBoundary = encoder.encode(`--${this.boundary}`);
        this.partsRead = 0;
        this.bufReader = new BufReader(reader);
    }
    async readForm(maxMemory = 10 << 20) {
        const fileMap = new Map();
        const valueMap = new Map();
        let maxValueBytes = maxMemory + (10 << 20);
        const buf = new Deno.Buffer(new Uint8Array(maxValueBytes));
        for(;;){
            const p = await this.nextPart();
            if (p === null) {
                break;
            }
            if (p.formName === "") {
                continue;
            }
            buf.reset();
            if (!p.fileName) {
                const n = await copyN(p, buf, maxValueBytes);
                maxValueBytes -= n;
                if (maxValueBytes < 0) {
                    throw new RangeError("message too large");
                }
                const value = new TextDecoder().decode(buf.bytes());
                valueMap.set(p.formName, value);
                continue;
            }
            let formFile;
            const n = await copyN(p, buf, maxValueBytes);
            const contentType = p.headers.get("content-type");
            assert(contentType != null, "content-type must be set");
            if (n > maxMemory) {
                const ext = extname2(p.fileName);
                const filepath = await Deno.makeTempFile({
                    dir: ".",
                    prefix: "multipart-",
                    suffix: ext
                });
                const file = await Deno.open(filepath, {
                    write: true
                });
                try {
                    const size = await Deno.copy(new MultiReader(buf, p), file);
                    file.close();
                    formFile = {
                        filename: p.fileName,
                        type: contentType,
                        tempfile: filepath,
                        size
                    };
                } catch (e) {
                    await Deno.remove(filepath);
                    throw e;
                }
            } else {
                formFile = {
                    filename: p.fileName,
                    type: contentType,
                    content: buf.bytes(),
                    size: buf.length
                };
                maxMemory -= n;
                maxValueBytes -= n;
            }
            if (formFile) {
                const mapVal = fileMap.get(p.formName);
                if (mapVal !== undefined) {
                    if (Array.isArray(mapVal)) {
                        mapVal.push(formFile);
                    } else {
                        fileMap.set(p.formName, [
                            mapVal,
                            formFile
                        ]);
                    }
                } else {
                    fileMap.set(p.formName, formFile);
                }
            }
        }
        return multipartFormData(fileMap, valueMap);
    }
    async nextPart() {
        if (this.currentPart) {
            this.currentPart.close();
        }
        if (equals(this.dashBoundary, encoder.encode("--"))) {
            throw new Error("boundary is empty");
        }
        let expectNewPart = false;
        for(;;){
            const line = await this.bufReader.readSlice("\n".charCodeAt(0));
            if (line === null) {
                throw new Deno.errors.UnexpectedEof();
            }
            if (this.isBoundaryDelimiterLine(line)) {
                this.partsRead++;
                const r = new TextProtoReader(this.bufReader);
                const headers = await r.readMIMEHeader();
                if (headers === null) {
                    throw new Deno.errors.UnexpectedEof();
                }
                const np = new PartReader(this, headers);
                this.currentPart = np;
                return np;
            }
            if (this.isFinalBoundary(line)) {
                return null;
            }
            if (expectNewPart) {
                throw new Error(`expecting a new Part; got line ${line}`);
            }
            if (this.partsRead === 0) {
                continue;
            }
            if (equals(line, this.newLine)) {
                expectNewPart = true;
                continue;
            }
            throw new Error(`unexpected line in nextPart(): ${line}`);
        }
    }
    isFinalBoundary(line) {
        if (!startsWith(line, this.dashBoundaryDash)) {
            return false;
        }
        const rest = line.slice(this.dashBoundaryDash.length, line.length);
        return rest.length === 0 || equals(skipLWSPChar(rest), this.newLine);
    }
    isBoundaryDelimiterLine(line) {
        if (!startsWith(line, this.dashBoundary)) {
            return false;
        }
        const rest = line.slice(this.dashBoundary.length);
        return equals(skipLWSPChar(rest), this.newLine);
    }
}
function multipartFormData(fileMap, valueMap) {
    function file(key) {
        return fileMap.get(key);
    }
    function value(key) {
        return valueMap.get(key);
    }
    function* entries() {
        yield* fileMap;
        yield* valueMap;
    }
    async function removeAll() {
        const promises = [];
        for (const val of fileMap.values()){
            if (Array.isArray(val)) {
                for (const subVal of val){
                    if (!subVal.tempfile) continue;
                    promises.push(Deno.remove(subVal.tempfile));
                }
            } else {
                if (!val.tempfile) continue;
                promises.push(Deno.remove(val.tempfile));
            }
        }
        await Promise.all(promises);
    }
    return {
        file,
        value,
        entries,
        removeAll,
        [Symbol.iterator] () {
            return entries();
        }
    };
}
const content = `--------------------------366796e1c748a2fb\r
Content-Disposition: form-data; name="payload"\r
Content-Type: text/plain\r
\r
CONTENT\r
--------------------------366796e1c748a2fb--`;
const boundary = "------------------------366796e1c748a2fb";
const stringReader = new StringReader(content);
console.log(content);
const multipartReader = new MultipartReader(stringReader, boundary);
const formData = await multipartReader.readForm();
for (const entry of formData.entries()){
    console.log("entry", entry);
}
console.log("formdata", formData);
