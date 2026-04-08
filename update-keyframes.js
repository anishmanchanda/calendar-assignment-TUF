const fs = require('fs');
let css = fs.readFileSync('src/WallCalendar.css', 'utf-8');

// Replace flip animation keyframes to sliding keyframes
css = css.replace(/@keyframes wc-flip-out-next {[\s\S]*?}/, `@keyframes wc-flip-out-next {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-20px); opacity: 0; }
}`);

css = css.replace(/@keyframes wc-flip-in-next {[\s\S]*?}/, `@keyframes wc-flip-in-next {
  0% { transform: translateX(20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}`);

css = css.replace(/@keyframes wc-flip-out-prev {[\s\S]*?}/, `@keyframes wc-flip-out-prev {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(20px); opacity: 0; }
}`);

css = css.replace(/@keyframes wc-flip-in-prev {[\s\S]*?}/, `@keyframes wc-flip-in-prev {
  0% { transform: translateX(-20px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}`);

fs.writeFileSync('src/WallCalendar.css', css);
