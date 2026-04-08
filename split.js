const fs = require('fs');

const code = fs.readFileSync('src/WallCalendar.tsx', 'utf-8');

const lines = code.split('\n');

function extractBlock(startRegex, endRegex) {
  const extracted = [];
  let inBlock = false;
  let blockStr = '';

  for (let i = 0; i < lines.length; i++) {
    if (!inBlock && startRegex.test(lines[i])) {
      inBlock = true;
    }
    if (inBlock) {
      blockStr += lines[i] + '\n';
      if (endRegex.test(lines[i])) {
        inBlock = false;
        extracted.push(blockStr.trim());
        blockStr = '';
      }
    }
  }
  return extracted;
}

// Manually we can just replace WallCalendar.tsx directly and provide new files.
// But to avoid regex edge cases, I will just write a prompt message and do the manual refactor if I can easily copy-paste.

