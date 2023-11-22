import { readdirSync, Dirent } from "fs";
import { join as joinPath } from "path";

export type ReadDirCallback = (path: string, filename: Dirent) => true | false | undefined | void;

export function pathToPosix(s: string): string {
    return s.split("\\").join("/");
}
export function pathToPosixWithCond(s: string, cond: boolean): string {
    return cond ? s.split("\\").join("/") : s;
}

export function joinPathMaybePosix(a: string, b: string, posixCond: boolean) {
    return pathToPosixWithCond(joinPath(a, b), posixCond);
}

export const readDirRecursive = (path: string, v_callback: ReadDirCallback) => {
    const files = readdirSync(path, { withFileTypes: true });
    for (const dirent of files) {
        const r = v_callback(path, dirent);
        if (r !== false && dirent.isDirectory()) readDirRecursive(joinPath(path, dirent.name), v_callback);
    }
};

export type ReadDirCallback2 = (path: string, dirent: Dirent, parentResult?: any | undefined) => any | undefined | void;

export const readDirRecursive2 = (path: string, v_callback: ReadDirCallback2, parentResult?: any | undefined) => {
    const files = readdirSync(path, { withFileTypes: true });
    for (const dirent of files) {
        const r = v_callback(path, dirent, parentResult);
        if (r !== false && dirent.isDirectory()) readDirRecursive2(joinPath(path, dirent.name), v_callback, r);
    }
};

export interface DirentWithPath extends Dirent {
    path: string;
}

export interface ReadDirRecursiveToArrayOpts {
    removeDirectories?: boolean;
    removeNonDirectories?: boolean;
    allowedExts?: string[];
    ignoredNames?: string[];
    posix?: boolean;
}

function readDirRecursiveToArrayInternal(path: string, arr: DirentWithPath[], ignoredNamesSet: Set<string>, posixCond: boolean) {
    const files = readdirSync(path, { withFileTypes: true });
    for (const dirent of files) {
        (dirent as any).path = joinPathMaybePosix(path, dirent.name, posixCond);
        arr.push(dirent as any);
        if (dirent.isDirectory() && !ignoredNamesSet.has(dirent.name)) {
            readDirRecursiveToArrayInternal(joinPathMaybePosix(path, dirent.name, posixCond), arr, ignoredNamesSet, posixCond);
        }
    }
}

export function readDirRecursiveToArray(path: string, opts?: ReadDirRecursiveToArrayOpts): DirentWithPath[] {
    const arr: DirentWithPath[] = [];

    const { removeDirectories, removeNonDirectories, allowedExts, ignoredNames, posix } = opts || {};
    const ignoredNamesSet = new Set(ignoredNames);

    readDirRecursiveToArrayInternal(path, arr, ignoredNamesSet, !!posix);

    if (!removeDirectories && !removeNonDirectories && !allowedExts) {
        return arr;
    }

    const extSet = new Set(allowedExts);

    const arr2: DirentWithPath[] = [];
    for (const dirent of arr) {
        const p = dirent.path.lastIndexOf(".");
        const ext = p < 1 ? "" : dirent.path.substr(p + 1);

        if ((!removeDirectories || !dirent.isDirectory()) && (!removeNonDirectories || dirent.isDirectory()) && (!extSet.size || extSet.has(ext))) {
            arr2.push(dirent);
        }
    }

    return arr2;
}

export function readDirRecursiveToStrArray(path: string | string[], opts?: ReadDirRecursiveToArrayOpts): string[] {
    if (Array.isArray(path)) {
        const r: string[] = [];
        for (const path2 of path) {
            r.push(...readDirRecursiveToArray(path2, opts).map((dirent) => dirent.path));
        }
        return r;
    }
    return readDirRecursiveToArray(path, opts).map((dirent) => dirent.path);
}
