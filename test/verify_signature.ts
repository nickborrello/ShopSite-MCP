import { ShopSiteClient } from '../src/client.js';
import crypto from 'crypto';
import assert from 'assert';

interface MockAxios {
    post: (url: string, data?: any, config?: any) => Promise<any>;
}

class TestClient extends ShopSiteClient {
    public testSignRequest(params: Record<string, string>, timestamp: string, nonce: string): string {
        return (this as any).signRequest(params, timestamp, nonce);
    }
}

const config = {
    baseUrl: 'https://test.com',
    clientId: 'test-client',
    clientSecret: 'secret_key',
    authCode: 'code',
};

const client = new TestClient(config);

(client as any).token = {
    access_token: 'token123',
    expires_in: 3600,
    token_type: 'Bearer'
};

const timestamp = '1234567890';
const nonce = 'nonce123';
const params = {
    param1: 'value1',
    param2: 'value2',
};

const expectedBaseString = [
    'token123',
    timestamp,
    nonce,
    'param1=value1\nparam2=value2'
].join('\n');

const hmac = crypto.createHmac('sha1', config.clientSecret);
hmac.update(expectedBaseString);
const expectedSignature = hmac.digest('hex');

const actualSignature = client.testSignRequest(params, timestamp, nonce);

console.log('Expected Base String:\n', expectedBaseString);
console.log('Expected Signature:', expectedSignature);
console.log('Actual Signature:  ', actualSignature);

assert.strictEqual(actualSignature, expectedSignature, 'Signatures do not match!');
console.log('VERIFICATION SUCCESSFUL: HMAC SHA1 Signature logic is correct.');
