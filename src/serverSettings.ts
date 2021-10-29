import { resolve } from "path";
import { readFileSync } from "fs";
import { parse } from "json5";
import debugjs from "debug";

let debug = debugjs("server.startup");

export interface ServerSettingsInput {
    projectDir: string;
}

export function serverSettings(input: ServerSettingsInput) {
    const { projectDir } = input;
    let settingsPath = resolve(projectDir, process.env.SETTINGS_FILE || "settings.json"); // Уметь заменять имя settings файла или clause в нем через ENV параметры и параметры коммандной строки

    debug(`CODE00000343 - reading settings from ${settingsPath}`);
    let settings0: any = parse(readFileSync(settingsPath, "utf-8"));
    if (process.env.SETTINGS_CLAUSE) {
        debug(`CODE00000344 - selecting settigns YYA_ENV=${process.env.YYA_ENV}`);
        let nSettings = settings0[process.env.SETTINGS_CLAUSE];
        if (!nSettings) {
            throw new Error(`CODE00000288 SETTINGS_CLAUSE='${process.env.SETTINGS_CLAUSE}', but there is no such key in settings.json`);
        }
        settings0 = settings0[process.env.SETTINGS_CLAUSE];
    }
    settings0.projectDir = projectDir;
    return settings0;
}
