export const TextEncoder = class {
    encode(str: string) {
        const utf8 = [];
        for (let i = 0; i < str.length; i++) {
            let charCode = str.charCodeAt(i);
            if (charCode < 0x80) utf8.push(charCode);
            else if (charCode < 0x800) {
                utf8.push(0xc0 | (charCode >> 6), 0x80 | (charCode & 0x3f));
            } else if (charCode < 0xd800 || charCode >= 0xe000) {
                utf8.push(
                    0xe0 | (charCode >> 12),
                    0x80 | ((charCode >> 6) & 0x3f),
                    0x80 | (charCode & 0x3f)
                );
            } else {
                i++;
                charCode =
                    0x10000 + (((charCode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
                utf8.push(
                    0xf0 | (charCode >> 18),
                    0x80 | ((charCode >> 12) & 0x3f),
                    0x80 | ((charCode >> 6) & 0x3f),
                    0x80 | (charCode & 0x3f)
                );
            }
        }
        return new Uint8Array(utf8);
    }
};

export const TextDecoder = class {
    decode(bytes: Uint8Array) {
        let result = '';
        let i = 0;
        while (i < bytes.length) {
            let byte1 = bytes[i++];
            if (byte1 < 0x80) {
                result += String.fromCharCode(byte1);
            } else if (byte1 >= 0xc0 && byte1 < 0xe0) {
                let byte2 = bytes[i++];
                result += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
            } else if (byte1 >= 0xe0 && byte1 < 0xf0) {
                let byte2 = bytes[i++];
                let byte3 = bytes[i++];
                result += String.fromCharCode(
                    ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
                );
            } else if (byte1 >= 0xf0) {
                let byte2 = bytes[i++];
                let byte3 = bytes[i++];
                let byte4 = bytes[i++];
                let codePoint =
                    ((byte1 & 0x07) << 18) |
                    ((byte2 & 0x3f) << 12) |
                    ((byte3 & 0x3f) << 6) |
                    (byte4 & 0x3f);
                codePoint -= 0x10000;
                result += String.fromCharCode(
                    0xd800 + (codePoint >> 10),
                    0xdc00 + (codePoint & 0x3ff)
                );
            }
        }
        return result;
    }
};