(() => {
  const filters = [...document.querySelectorAll('[data-featured-filter]')];
  const projects = [...document.querySelectorAll('[data-project-kind]')];

  if (!filters.length || !projects.length) return;

  document.documentElement.classList.add('js');

  function activateFeaturedProject(selected) {
    filters.forEach((button) => {
      const isActive = button.dataset.featuredFilter === selected;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
      button.setAttribute('aria-selected', String(isActive));
      button.tabIndex = isActive ? 0 : -1;
    });

    projects.forEach((project) => {
      project.hidden = project.dataset.projectKind !== selected;
    });
  }

  filters.forEach((button, index) => {
    button.addEventListener('click', () => activateFeaturedProject(button.dataset.featuredFilter));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let nextIndex = index;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + filters.length) % filters.length;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % filters.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = filters.length - 1;
      filters[nextIndex].focus();
      activateFeaturedProject(filters[nextIndex].dataset.featuredFilter);
    });
  });

  document.querySelectorAll('.featured-project-gallery img').forEach((image) => {
    image.addEventListener('error', () => {
      image.classList.add('image-unavailable');
      image.parentElement?.classList.add('image-unavailable');
    });
  });

  projects.forEach((project) => {
    project.addEventListener('click', (event) => {
      if (event.target.closest('a, button')) return;
      project.querySelector('.featured-project-title-link')?.click();
    });
  });

  activateFeaturedProject(filters.find((button) => button.classList.contains('active'))?.dataset.featuredFilter || 'operations');
})();
