import redisClient from './redis';
import { v4 as uuidv4 } from 'uuid';

export default async function generateAuthToken() {
  const token = uuidv4();
  const key = `auth_${token}`;
  await redisClient.set(key, token, 24 * 60 * 60);
  return { token };
}