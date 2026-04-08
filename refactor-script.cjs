const fs = require('fs');

const fileLines = fs.readFileSync('src/WallCalendar.tsx', 'utf-8').split('\n');

const importLines = fileLines.slice(0, 25);
const blockLines = fileLines.slice(25, 577);
const remainderLines = fileLines.slice(577);

// Process blockLines to add 'export ' in front of top-level declarations
let utilsContent = `// WallCalendar.utils.ts
`;

const topLevelRegex = /^(type|interface|const|function) /;
for (let i = 0; i < blockLines.length; i++) {
  let line = blockLines[i];
  if (topLevelRegex.test(line)) {
    line = 'export ' + line;
  }
  utilsContent += line + '\n';
}

fs.writeFileSync('src/WallCalendar.utils.ts', utilsContent);

// Build the WallCalendar.tsx imports: extract the names of everything we exported to import them
const exportedNames = [];
for (let line of blockLines) {
  const match = /^(?:export\s+)?(?:type\s+|interface\s+|const\s+|function\s+)([A-Za-z0-9_]+)/.exec('export ' + line);
  if (topLevelRegex.test(line) && match) {
    let name = match[1];
    exportedNames.push(name);
  }
}

// Ensure type imports are explicitly typed if using TS
const newImportsStr = `import {
  ${exportedNames.map(n => (/^[A-Z][a-z]/.test(n) && !n.includes('MONTH') && !n.includes('HOLIDAYS') && !n.includes('THEMES')) ? `type ${n}` : n).join(',\n  ')}
} from "./WallCalendar.utils";\n`;

// Wait, the regex `(/^[A-Z][a-z]/...)` is a hack for types vs values.
// React allows regular imports for types usually, except if --isolatedModules is on.
// Let's just import everything normally, TS handles it unless specifically required.
const safeImportsStr = `import {
  ${exportedNames.join(',\n  ')}
} from "./WallCalendar.utils";\n`;

const finalTsx = importLines.join('\n') + '\n' + safeImportsStr + '\n' + remainderLines.join('\n');
fs.writeFileSync('src/WallCalendar.tsx', finalTsx);
console.log("Successfully extracted to WallCalendar.utils.ts");
