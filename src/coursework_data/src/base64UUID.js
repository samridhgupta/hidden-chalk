import UUIDv4 from 'uuid/v4';
import { Buffer } from 'buffer/';
import base64Url from 'base64-url';

const base64UUID = () => {
    const buffer = new Buffer(16);
    UUIDv4(null, buffer, 0);
    return buffer.toString('base64');
};

const escapedBase64UUID = () => {
    return base64Url.escape(base64UUID());
};

export default { escapedBase64UUID, base64UUID };