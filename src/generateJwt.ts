import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';

import { User, users } from './model';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export function generateJwt(user: User) {
  return jwt.sign({ ...user, password: '' }, JWT_SECRET, {
    expiresIn: '1d',
  });
}
