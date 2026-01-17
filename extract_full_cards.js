import { readFileSync } from 'fs';

const content = readFileSync('pages/Resident.tsx', 'utf8');

// Buscar a seção completa do onSitePros
const startMarker = 'onSitePros.map((pro, i) =>';
const endMarker = '))}\n            </div>';

const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
    console.log('❌ Não encontrou onSitePros.map');
    process.exit(1);
}

// Pegar 1500 caracteres a partir do início
const section = content.substring(startIndex, startIndex + 1500);
console.log('=== CÓDIGO DOS CARDS ===\n');
console.log(section);
