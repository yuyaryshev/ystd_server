import { join, resolve } from "path";
import { readdirSync, readFileSync, writeFileSync } from "fs";

export const babelPresetsToPlugins = (
    traceFileAbsPath: string = "d:/runTrace.json",
    nodeModulesBabelPath: string = `../../../node_modules/@babel`,
) => {
    const codeSnippet = `
// runTraceCodeSnippet
(() => {
    let {readFileSync, writeFileSync} = require('fs');
    let path = require('path');
    let rtp = \`${traceFileAbsPath}\`;
    let c;
    try { c = JSON.parse( readFileSync(rtp, 'utf-8') ); } catch (e) {}
    if(!c || !Array.isArray(c))
        c = [];

    if(!c.includes(__filename)) {
        c.push(__filename);
        writeFileSync(rtp, JSON.stringify(c,undefined, '    '), 'utf-8');
    }
})();
// runTraceCodeSnippet END

`;

    const startingPath = resolve(nodeModulesBabelPath);
    console.log(`startingPath = `, startingPath);
    const files = readdirSync(startingPath, { withFileTypes: true });
    files.map((fn) => {
        const node_module_path = join(startingPath, fn.name);
        if (node_module_path.includes(`\\plugin-`)) {
            const node_module_package_path = join(node_module_path, "package.json");
            let packageJson;
            let patch_status = "[failed         ] - ";
            try {
                packageJson = JSON.parse(readFileSync(node_module_package_path, "utf-8"));
                if (packageJson && packageJson.main) {
                    const mainJsPath = join(node_module_path, packageJson.main);
                    const mainJsContent = readFileSync(mainJsPath, "utf-8");
                    if (!mainJsContent.includes("runTraceCodeSnippet")) {
                        writeFileSync(mainJsPath, codeSnippet + mainJsContent, "utf-8");
                        patch_status = "[patched        ] - ";
                    } else {
                        patch_status = "[already patched] - ";
                    }
                }
            } catch (e) {}
            console.log(patch_status + node_module_path);
        }
    });
};

babelPresetsToPlugins();
