const fs = require('fs');
let css = fs.readFileSync('src/WallCalendar.css', 'utf-8');

const startIdx = css.indexOf('@keyframes wc-flip-out-next');
const endIdx = css.indexOf('.wc-card--flip-out-next,');

const newKeyframes = `
@keyframes wc-slide-out-next {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(-30px); opacity: 0; }
}

@keyframes wc-slide-in-next {
  0% { transform: translateX(30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes wc-slide-out-prev {
  0% { transform: translateX(0); opacity: 1; }
  100% { transform: translateX(30px); opacity: 0; }
}

@keyframes wc-slide-in-prev {
  0% { transform: translateX(-30px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}

`;

if (startIdx !== -1 && endIdx !== -1) {
  css = css.substring(0, startIdx) + newKeyframes + css.substring(endIdx);
}

css = css.replace(/animation: wc-flip-out-next/g, "animation: wc-slide-out-next");
css = css.replace(/animation: wc-flip-in-next/g, "animation: wc-slide-in-next");
css = css.replace(/animation: wc-flip-out-prev/g, "animation: wc-slide-out-prev");
css = css.replace(/animation: wc-flip-in-prev/g, "animation: wc-slide-in-prev");
css = css.replace(/transform-origin: top center;/g, "");
css = css.replace(/transform-style: preserve-3d;/g, "");

fs.writeFileSync('src/WallCalendar.css', css);
