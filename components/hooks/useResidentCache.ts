import { useRef } from 'react';
import { supabase } from '../../supabase';

interface Resident {
    id: string;
    name: string;
    unit: string;
}

export function useResidentCache() {
    const cache = useRef<Map<string, Resident>>(new Map());

    const getResident = async (residentId: string): Promise<Resident | null> => {
        // 1️⃣ Cache hit
        if (cache.current.has(residentId)) {
            return cache.current.get(residentId)!;
        }

        // 2️⃣ Busca no banco
        const { data, error } = await supabase
            .from('profiles')
            .select('id, name, unit')
            .eq('id', residentId)
            .single();

        if (error || !data) return null;

        // 3️⃣ Salva no cache
        cache.current.set(residentId, data);

        return data;
    };

    return { getResident };
}
