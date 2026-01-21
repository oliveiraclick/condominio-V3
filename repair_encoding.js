const fs = require('fs');

const files = [
    'c:\\Users\\Denys Cesar\\Downloads\\condov4\\condov3\\pages\\Resident.tsx',
    'c:\\Users\\Denys Cesar\\Downloads\\condov4\\condov3\\pages\\Professional.tsx',
    'c:\\Users\\Denys Cesar\\Downloads\\condov4\\condov3\\pages\\SuperAdmin.tsx'
];

const patterns = [
    // Resident.tsx & General
    { search: /avalia..o/g, replace: 'avaliação' },
    { search: /M.o!/g, replace: 'Mão!' },
    { search: /N.o estou/g, replace: 'Não estou' },
    { search: /Voc. tem/g, replace: 'Você tem' },
    { search: /servi.os/g, replace: 'serviços' },
    { search: /com.rcio/g, replace: 'comércio' },
    { search: /Ningu.m/g, replace: 'Ninguém' },
    { search: /endereo/g, replace: 'endereço' },
    { search: /Aperto de M..o/g, replace: 'Aperto de Mão' },

    // Professional.tsx specific (missing chars or garbage)
    { search: /condomnio/g, replace: 'condomínio' },
    { search: /no disponvel/g, replace: 'não disponível' },
    { search: /Ol\s\$\{/g, replace: 'Olá ${' }, // "Ol ${" -> "Olá ${"

    // Other common patterns if found
    { search: /Notifica..es/g, replace: 'Notificações' },
    { search: /Informa..es/g, replace: 'Informações' },
    { search: /c.digo/g, replace: 'código' },
    { search: /N.o/g, replace: 'Não' },
];

files.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            let content = fs.readFileSync(file, 'utf8');
            let original = content;

            patterns.forEach(p => {
                content = content.replace(p.search, p.replace);
            });

            if (content !== original) {
                fs.writeFileSync(file, content, 'utf8');
                console.log(`Updated ${file}`);
            } else {
                console.log(`No changes needed for ${file}`);
            }
        } else {
            console.log(`File not found: ${file}`);
        }
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});
