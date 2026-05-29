# McCallum Media Group — Site (v3)

## What's new in v3 (on top of v2)

### New audience pages
- `for-nonprofits.html` — dedicated page for nonprofits and social-impact orgs
  with audience-specific pain points, three productized offers (Annual Impact
  Film / Donor Engagement Engine / Campaign + Grant Films), process, FAQ.
- `for-churches.html` — dedicated page for churches and ministries with their
  own pain points, three productized offers (Sermon-to-Social / Series + Event
  Films / Testimony + Vision Films), process, FAQ.

### Homepage restructure
- "Who We Serve" section rebuilt as a **three-door audience experience**:
  Growing Businesses → Services / Nonprofits → /for-nonprofits / Churches →
  /for-churches. Each "door" is a clickable card with its own art, list of
  offerings, and CTA. Hover-lifted with a top-border accent in the audience
  color (teal / gold / orange respectively).

### Site-wide nav consistency
Every page now has the same nav structure:
Work · Services · Nonprofits · Churches · Studio Films · About
(+ Contact as the right-rail CTA)

## File Structure
```
/
├── index.html              ← Homepage with new audience doors
├── work.html               ← Selected work
├── services.html           ← Three pillars + B-roll + pricing
├── for-nonprofits.html     ← NEW — audience page
├── for-churches.html       ← NEW — audience page
├── productions.html        ← Studio Films / BMAM + HCMD
├── about.html              ← Studio + founder
├── contact.html            ← Lead form
├── ai-consulting.html      ← Deep AI services page
├── social-automation.html  ← Deep social systems page
├── systems-automation.html ← Deep workflow systems page
├── css/
│   ├── global.css
│   └── scene3d.css
├── img/
│   ├── posters/
│   │   ├── between-mercy-and-me.jpg
│   │   └── he-calls-me-daughter.jpg
│   └── projects/
├── js/
│   ├── components.js
│   ├── nav.js
│   └── scene3d.js
├── netlify.toml
└── README.md
```

## Deploy to Netlify

### Option A — Drag & Drop (instant preview, no GitHub)
1. Open [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag the entire `McCallum-Media-Group-v3` folder onto the page
3. Live in ~30 seconds at a generated URL

### Option B — Git
Push to a repo, connect Netlify to it. No build step. Publish directory: `.`

## What to add later
- Real photography/stills for the audience page hero visuals (currently
  SVG abstract placeholders)
- One named case study per audience page (testimonial + film embed)
- Specific HCMD credit title once confirmed (currently "Production Credit")
