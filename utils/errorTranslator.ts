
/**
 * Traduz erros técnicos do Supabase/Postgres para mensagens amigáveis em português.
 * @param error O objeto de erro retornado pelo Supabase ou try/catch
 * @returns Uma string com a mensagem traduzida
 */
export const translateError = (error: any): string => {
    if (!error) return 'Erro desconhecido.';

    const message = error.message?.toLowerCase() || '';
    const code = error.code || '';
    const details = error.details?.toLowerCase() || '';

    // --- 1. Mapeamento de Erros de Autenticação (Auth / Supabase) ---
    // Textos parciais ou códigos comuns do GoTrue/Supabase
    if (message.includes('user already registered') || message.includes('already exists')) {
        return 'Este e-mail já está cadastrado. Faça login ou recupere sua senha.';
    }
    if (message.includes('invalid login credentials')) {
        return 'E-mail ou senha incorretos.';
    }
    if (message.includes('email not confirmed')) {
        return 'Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.';
    }
    if (message.includes('password should be at least 6 characters')) {
        return 'A senha deve ter pelo menos 6 caracteres.';
    }
    if (message.includes('valid email')) {
        return 'Digite um e-mail válido.';
    }
    if (message.includes('rate limit exceeded')) {
        return 'Muitas tentativas. Aguarde alguns instantes antes de tentar novamente.';
    }

    // --- 2. Unique Constraints (Duplicidade no Banco) ---
    if (code === '23505' || message.includes('unique constraint')) {
        if (message.includes('unique_active_reservation_hourly') || details.includes('unique_active_reservation_hourly')) {
            return 'Você já possui uma reserva ativa neste horário. Cancele a anterior se deseja reagendar.';
        }
        if (message.includes('users_email_key')) {
            return 'Este e-mail já está cadastrado no sistema.';
        }
        if (message.includes('users_cpf_key')) {
            return 'Este CPF já está cadastrado no sistema.';
        }
        if (message.includes('users_cnpj_key')) {
            return 'Este CNPJ já está cadastrado no sistema.';
        }
        return 'Registro duplicado. Verifique se você já realizou esta operação.';
    }

    // --- 3. Foreign Key Constraints (Violação de Integridade) ---
    if (code === '23503') {
        return 'Não foi possível completar a operação pois este registro depende de outros dados que não foram encontrados (ex: morador ou área removida).';
    }

    // --- 4. Check Constraints (Validações de Banco) ---
    if (code === '23514') {
        if (message.includes('check_time_slot')) {
            return 'O horário selecionado é inválido para este tipo de reserva.';
        }
        return 'Os dados informados não atendem aos requisitos do sistema.';
    }

    // --- 5. Erros de Rede / Conexão ---
    if (message.includes('failed to fetch') || message.includes('network request failed')) {
        return 'Falha de conexão. Verifique sua internet e tente novamente.';
    }

    // --- 6. Fallback Genérico ---
    // Se a mensagem for muito técnica (contém underline ou chars estranhos), mostra algo genérico.
    // Caso contrário, tenta mostrar a mensagem original se parecer legível, ou fallback.
    if (message.length > 50 && (message.includes('_') || message.includes('"'))) {
        return 'Não foi possível realizar a operação. Tente novamente mais tarde.';
    }

    return error.message || 'Ocorreu um erro inesperado.';
};
