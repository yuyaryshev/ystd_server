export interface TscMessageLocation {
    filepath: string;
    filename: string;
    ext: string;
    fullname: string;
    fileAndLoc: string;
}

export interface TscMessageError {
    code: string;
    message: string;
}

export interface TscMessageCodeSample {
    sample: string;
    underline: string;
}

export interface TscMessage {
    location: TscMessageLocation;
    error: TscMessageError;
    codeSample: TscMessageCodeSample;
    logChunk: string[];
    parseError?: boolean;
}

export interface MissingDependencies {
    [key: string]: string[];
}

export interface TscLog {
    messages: TscMessage[];
    byErrorCode: TscMessagesByErrorCode;
    missingDependencies: MissingDependencies;
}

export function parseTscOutput(log: string): TscLog {
    const lines = log.trim().split("\r\n");
    const messages: TscMessage[] = [];
    let totalTscMessages = 0;
    let tscFinalMessage = "";
    if (lines.length > 4) {
        tscFinalMessage = lines[lines.length - 1];
        totalTscMessages = Number(tscFinalMessage.split("errors")[0].split("Found ")[1].trim());
    }

    let parseErrorCnt = 0;
    while (lines.length >= 4) {
        const logChunk = lines.splice(0, 5);
        let parseError: string | undefined;
        const [fileAndLocation, fullMessage] = (logChunk[0] || (parseError = "")).split(` - error `);
        const [fullpath, line, pos] = (fileAndLocation || (parseError = "")).split(":");
        const [filepath, fullname] = (fullpath || (parseError = "")).split("/");
        const [filename, ext] = (fullname || (parseError = "")).split(".");
        const location = { filepath, filename, ext, fullname, fileAndLoc: fileAndLocation };

        const [code, message] = (fullMessage || "").split(": ");
        const error = { code, message, fullMessage };

        const sample = logChunk[2] || (parseError = "");
        const underline = logChunk[3] || (parseError = "");
        const codeSample = { sample, underline };

        const tscMessage: TscMessage = { location, error, codeSample, logChunk };
        if (parseError) tscMessage.parseError = true;

        if (parseError) parseErrorCnt++;
        messages.push(tscMessage);
    }
    if (parseErrorCnt > 0) console.warn(`WARNING! Has parseErrorCnt = ${parseErrorCnt}!`);
    if (totalTscMessages !== messages.length) console.warn(`WARNING! Tsc reported ${tscFinalMessage} but I've parsed ${messages.length} messages!`);

    const byErrorCode = groupByErrorCode(messages);
    const missingDependencies: MissingDependencies = {};

    for (const dep of messages.filter((m) => ["TS2307"].includes(m.error.code)).map(parseMissingModulesMessage)) {
        if (!missingDependencies[dep.missingModule]) missingDependencies[dep.missingModule] = [] as string[];
        missingDependencies[dep.missingModule].push(...dep.missingMembers);
    }
    for (const k in missingDependencies) missingDependencies[k] = [...new Set(missingDependencies[k])];
    return { messages, byErrorCode, missingDependencies };
}

export interface TscMessagesByErrorCode {
    [key: string]: { messages: TscMessage[] };
}

export function groupByErrorCode(tscMessages: TscMessage[]): TscMessagesByErrorCode {
    const groupped: any = {};
    for (const m of tscMessages) {
        if (!groupped[m.error.code]) groupped[m.error.code] = { messages: [] };
        if (!groupped[m.error.code].messages.includes(m.error.message)) groupped[m.error.code].messages.push(m);
    }
    return groupped;
}

export interface MissingModule {
    missingModule: string;
    missingMembers: string[];
}

export function parseMissingModulesMessage(m: TscMessage): MissingModule {
    const missingModule = m.error.message.split("'")[1];
    const missingMembers = m.codeSample.sample
        .split(/[{}]/)[1]
        .split(",")
        .map((s) => s.trim());
    return { missingModule, missingMembers };
}
