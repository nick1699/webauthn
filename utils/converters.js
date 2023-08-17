function arrayBufferToBase64(buffer) {
    return Buffer.from(buffer).toString('base64');
}

function base64ToArrayBuffer(base64) {
    const binaryString = Buffer.from(base64, 'base64').toString('binary');
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

function toArrayBuffer(byteArray) {
    let buffer = new ArrayBuffer(byteArray.length);
    let view = new Uint8Array(buffer);
    for (let i = 0; i < byteArray.length; i++) {
        view[i] = byteArray[i];
    }
    return buffer;
}

module.exports = {
    arrayBufferToBase64,
    base64ToArrayBuffer,
    toArrayBuffer
};