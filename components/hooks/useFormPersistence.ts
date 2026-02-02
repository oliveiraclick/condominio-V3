import { useState, useEffect } from 'react';

/**
 * Hook para persistir dados de formulário no localStorage
 * Previne perda de dados quando o celular fecha ou troca de tela
 */
export function useFormPersistence<T>(
    key: string,
    initialValues: T,
    isOpen: boolean
): [T, (values: T) => void, () => void] {
    const storageKey = `form_draft_${key}`;

    // Carrega dados salvos ou usa valores iniciais
    const [values, setValues] = useState<T>(() => {
        if (typeof window === 'undefined') return initialValues;

        try {
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error loading form draft:', error);
        }
        return initialValues;
    });

    // Salva automaticamente quando valores mudam
    useEffect(() => {
        if (!isOpen) return;

        try {
            localStorage.setItem(storageKey, JSON.stringify(values));
        } catch (error) {
            console.error('Error saving form draft:', error);
        }
    }, [values, storageKey, isOpen]);

    // Limpa o rascunho salvo
    const clearDraft = () => {
        try {
            localStorage.removeItem(storageKey);
            setValues(initialValues);
        } catch (error) {
            console.error('Error clearing form draft:', error);
        }
    };

    // Reseta para valores iniciais quando modal fecha
    useEffect(() => {
        if (!isOpen) {
            // Pequeno delay para permitir animação de fechamento
            const timer = setTimeout(() => {
                setValues(initialValues);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen, initialValues]);

    return [values, setValues, clearDraft];
}
