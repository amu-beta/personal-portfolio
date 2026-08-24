(() => {
  const filters = [...document.querySelectorAll('[data-works-filter]')];
  const groups = [...document.querySelectorAll('[data-work-kind]')];

  if (!filters.length || !groups.length) return;

  document.documentElement.classList.add('js');

  function activateWorksFilter(selected) {
    filters.forEach((button) => {
      const isActive = button.dataset.worksFilter === selected;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    groups.forEach((group) => {
      group.hidden = group.dataset.workKind !== selected;
    });
  }

  filters.forEach((button) => {
    button.addEventListener('click', () => activateWorksFilter(button.dataset.worksFilter));
  });

  activateWorksFilter(filters.find((button) => button.classList.contains('active'))?.dataset.worksFilter || 'design');
})();
