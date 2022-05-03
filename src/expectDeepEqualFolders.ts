import { readDirRecursive, readDirRecursiveToArray, ReadDirRecursiveToArrayOpts } from "./readDirRecursive.js";
import { removeExpectedPrefix } from "ystd";
import { expect } from "chai";
import { readFileSync } from "fs-extra";
import { join } from "path";
import { toLinuxLikePath } from "./toLinuxPath.js";

export type DeepEqualFoldersReplacer = (s: string) => string;
const noopReplacer = (s: string) => s;

function readFileSyncForCheck(path: string, encoding?: any): string {
    try {
        return readFileSync(path, encoding || "utf-8") as any;
    } catch (e: any) {
        return "ERROR:" + e.message;
    }
}

export function expectDeepEqualFolders(
    etalonFolder0: string,
    actualFolder0: string,
    readDirOpts0?: ReadDirRecursiveToArrayOpts,
    replacer: DeepEqualFoldersReplacer = noopReplacer,
) {
    const readDirOpts: ReadDirRecursiveToArrayOpts = { ...(readDirOpts0 || {}), removeDirectories: true };
    const etalonFolder = toLinuxLikePath(etalonFolder0);
    const actualFolder = toLinuxLikePath(actualFolder0);

    const etalonFiles = readDirRecursiveToArray(etalonFolder, readDirOpts).map((item) =>
        removeExpectedPrefix(toLinuxLikePath(item.path), etalonFolder),
    );
    etalonFiles.sort();
    const actualFiles = readDirRecursiveToArray(actualFolder, readDirOpts).map((item) =>
        removeExpectedPrefix(toLinuxLikePath(item.path), actualFolder),
    );
    actualFiles.sort();

    // expect("File paths:"+actualFiles.join("\n")).to.deep.equal("File paths:"+etalonFiles.join("\n"));

    for (const relFilePath of etalonFiles) {
        const etalonStr = replacer(readFileSyncForCheck(join(etalonFolder, relFilePath), "utf-8"));
        const actualStr = replacer(readFileSyncForCheck(join(actualFolder, relFilePath), "utf-8"));
        expect(relFilePath + "\n" + actualStr).to.deep.equal(relFilePath + "\n" + etalonStr);
    }
    expect("File paths:" + actualFiles.join("\n")).to.deep.equal("File paths:" + etalonFiles.join("\n"));
}
