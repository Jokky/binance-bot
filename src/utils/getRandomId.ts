import { randomBytes } from 'crypto';

export const getRandomId = () => randomBytes(16).toString('hex');