import { readDirRecursive, readDirRecursiveToArray, ReadDirRecursiveToArrayOpts } from "./readDirRecursive.js";
import { removeExpectedPrefix } from "ystd";
import { expect } from "chai";
import { readFileSync } from "fs-extra";
import { join } from "path";
import { toLinuxLikePath } from "./toLinuxPath.js";

export function expectDeepEqualFolders(etalonFolder0: string, actualFolder0: string, readDirOpts0?: ReadDirRecursiveToArrayOpts) {
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

    expect(actualFiles).to.deep.equal(etalonFiles);

    for (const relFilePath of etalonFiles) {
        const etalonStr = readFileSync(join(etalonFolder, relFilePath), "utf-8");
        const actualStr = readFileSync(join(actualFolder, relFilePath), "utf-8");
        expect(relFilePath+"\n"+actualStr).to.deep.equal(relFilePath+"\n"+etalonStr);
    }
}
