import { readFileSync, outputFileSync } from "./fs-extra.js";

export const writeFileSyncIfChanged = (fileName: string, content: string) => {
    let current: string | undefined;
    try {
        current = readFileSync(fileName, "utf-8");
    } catch (e) {}

    if (current !== content) {
        outputFileSync(fileName, content, "utf-8");
        return true;
    }
    return false;
};
