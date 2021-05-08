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

export function parseTscLog(log: string): TscMessage[] {
    const lines = log.trim().split("\r\n");
    const tscMessages = [];
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
        tscMessages.push(tscMessage);
    }
    if (parseErrorCnt > 0) console.warn(`WARNING! Has parseErrorCnt = ${parseErrorCnt}!`);
    if (totalTscMessages !== tscMessages.length)
        console.warn(`WARNING! Tsc reported ${tscFinalMessage} but I've parsed ${tscMessages.length} messages!`);
    return tscMessages;
}

export function groupByErrorCode(tscMessages: TscMessage[]) {
    const groupped: any = {};
    for (const m of tscMessages) {
        if (!groupped[m.error.code]) groupped[m.error.code] = { messages: [] };
        if (!groupped[m.error.code].messages.includes(m.error.message)) groupped[m.error.code].messages.push(m.error.message);
    }
    return groupped;
}
