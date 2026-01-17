import { readFileSync } from 'fs';

const content = readFileSync('pages/Resident.tsx', 'utf8');
const lines = content.split('\n');

// Linhas 948-980
const section = lines.slice(947, 981).join('\n');
console.log('=== LINHAS 948-981 ===\n');
console.log(section);
