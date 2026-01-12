-- FIX: Make the Professional Online Notification Trigger ROBUST
-- This ensures that if the notification fails (permissions, missing column, etc.),
-- the "is_on_site" update itself DOES NOT FAIL.

-- 1. Ensure condominium_id exists safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sent_notifications' AND column_name = 'condominium_id') THEN
        ALTER TABLE public.sent_notifications ADD COLUMN condominium_id UUID REFERENCES public.condominiums(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Redefine the function with Error Handling
CREATE OR REPLACE FUNCTION public.trigger_pro_online_notification()
RETURNS TRIGGER AS $$
DECLARE
    pro_name TEXT;
    pro_category TEXT;
BEGIN
    -- Only trigger when is_on_site changes from false to true
    IF OLD.is_on_site = false AND NEW.is_on_site = true AND NEW.role = 'professional' THEN
        
        BEGIN 
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
        EXCEPTION WHEN OTHERS THEN
            -- CRITICAL: Swallow error so we don't block the professional from going online
            RAISE WARNING 'Failed to send online notification: %', SQLERRM;
        END;
        
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure Trigger Exists
DROP TRIGGER IF EXISTS on_professional_online ON public.profiles;
CREATE TRIGGER on_professional_online
AFTER UPDATE OF is_on_site ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.trigger_pro_online_notification();
