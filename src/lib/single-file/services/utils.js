function toHex(buffer) {
    const LUT_HEX_4b = [
        '0', '1', '2', '3', '4', '5', '6', '7',
        '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
    ];
    const LUT_HEX_8b = new Array(0x100);
    for (let n = 0; n < 0x100; n++) {
        LUT_HEX_8b[n] = `${LUT_HEX_4b[(n >>> 4) & 0xf]}${LUT_HEX_4b[n & 0xf]}`;
    }

    let out = '';
    for (let idx = 0, edx = buffer.length; idx < edx; idx++) {
        out += LUT_HEX_8b[buffer[idx]];
    }
    return out;
}

export async function getSHA(content) {
    const hashBuffer = await crypto.subtle.digest({ name: 'SHA-256' }, content);
    const hashHex = toHex(new Uint8Array(hashBuffer));
    return hashHex;
}

export function stringToArrayBuffer(str) {
    const buf = new Uint8Array(str.length);
    for (let i = 0; i < str.length; i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf.buffer;
}
