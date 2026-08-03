/**
 * project-detail.ts — Renders a project detail page from ?id=<projectId>.
 */

import './styles/global.css';
import './styles/project.css';
import { PROJECTS, getProject } from './data/projects.ts';

function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

const params = new URLSearchParams(window.location.search);
const project = getProject(params.get('id') ?? '');

if (!project) {
  document.title = 'Project not found — Riddhi Bantia';
  setText('p-title', 'Project not found');
  const banner = document.getElementById('p-banner');
  if (banner) banner.style.background = 'var(--bg-card)';
  setText('p-overview', 'The project you are looking for does not exist. Head back to the homepage to explore the full portfolio.');
  const repo = document.getElementById('p-repo');
  const live = document.getElementById('p-live') as HTMLAnchorElement | null;
  if (repo) repo.style.display = 'none';
  if (live) {
    live.href = '/';
    live.textContent = 'Back to home';
  }
} else {
  document.title = `${project.title} — Riddhi Bantia`;
  setText('p-tag', `// ${project.tag} · project`);
  setText('p-title', project.title);
  setText('p-banner-label', project.title);

  const banner = document.getElementById('p-banner');
  if (banner) banner.style.background = project.gradient;

  setText('p-overview', project.overview);

  const features = document.getElementById('p-features');
  if (features) {
    features.innerHTML = '';
    project.features.forEach(f => {
      const li = document.createElement('li');
      li.textContent = f;
      features.appendChild(li);
    });
  }

  const techs = document.getElementById('p-techs');
  if (techs) {
    techs.innerHTML = '';
    project.technologies.forEach(t => {
      const span = document.createElement('span');
      span.className = 'tag';
      span.textContent = t;
      techs.appendChild(span);
    });
  }

  const repo = document.getElementById('p-repo') as HTMLAnchorElement | null;
  if (repo) repo.href = project.repo;
  const live = document.getElementById('p-live') as HTMLAnchorElement | null;
  if (live) live.href = project.live;

  // Prev / next navigation
  const index = PROJECTS.indexOf(project);
  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  const prevLink = document.getElementById('p-prev') as HTMLAnchorElement | null;
  if (prevLink) {
    prevLink.href = `/project.html?id=${prev.id}`;
    prevLink.innerHTML = `<span class="project-nav__direction">Previous</span><span class="project-nav__name">${prev.title}</span>`;
  }
  const nextLink = document.getElementById('p-next') as HTMLAnchorElement | null;
  if (nextLink) {
    nextLink.href = `/project.html?id=${next.id}`;
    nextLink.innerHTML = `<span class="project-nav__direction">Next</span><span class="project-nav__name">${next.title}</span>`;
  }
}
