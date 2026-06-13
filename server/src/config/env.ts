import { cleanEnv, str, num, port } from 'envalid';

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  PORT: port({ default: 3000 }),
  DATABASE_URL: str(),
  JWT_SECRET: str(),
  JWT_EXPIRES_IN: str({ default: '30d' }),
  ALLOWED_ORIGINS: str({ default: 'http://localhost:3000' })
});
