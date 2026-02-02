-- Enable pg_cron extension (if supported/allowed by permissions)
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule the daily finance check at 00:00 (Midnight)
-- Job name: daily-professional-status-check
SELECT cron.schedule(
  'daily-professional-status-check',
  '0 0 * * *', 
  $$SELECT public.check_professional_status()$$
);
