import { unlinkExpiredMarkers } from '@/domains/post/service';
import cron from 'node-cron';

cron.schedule('0 0 * * *', () => {
  unlinkExpiredMarkers().catch(console.error);
});
