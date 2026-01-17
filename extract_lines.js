import { readFileSync } from 'fs';

const content = readFileSync('pages/Resident.tsx', 'utf8');
const lines = content.split('\n');

// Linhas 940-1000 (índice 939-999)
const section = lines.slice(939, 1000).join('\n');
console.log(section);

