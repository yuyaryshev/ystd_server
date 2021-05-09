import fs from "fs-extra";
import { parseTscOutput } from "../../parseTscOutput.js";
import { resolve } from "path";

describe("parseTscOutput", () => {
    it("parseTscOutput - 1", () => {
        const logPath = resolve(`./src/test/parseTscOutput/tsc.log`);
        const log = fs.readFileSync(logPath, `utf-8`);
        const r = parseTscOutput(log);

        console.log(r.byErrorCode.TS2307);
    });
});
