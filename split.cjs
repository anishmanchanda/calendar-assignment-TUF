const fs = require('fs');

let tsx = fs.readFileSync('src/WallCalendar.tsx', 'utf-8');

// The file has imports from line 1 to 20
// The types and constants are from line 22 to 395 

const endOfConstantsStr = "export interface WallCalendarProps {";
const splitIndex = tsx.indexOf(endOfConstantsStr);

if (splitIndex === -1) {
  console.log("Could not find the split index for WallCalendarProps.");
  process.exit(1);
}

// Find the last closing bracket before endOfConstantsStr
const beforePropsText = tsx.substring(0, splitIndex);
const DayCellIndex = beforePropsText.lastIndexOf("const DayCell = memo(");

if (DayCellIndex === -1) {
  console.log("Could not find DayCell.");
  process.exit(1);
}

const utilsAndConstantsEnd = tsx.lastIndexOf("function SpiralBinding() {");
if (utilsAndConstantsEnd === -1) {
  console.log("Could not find SpiralBinding");
  process.exit(1);
}

// Okay, it's safer just to break it manually if I do a regex or just extract a few large consts and types
