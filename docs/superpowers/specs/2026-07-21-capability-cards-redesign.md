# Capability Cards Redesign

## Overview
Redesign the Tools & Technologies (capabilities) section from category-based cards to individual tool cards with logos, making the section more visually engaging and informative.

## Current State
- 8 category cards (3D, WebGL, Frontend, Design, Backend, CMS, AI & ML, Tools)
- Each card lists 3-4 tools as plain text
- No logos or visual identifiers
- Frosted glass card style on light background

## Target State
- 15 individual tool cards (one per tool with available logo)
- Each card: centered logo + tool name + category tag + short description
- Simple Icons CDN for brand logos
- Same frosted glass card style, refined for new layout

## Tools to Include (15)

| Tool | Category | Description | Simple Icon Slug |
|------|----------|-------------|------------------|
| Blender | 3D | 3D modeling and rendering | `blender` |
| Three.js | 3D | JavaScript 3D library | `threedotjs` |
| TypeScript | Frontend | Type-safe JavaScript | `typescript` |
| React | Frontend | UI component library | `react` |
| Tailwind CSS | Frontend | Utility-first CSS | `tailwindcss` |
| Figma | Design | Interface design tool | `figma` |
| Photoshop | Design | Image editing | `adobephotoshop` |
| Node.js | Backend | JavaScript runtime | `nodedotjs` |
| Python | Backend | Versatile language | `python` |
| PostgreSQL | Backend | Relational database | `postgresql` |
| WordPress | CMS | Content management | `wordpress` |
| PyTorch | AI & ML | Deep learning framework | `pytorch` |
| Git | Tools | Version control | `git` |
| VS Code | Tools | Code editor | `visualstudiocode` |
| Vite | Tools | Build tool | `vite` |

## Tools to Skip (no official logo)
- OGL, GLSL, WebGL 2, GSAP, After Effects, Elementor, Headless CMS, REST APIs, scikit-learn, NLP

## Card Structure

```html
<div class="tool-card">
  <img class="tool-card__icon" src="..." alt="Tool Name logo" />
  <h3 class="tool-card__name">Tool Name</h3>
  <span class="tool-card__category">Category</span>
  <p class="tool-card__desc">Short description</p>
</div>
```

## Layout
- Centered card content (icon, name, category, description)
- Grid: 4 columns desktop, 3 tablet, 2 mobile, 1 small mobile
- Card size: consistent across all cards
- Icon size: 40x40px with `object-fit: contain`

## Visual Design
- Keep existing frosted glass style (rgba white bg, backdrop-filter blur)
- Category tag: small pill/badge style, muted color
- Description: smaller text, muted color
- Hover effect: subtle lift + shadow (existing)

## Implementation Steps

1. **Add Simple Icons CDN** to `index.html` head
2. **Restructure HTML** in capabilities section:
   - Remove category grouping
   - Add individual tool cards with logo, name, category, description
3. **Update CSS** in `capabilities.css`:
   - New `.tool-card` styles (centered layout)
   - Update grid for new card count
   - Add `.tool-card__icon`, `.tool-card__name`, `.tool-card__category`, `.tool-card__desc` styles
4. **Verify responsive behavior** at all breakpoints
5. **Test build** with `npm run build`

## Success Criteria
- All 15 tools display with correct logos
- Cards are centered and visually balanced
- Responsive layout works at all breakpoints
- Build passes without errors
