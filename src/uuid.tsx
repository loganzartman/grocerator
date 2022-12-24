const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const insecureRandomValues = (buffer: Uint8Array) => {
  for (let i = 0; i < buffer.length; ++i) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
};

// INSECURE random ID (not uuidv4)
export const randomUUID = () => {
  const bytes = new Uint8Array(22); // we use 6/8 bits of each byte, this gives > 128 bits entropy
  if (window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    insecureRandomValues(bytes);
  }
  return [...bytes].map((b) => alphabet[b & 0b111111]).join('');
};
