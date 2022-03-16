export function toLinuxLikePath(pathStr: string): string {
    return pathStr.split("\\").join("/");
}
