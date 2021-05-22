import { readFileSync } from "fs-extra";
import { parseTscOutput } from "../../parseTscOutput.js";
import { resolve } from "path";

describe("parseTscOutput", () => {
    it("parseTscOutput - 1", () => {
        const logPath = resolve(`./src/test/parseTscOutput/tsc.log`);
        const log = readFileSync(logPath, `utf-8`);
        const r = parseTscOutput(log);

        console.table(r.missingDependencies);
    });
});
