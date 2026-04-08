import { readFileSync, writeFileSync } from 'fs';

let content = readFileSync('src/WallCalendar.tsx', 'utf8');

content = content.replace(/import\s*\{([\s\S]*?)\}\s*from\s*'\.\/types';/, (match, group1) => {
  const allImports = group1.split(',').map(s => s.trim()).filter(s => s.length > 0);
  const typeImportNames = ['ThemeKey', 'Theme', 'MonthPalette', 'MonthStyle', 'DatePoint', 'NotesStore', 'NoteMarker', 'DayPreview', 'CalendarCell', 'FlipStage', 'StaticMonthSnapshot', 'NotesListItem'];
  const valImportNames = ['MONTHS', 'SHORT_MONTHS', 'HOLIDAYS'];
  
  const typeImports = allImports.filter(n => typeImportNames.includes(n));
  const valImports = allImports.filter(n => valImportNames.includes(n));
  
  let newImport = '';
  if (typeImports.length > 0) {
    newImport += `import type { ${typeImports.join(', ')} } from './types';\n`;
  }
  if (valImports.length > 0) {
    newImport += `import { ${valImports.join(', ')} } from './types';\n`;
  }
  return newImport.trim();
});

writeFileSync('src/WallCalendar.tsx', content);
