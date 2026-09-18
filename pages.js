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

  const dialog = document.getElementById('case-dialog');
  const dialogTitle = document.getElementById('case-dialog-title');
  const dialogGallery = dialog?.querySelector('[data-case-gallery]');

  document.querySelectorAll('[data-open-case]').forEach((button) => {
    button.addEventListener('click', () => {
      const project = projects.find((item) => item.dataset.projectKind === button.dataset.openCase);
      const template = project?.querySelector('template[data-case-template]');
      const title = project?.querySelector('h2')?.textContent?.trim();
      if (!dialog || !dialogGallery || !template || !title) return;
      dialogTitle.textContent = title;
      dialogGallery.replaceChildren(template.content.cloneNode(true));
      dialogGallery.querySelectorAll('img').forEach((image) => {
        image.addEventListener('error', () => image.classList.add('image-unavailable'));
      });
      dialog.showModal();
    });
  });

  dialog?.querySelector('[data-close-case]')?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog?.addEventListener('close', () => dialogGallery?.replaceChildren());

  activateFeaturedProject(filters.find((button) => button.classList.contains('active'))?.dataset.featuredFilter || 'operations');
})();
