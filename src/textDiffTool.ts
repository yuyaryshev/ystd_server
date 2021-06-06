import execa from "execa";

export const text_diff_editor_npm_param_name = "text_diff_editor";

export async function getTextDiffEditorPath(): Promise<string | undefined> {
    const { stdout } = await execa("npm config get", [text_diff_editor_npm_param_name]);
    return stdout !== "undefined" ? stdout : undefined;
}

export async function openFileDiffFromTextDiffEditor(baseFile: string, currentFilePath: string): Promise<boolean> {
    const editorPath = await getTextDiffEditorPath();
    if (editorPath) {
        await execa(editorPath, [baseFile, currentFilePath]);
        return true;
    }
    throw new Error(
        `CODE00000001 Path to ${text_diff_editor_npm_param_name} is not specified. Use 'npm config set ${text_diff_editor_npm_param_name} PATH_TO_EDITOR' to specify it.`,
    );
}
