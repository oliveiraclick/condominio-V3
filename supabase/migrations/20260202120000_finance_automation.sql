-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    title text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
ON public.notifications FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);


-- 2. Create Automation Function
CREATE OR REPLACE FUNCTION public.check_professional_status()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    prof RECORD;
    trial_end date;
    days_diff int;
BEGIN
    -- Iterate over all professionals that are active (approved) and not blocked
    FOR prof IN 
        SELECT id, trial_ends_at, status 
        FROM public.profiles 
        WHERE role = 'professional' AND status = 'approved'
    LOOP
        -- If no trial date, skip (or handle as needed)
        IF prof.trial_ends_at IS NULL THEN
            CONTINUE;
        END IF;

        trial_end := prof.trial_ends_at::date;
        days_diff := (trial_end - CURRENT_DATE);

        -- A. Warning: 3 Days Left
        IF days_diff = 3 THEN
             INSERT INTO public.notifications (user_id, title, message)
             VALUES (prof.id, 'Vencimento Próximo', 'Sua mensalidade vence em 3 dias. Evite a suspensão mantendo o pagamento em dia.');
        END IF;

        -- B. Due Day: Status -> awaiting_payment
        IF days_diff = 0 THEN
             UPDATE public.profiles SET status = 'awaiting_payment' WHERE id = prof.id;
             INSERT INTO public.notifications (user_id, title, message)
             VALUES (prof.id, 'Mensalidade Vencida', 'Sua mensalidade venceu hoje. Regularize para manter o acesso ativo.');
        END IF;

        -- C. Overdue (3 Days after): Status -> suspended
        IF days_diff = -3 THEN
             UPDATE public.profiles SET status = 'suspended' WHERE id = prof.id;
             INSERT INTO public.notifications (user_id, title, message)
             VALUES (prof.id, 'Acesso Suspenso', 'Seu acesso foi suspenso por atraso no pagamento. Regularize para reativar.');
        END IF;

    END LOOP;
END;
$$;

-- 3. Schedule Cron Job (Runs every day at 06:00 AM)
-- Note: Requires pg_cron extension to be enabled in Supabase Dashboard or reliable local environment
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Remove existing job if it exists to avoid duplicates on re-run (optional safety)
SELECT cron.unschedule('check-prof-status-daily');

-- Schedule the job
SELECT cron.schedule(
    'check-prof-status-daily', -- name
    '0 6 * * *',               -- schedule (6:00 AM daily)
    'SELECT public.check_professional_status()' -- functionality
);

-- 4. Create compatibility view for Frontend
-- The frontend is querying 'my_unread_notifications', so we create a view to map the new table to this name.
CREATE OR REPLACE VIEW public.my_unread_notifications AS
SELECT *
FROM public.notifications
WHERE user_id = auth.uid()
AND read = false;

