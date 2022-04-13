export const fromHexString = (hexString: string) => {
  const byteArr = hexString.match(/.{1,2}/g);
  if (!byteArr) return new Uint8Array([0, 0, 0]);
  return new Uint8Array(byteArr.map((byte: string) => parseInt(byte, 16)));
};
export const toHexString = (bytes: Uint8Array) =>
  bytes.reduce(
    (str: string, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );

export const putUint32 = (b: ArrayBuffer, offset: number, n: number) => {
  const view = new DataView(b);
  view.setUint32(offset, n, false);
};

export const getUint32 = (b: ArrayBuffer, offset: number) => {
  const view = new DataView(b);
  return view.getUint32(offset, false);
};
