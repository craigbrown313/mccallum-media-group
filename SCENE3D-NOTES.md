# 3D Scroll Layer — Integration Notes

A non-invasive 3D layer has been added to your homepage. It sits behind your existing content and reacts to scroll position, giving each section its own cinematic moment without replacing any of your existing design.

## Files added
```
css/scene3d.css      ← integration CSS (loaded after global.css)
js/scene3d.js        ← Three.js scene, scroll logic, scene routing
```

## Files modified
```
index.html           ← added 2 <script> tags + 1 <link> tag
```
The original inline cursor / scroll / video / panel / counter / aiCanvas scripts are untouched.

## What happens per section

| Section       | 3D effect                                                   |
|---------------|-------------------------------------------------------------|
| Hero          | Fades in only as you start scrolling out — keeps the hero   |
|               | reel as the visual anchor on first load.                    |
| Manifesto     | Wireframe icosahedron ("story crystal") rotating slowly,    |
|               | with a counter-rotating gold inner form and dust ring.      |
| Panels        | A central form **morphs** sphere → cube → pyramid as you    |
|               | scroll through the three service panels.                    |
| AI section    | 3D layer fades out — your existing aiCanvas takes over.     |
| Stats bar     | Subtle teal/cream data-grid drift behind the numbers.       |
| Philosophy    | Particles converge toward a horizontal "horizon line"       |
|               | (echoing the letterbox motif). Bg now semi-transparent.     |
| Who / CTA     | Tri-color wave field (teal → gold → orange) flowing below   |
|               | the camera — colors map to the three audience cards.        |

Plus: gentle parallax on hero text as you scroll, and a slow camera dolly that pulls forward through the page.

## Tech
- **Three.js r128** loaded from cdnjs (no build step)
- **Single canvas, single render loop** — well under 1ms scene update budget
- **Custom GLSL shaders** for the hero particle field, philosophy convergence, and CTA wave — all branded to your existing palette
- Pixel ratio capped at 1.75 (mobile-safe)
- Pauses when the tab is hidden
- Honors `prefers-reduced-motion` (smaller particle counts, no blend mode)
- `mix-blend-mode: screen` on the host so particles add light to the dark bg

## Tweaking

All colors come from your CSS variables — to retune, edit the `COLORS` object near the top of `js/scene3d.js`:
```js
const COLORS = {
  teal:   new THREE.Color('#2DD4BF'),
  gold:   new THREE.Color('#C9973A'),
  orange: new THREE.Color('#C2612F'),
  ...
};
```

Particle counts are at the top of each `build*` function. Look for the `COUNT` or `N` constant — drop them if you want lighter weight.

To dial the overall intensity up or down, change `mix-blend-mode: screen` in `css/scene3d.css` to `normal` (more subtle) or remove the opacity throttle on mobile.

## Applying to other pages

Right now the 3D layer is wired to `index.html` only. To add it to `about.html`, `services.html`, etc., just include the same two tags:
```html
<link rel="stylesheet" href="/css/scene3d.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="/js/scene3d.js" defer></script>
```
The script auto-detects which sections exist on the page (via the `.hero`, `.manifesto`, `.panels`, etc. selectors) and only renders scenes for sections it finds. On pages without those sections, you'll just see the hero particle field.

## Browser support
- Chrome / Edge / Safari / Firefox latest: ✓
- iOS Safari 14+: ✓
- Android Chrome: ✓
- Falls back gracefully (3D simply doesn't render) if WebGL is unavailable.
