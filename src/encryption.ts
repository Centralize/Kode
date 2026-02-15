import { Kem, Symmetric } from '@skairipaapps/pqc-encryption';

const kem = new Kem('kyber-768');
const symmetric = new Symmetric('aes-256-gcm');

export async function encrypt(data: string, key: Uint8Array): Promise<string> {
  const { ciphertext, encapsulatedKey } = await kem.encapsulate(key);
  const iv = new Uint8Array(12); // Initialization vector
  const encryptedData = await symmetric.encrypt(data, ciphertext, iv);
  return JSON.stringify({
    encryptedData: Buffer.from(encryptedData).toString('base64'),
    encapsulatedKey: Buffer.from(encapsulatedKey).toString('base64'),
    iv: Buffer.from(iv).toString('base64'),
  });
}

export async function decrypt(encryptedJson: string, key: Uint8Array): Promise<string> {
  const { encryptedData, encapsulatedKey, iv } = JSON.parse(encryptedJson);
  const ciphertext = await kem.decapsulate(Buffer.from(encapsulatedKey, 'base64'));
  const decryptedData = await symmetric.decrypt(
    Buffer.from(encryptedData, 'base64'),
    ciphertext,
    Buffer.from(iv, 'base64')
  );
  return new TextDecoder().decode(decryptedData);
}
