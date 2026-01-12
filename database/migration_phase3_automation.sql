-- Phase 3: Automation & Hyper-Local Notifications

-- 1. Add condominium_id to sent_notifications for targeting
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sent_notifications' AND column_name = 'condominium_id') THEN
        ALTER TABLE public.sent_notifications ADD COLUMN condominium_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Function to trigger notification when Professional goes Online
CREATE OR REPLACE FUNCTION public.trigger_pro_online_notification()
RETURNS TRIGGER AS $$
DECLARE
    pro_name TEXT;
    pro_category TEXT;
BEGIN
    -- Only trigger when is_on_site changes from false to true
    IF OLD.is_on_site = false AND NEW.is_on_site = true AND NEW.role = 'professional' THEN
        
        -- Get professional details
        pro_name := NEW.name;
        pro_category := NEW.category;

        -- Insert notification targeted at Residents of the SAME Condominium
        INSERT INTO public.sent_notifications (
            title,
            body,
            target_role,
            condominium_id,
            created_by
        ) VALUES (
            '🚀 Profissional Online!',
            pro_name || ' (' || pro_category || ') acabou de entrar no condomínio! Toque para ver.',
            'resident',
            NEW.condominium_id,
            NEW.id -- Created by the professional (system trigger)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create Trigger on profiles table
DROP TRIGGER IF EXISTS on_professional_online ON public.profiles;
CREATE TRIGGER on_professional_online
AFTER UPDATE OF is_on_site ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_pro_online_notification();

-- 4. Update Policies for Notification Visibility (Residents only see global OR their condo)
DROP POLICY IF EXISTS "Users can read relevant notifications" ON public.sent_notifications;
CREATE POLICY "Users can read relevant notifications" ON public.sent_notifications
FOR SELECT TO authenticated
USING (
    -- Global notifications (no condo_id) OR Matching condo_id
    (condominium_id IS NULL OR condominium_id = (SELECT condominium_id FROM public.profiles WHERE id = auth.uid()))
    AND
    -- Role matching existing logic
    (target_role = 'all' OR target_role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
);
