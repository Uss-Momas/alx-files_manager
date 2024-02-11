export default function decodeBase64(data) {
  const buff = Buffer.from(data, 'base64');
  const text = buff.toString('utf-8');
  return text;
}
