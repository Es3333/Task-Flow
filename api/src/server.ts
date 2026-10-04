import { createApp } from './app';
import { env } from './config/env';

const app = createApp();
app.listen(env.port, () => {
  console.log(`TaskFlow API listening on :${env.port} (${env.nodeEnv})`);
});
