import crypto from "crypto";

export const md5hex = (...args: any[]): string => {
    return crypto.createHash("md5").update(args.join("")).digest("hex");
};

export const md5 = md5hex;

export const md5base64 = (...args: any[]): string => {
    const r = crypto.createHash("md5").update(args.join("")).digest("base64");
    return r.substr(0, r.length - 1); // remove trailing '=' char
};

export const shortSelfOrmd5base64 = (s: string, maxLen: number = 50): string => {
    if (s.length < maxLen) return s;
    const r = crypto.createHash("md5").update(s).digest("base64");
    return r.substr(0, r.length - 1); // remove trailing '=' char
};
