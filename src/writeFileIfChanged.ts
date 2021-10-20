import { readFile, outputFile } from "fs-extra";

export const writeFileIfChanged = async (fileName: string, content: string) => {
    let current: string | undefined;
    try {
        current = await readFile(fileName, "utf-8");
    } catch (e) {}

    if (current !== content) {
        await outputFile(fileName, content, "utf-8");
        return true;
    }
    return false;
};
