const insecureRandomValues = (buffer: Uint8Array) => {
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
};

const isArrayBufferLike = (o: any): boolean =>
  o instanceof ArrayBuffer || ArrayBuffer.isView(o);

export const fixLocalhostUrl = () => {
  // kroger auth is very particular about where it will redirect to (not localhost)
  // and what domains it will provide CORS headers for (not 127.0.0.1 or localhost)
  const url = new URL(location.href);
  if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
    url.hostname = 'localhost.loga.nz'; // resolves to 127.0.0.1
    location.href = url.toString();
  }
};

export const encodeBase64 = (o: string | ArrayBufferLike): string => {
  if (typeof o === 'string') {
    return btoa(o);
  }
  if (isArrayBufferLike(o)) {
    return btoa(
      Array.from(new Uint8Array(o))
        .map((c) => String.fromCharCode(c))
        .join('')
    );
  }
  throw new Error('Object not supported');
};

export const encodeUrlSafeBase64 = (o: string | ArrayBufferLike): string => {
  return encodeBase64(o)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
};

// INSECURE random ID (not uuidv4)
export const randomUUID = () => {
  const bytes = new Uint8Array(16);
  if (window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    insecureRandomValues(bytes);
  }
  return encodeUrlSafeBase64(bytes);
};

export const delayMs = async (ms: number): Promise<void> => {
  if (!Number.isFinite(ms)) {
    throw new Error('Invalid delay: ' + ms);
  }
  let resolve: () => void;
  const deferred = new Promise<void>((res) => {
    resolve = res;
  });
  setTimeout(() => resolve(), ms);
  return deferred;
};
