# Wall Calendar

A wall calendar built with React + TypeScript + Vite. Looks like an actual paper calendar hanging on a wall.

<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/d36b54f7-c7f1-47b3-91ab-78103c8d4768" />

## ✨ Features & Enhancements

- **Stunning UI & Animations:** Physically accurate 3D page-flipping animations (600ms) with Ken Burns background crossfades.
- **Dynamic Image Theming:** Each month features a unique hero image, and the app automatically computes and scopes CSS custom properties (colors, gradients, text contrast) based on that image.
- **Lightning Fast Performance:** The entire 42-day grid is meticulously optimized with `React.memo`, `useMemo`, and `useCallback`, eliminating lag and unnecessary re-renders during rapid interactions or hovers.
- **Go To Date Picker:** Quickly jump to any specific day, month, or year using the integrated native date picker.
- **Range Selection & Notes:** Click any date to start a range selection, click another to end it. Add and view notes stored securely in `localStorage`.
- **Keyboard Navigation:** Fully accessible keyboard support (Arrow keys, Home, End, Enter, Shift+Enter) for easy scanning.
- **Seamless Responsiveness:** Intelligent responsive design that collapses the notes panel into space-saving dropdowns on mobile devices.
- **Flawless Overlay & Tooltips:** Carefully mapped `z-index` stacking and "mimic" DOM rendering during page transitions ensures zero layout jumps and proper tooltip display.

## 🛠️ Implementation Details

<!-- ADD YOUR SCREENSHOT HERE -->
![Evaluation Screenshot](Placeholder_-_Leave_space_for_your_image_here)

**Architectural Highlights**
- **State Management:** Handled natively using React Hooks to process complex permutations (range selection, hover preview tracking) without heavy third-party libraries.
- **Component Design:** Extracting heavy computations out of individual `DayCell` renders and scoping custom inline variables (`staticThemeVars`) keeps the active and static layers flawlessly synchronized.
- **CSS Styling:** Complete separation of themes via custom CSS variables (`--wc-main`, `--wc-dark`) injected directly into the component tree matching the background heroes seamlessly.
- **Persistence:** LocalStorage integration allows for robust offline support of all user-added date notes.

## Run locally

```bash
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

Live Demo [https://calendar-assignment-tuf.vercel.app/](https://calendar-assignment-tuf.vercel.app)

## Desktop View
<img width="3586" height="1716" alt="image" src="https://github.com/user-attachments/assets/b27627be-da68-4f97-9743-04dddae7b18a" />

## Mobile View
<img width="3586" height="1716" alt="image" src="https://github.com/user-attachments/assets/826ce74e-05aa-4702-a519-fb727c2d39d5" />

## Demo Video
[demo.webm](https://github.com/user-attachments/assets/2f282f1d-4f7f-4a7c-a26b-e12e7b1a52c2)


## Structures
<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/9a764ba7-a64d-4174-91cb-0340ed48642c" />

## Build

```bash
npm run build
```
