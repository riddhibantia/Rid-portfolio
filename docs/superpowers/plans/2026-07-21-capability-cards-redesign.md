# Capability Cards Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the capabilities section from category-based cards to individual tool cards with logos, making the section more visually engaging.

**Architecture:** Replace the 8 category cards with 15 individual tool cards. Each card features a centered layout with logo (from Simple Icons CDN), tool name, category tag, and short description. Keep existing frosted glass card style.

**Tech Stack:** HTML, CSS, Simple Icons CDN

## Global Constraints
- Must pass `npm run build` (TypeScript + Vite)
- Keep existing frosted glass card style (rgba white bg, backdrop-filter blur)
- Icons sourced from Simple Icons CDN (https://cdn.simpleicons.org/)
- Tools without official logos are skipped
- Responsive: 4 columns desktop, 3 tablet, 2 mobile, 1 small mobile

---

## File Structure

| File | Action | Purpose |
|------|--------|---------|
| `index.html` | Modify | Add Simple Icons CDN, restructure capabilities HTML |
| `src/styles/capabilities.css` | Modify | New card styles, update grid layout |

---

### Task 1: Add Simple Icons CDN to index.html

**Files:**
- Modify: `index.html:4-31` (head section)

**Interfaces:**
- Consumes: None (first task)
- Produces: Simple Icons CSS available globally

- [ ] **Step 1: Add Simple Icons CSS import**

Open `index.html` and add the following line in the `<head>` section, after the existing CSS imports (around line 30):

```html
<link rel="stylesheet" href="https://cdn.simpleicons.org/v15/" />
```

- [ ] **Step 2: Verify CDN is accessible**

Run: `npm run build`
Expected: Build succeeds (no TypeScript errors related to this change)

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Simple Icons CDN for capability cards"
```

---

### Task 2: Restructure capabilities HTML in index.html

**Files:**
- Modify: `index.html:199-273` (capabilities section)

**Interfaces:**
- Consumes: Simple Icons CDN (Task 1)
- Produces: New HTML structure for tool cards

- [ ] **Step 1: Replace capabilities grid HTML**

Replace the entire `.capabilities__grid` div (lines 206-272) with the following structure:

```html
<div class="capabilities__grid">
  <!-- 3D -->
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/blender" alt="Blender logo" />
    <h3 class="tool-card__name">Blender</h3>
    <span class="tool-card__category">3D</span>
    <p class="tool-card__desc">3D modeling and rendering</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/threedotjs" alt="Three.js logo" />
    <h3 class="tool-card__name">Three.js</h3>
    <span class="tool-card__category">3D</span>
    <p class="tool-card__desc">JavaScript 3D library</p>
  </div>

  <!-- Frontend -->
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/typescript" alt="TypeScript logo" />
    <h3 class="tool-card__name">TypeScript</h3>
    <span class="tool-card__category">Frontend</span>
    <p class="tool-card__desc">Type-safe JavaScript</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/react" alt="React logo" />
    <h3 class="tool-card__name">React</h3>
    <span class="tool-card__category">Frontend</span>
    <p class="tool-card__desc">UI component library</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/tailwindcss" alt="Tailwind CSS logo" />
    <h3 class="tool-card__name">Tailwind CSS</h3>
    <span class="tool-card__category">Frontend</span>
    <p class="tool-card__desc">Utility-first CSS</p>
  </div>

  <!-- Design -->
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/figma" alt="Figma logo" />
    <h3 class="tool-card__name">Figma</h3>
    <span class="tool-card__category">Design</span>
    <p class="tool-card__desc">Interface design tool</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/adobephotoshop" alt="Photoshop logo" />
    <h3 class="tool-card__name">Photoshop</h3>
    <span class="tool-card__category">Design</span>
    <p class="tool-card__desc">Image editing</p>
  </div>

  <!-- Backend -->
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/nodedotjs" alt="Node.js logo" />
    <h3 class="tool-card__name">Node.js</h3>
    <span class="tool-card__category">Backend</span>
    <p class="tool-card__desc">JavaScript runtime</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/python" alt="Python logo" />
    <h3 class="tool-card__name">Python</h3>
    <span class="tool-card__category">Backend</span>
    <p class="tool-card__desc">Versatile language</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/postgresql" alt="PostgreSQL logo" />
    <h3 class="tool-card__name">PostgreSQL</h3>
    <span class="tool-card__category">Backend</span>
    <p class="tool-card__desc">Relational database</p>
  </div>

  <!-- CMS -->
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/wordpress" alt="WordPress logo" />
    <h3 class="tool-card__name">WordPress</h3>
    <span class="tool-card__category">CMS</span>
    <p class="tool-card__desc">Content management</p>
  </div>

  <!-- AI & ML -->
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/pytorch" alt="PyTorch logo" />
    <h3 class="tool-card__name">PyTorch</h3>
    <span class="tool-card__category">AI & ML</span>
    <p class="tool-card__desc">Deep learning framework</p>
  </div>

  <!-- Tools -->
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/git" alt="Git logo" />
    <h3 class="tool-card__name">Git</h3>
    <span class="tool-card__category">Tools</span>
    <p class="tool-card__desc">Version control</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/visualstudiocode" alt="VS Code logo" />
    <h3 class="tool-card__name">VS Code</h3>
    <span class="tool-card__category">Tools</span>
    <p class="tool-card__desc">Code editor</p>
  </div>
  <div class="tool-card" data-reveal>
    <img class="tool-card__icon" src="https://cdn.simpleicons.org/vite" alt="Vite logo" />
    <h3 class="tool-card__name">Vite</h3>
    <span class="tool-card__category">Tools</span>
    <p class="tool-card__desc">Build tool</p>
  </div>
</div>
```

- [ ] **Step 2: Verify HTML structure**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: restructure capabilities section with individual tool cards"
```

---

### Task 3: Update capabilities CSS for new card layout

**Files:**
- Modify: `src/styles/capabilities.css:38-78` (grid and card styles)

**Interfaces:**
- Consumes: New HTML structure (Task 2)
- Produces: Styled tool cards with centered layout

- [ ] **Step 1: Replace grid and card styles**

Replace the `.capabilities__grid` and `.capability-card` styles (lines 38-78) with:

```css
.capabilities__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.tool-card {
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.tool-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.tool-card__icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  margin-bottom: 0.25rem;
}

.tool-card__name {
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-dark);
  margin: 0;
}

.tool-card__category {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-primary);
  background: rgba(139, 92, 246, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
}

.tool-card__desc {
  font-size: 0.75rem;
  color: #4a4a6a;
  line-height: 1.4;
  margin: 0;
}
```

- [ ] **Step 2: Update responsive breakpoints**

Replace the responsive media queries (lines 98-108) with:

```css
/* ── Responsive ── */
@media (max-width: 1024px) {
  .capabilities__grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .capabilities__layout { grid-template-columns: 1fr; }
  .capabilities__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 480px) {
  .capabilities__grid { grid-template-columns: 1fr; }
}
```

- [ ] **Step 3: Verify build and visual appearance**

Run: `npm run build`
Expected: Build succeeds

Run: `npm run dev`
Expected: Capabilities section shows 15 individual tool cards with logos in a 4-column grid

- [ ] **Step 4: Commit**

```bash
git add src/styles/capabilities.css
git commit -m "feat: add tool card styles with centered layout and icons"
```

---

### Task 4: Final verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks
- Produces: Verified working implementation

- [ ] **Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

- [ ] **Step 2: Visual verification**

Run: `npm run dev`
Expected:
- 15 tool cards displayed in a 4-column grid
- Each card shows: logo (centered), tool name, category tag, description
- Cards have frosted glass effect
- Hover effect works (lift + shadow)
- Responsive: 3 columns on tablet, 2 on mobile, 1 on small screens

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "feat: complete capability cards redesign with tool logos"
```

---

## Success Criteria

- [x] All 15 tools display with correct logos from Simple Icons CDN
- [x] Cards are centered and visually balanced
- [x] Category tags display with accent color
- [x] Responsive layout works at all breakpoints
- [x] Build passes without errors
- [x] Frosted glass card style maintained
