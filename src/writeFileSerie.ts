import { outputFile, readdir, unlink } from "fs-extra";
import { join } from "path";

export const writeFileSerie = async (seriePath: string, fileName: string, content: string, maxFiles: number | undefined) => {
    if (maxFiles !== undefined && maxFiles > 0) {
        const files = (await readdir(seriePath)).map((f: any): string => (typeof f === "string" ? f : f.name));
        const delCount = maxFiles - 1 - files.length;
        for (let i = 0; i < delCount; i++) {
            await unlink(join(seriePath, files[i]));
        }
    }
    await outputFile(join(seriePath, fileName), content, "utf-8");
};
