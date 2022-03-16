import { readdirSync, Dirent } from "fs";
import { join as joinPath } from "path";

export type ReadDirCallback = (path: string, filename: Dirent) => true | false | undefined | void;

export const readDirRecursive = (path: string, v_callback: ReadDirCallback) => {
    const files = readdirSync(path, { withFileTypes: true });
    for (const filename of files) {
        const r = v_callback(path, filename);
        if (r !== false && filename.isDirectory()) readDirRecursive(joinPath(path, filename.name), v_callback);
    }
};

export type ReadDirCallback2 = (path: string, filename: Dirent, parentResult?: any | undefined) => any | undefined | void;

export const readDirRecursive2 = (path: string, v_callback: ReadDirCallback2, parentResult?: any | undefined) => {
    const files = readdirSync(path, { withFileTypes: true });
    for (const filename of files) {
        const r = v_callback(path, filename, parentResult);
        if (r !== false && filename.isDirectory()) readDirRecursive2(joinPath(path, filename.name), v_callback, r);
    }
};

export interface DirentWithPath extends Dirent {
    path: string;
}

export interface ReadDirRecursiveToArrayOpts {
    removeDirectories?: boolean;
    removeNonDirectories?: boolean;
    allowedExts?: string[];
}

function readDirRecursiveToArrayInternal(path: string, arr: DirentWithPath[]) {
    const files = readdirSync(path, { withFileTypes: true });
    for (const dirent of files) {
        (dirent as any).path = joinPath(path, dirent.name);
        arr.push(dirent as any);
        if (dirent.isDirectory()) readDirRecursiveToArrayInternal(joinPath(path, dirent.name), arr);
    }
}

export function readDirRecursiveToArray(path: string, opts?: ReadDirRecursiveToArrayOpts): DirentWithPath[] {
    const arr: DirentWithPath[] = [];
    readDirRecursiveToArrayInternal(path, arr);

    const { removeDirectories, removeNonDirectories, allowedExts } = opts || {};
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

export function readDirRecursiveToStrArray(path: string, opts?: ReadDirRecursiveToArrayOpts): string[] {
    return readDirRecursiveToArray(path, opts).map((dirent) => dirent.path);
}
