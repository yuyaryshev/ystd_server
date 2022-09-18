import { outputFileSync, readdirSync, unlinkSync } from "fs-extra";
import { join } from "path";

export function dateToSerieSuffix(date0?: Date | string) {
    let dateStr: string = typeof date0 === "string" ? date0 : (!date0 ? new Date() : date0).toISOString();
    return dateStr.substring(0, 23).split(":").join("-").split("T").join("_").split(".").join("_");
}

export const writeFileSerieSync = (seriePath: string, fileName: string, content: string, maxFiles: number | undefined) => {
    if (maxFiles !== undefined && maxFiles > 0) {
        const files = readdirSync(seriePath).map((f: any): string => (typeof f === "string" ? f : f.name));
        const delCount = files.length - (maxFiles - 1);
        for (let i = 0; i < delCount; i++) {
            unlinkSync(join(seriePath, files[i]));
        }
    }
    outputFileSync(join(seriePath, fileName), content, "utf-8");
};
