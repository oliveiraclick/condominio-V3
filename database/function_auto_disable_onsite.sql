-- =====================================================
-- FUNÇÃO: Auto-desligar tag "No Condomínio" após 1 hora
-- =====================================================
-- Esta função desliga automaticamente a tag is_on_site
-- de prestadores que estão online há mais de 1 hora
-- =====================================================

CREATE OR REPLACE FUNCTION auto_disable_expired_onsite_status()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Desliga is_on_site para prestadores que estão online há mais de 1 hora
  UPDATE profiles
  SET 
    is_on_site = false,
    on_site_updated_at = NOW()
  WHERE 
    role = 'professional'
    AND is_on_site = true
    AND on_site_updated_at < (NOW() - INTERVAL '1 hour');
    
  -- Log opcional (pode comentar se não quiser)
  RAISE NOTICE 'Auto-disable: Prestadores offline após 1h foram desativados';
END;
$$;

-- =====================================================
-- TRIGGER: Atualizar on_site_updated_at automaticamente
-- =====================================================
-- Sempre que is_on_site mudar para true, atualiza o timestamp
-- =====================================================

CREATE OR REPLACE FUNCTION update_onsite_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se is_on_site mudou para true, atualiza o timestamp
  IF NEW.is_on_site = true AND (OLD.is_on_site IS NULL OR OLD.is_on_site = false) THEN
    NEW.on_site_updated_at = NOW();
  END IF;
  
  -- Se is_on_site mudou para false, também atualiza (para tracking)
  IF NEW.is_on_site = false AND OLD.is_on_site = true THEN
    NEW.on_site_updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remove trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_update_onsite_timestamp ON profiles;

-- Cria o trigger
CREATE TRIGGER trigger_update_onsite_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_onsite_timestamp();

-- =====================================================
-- COMENTÁRIOS E INSTRUÇÕES
-- =====================================================
-- Para executar a função manualmente (teste):
-- SELECT auto_disable_expired_onsite_status();
--
-- Para agendar execução automática, você tem 2 opções:
--
-- OPÇÃO 1: pg_cron (requer extensão, apenas em planos pagos)
-- SELECT cron.schedule('auto-disable-onsite', '*/5 * * * *', 'SELECT auto_disable_expired_onsite_status()');
--
-- OPÇÃO 2: Edge Function (Supabase Functions + Cron)
-- Criar uma Edge Function que chama esta função a cada 5 minutos
-- =====================================================
