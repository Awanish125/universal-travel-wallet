/**
 * newId — a unique identifier for a locally-created record.
 *
 * `crypto.randomUUID()` is only defined in a **secure context**. Opening the
 * app from another device on the same network — `http://192.168.x.x:3000` on a
 * phone, the obvious way to test a mobile-first app — is not one, so the call
 * is `undefined` there and every create action throws before it saves anything.
 * `localhost` is a secure context, which is why the failure only shows up off
 * the development machine.
 *
 * So: use the platform when it is there, and fall back to `crypto.getRandomValues`
 * (available over plain HTTP) formatted as a v4 UUID, then to `Math.random` on
 * anything older. Ids are local row keys, never security tokens, so the weaker
 * fallback costs nothing beyond a theoretical collision.
 */
export function newId(): string {
  const cryptoRef: Crypto | undefined =
    typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;

  if (typeof cryptoRef?.randomUUID === 'function') {
    return cryptoRef.randomUUID();
  }

  if (typeof cryptoRef?.getRandomValues === 'function') {
    const bytes = cryptoRef.getRandomValues(new Uint8Array(16));
    // Stamp the version (4) and variant bits so the result is a well-formed UUID.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  const random = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0');
  return `${random()}${random()}-${random()}-4${random().slice(1)}-a${random().slice(1)}-${random()}${random()}${random()}`;
}
