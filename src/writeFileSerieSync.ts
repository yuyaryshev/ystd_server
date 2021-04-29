import { outputFileSync, readdirSync, unlinkSync } from "./fs-extra.js";
import { join } from "path";

export const writeFileSerieSync = (
    seriePath: string,
    fileName: string,
    content: string,
    maxFiles: number | undefined
) => {
    if (maxFiles !== undefined && maxFiles > 0) {
        const files = readdirSync(seriePath).map((f: any): string => (typeof f === "string" ? f : f.name));
        const delCount = maxFiles - 1 - files.length;
        for (let i = 0; i < delCount; i++) unlinkSync(join(seriePath, files[i]));
    }
    outputFileSync(join(seriePath, fileName), content, "utf-8");
};
