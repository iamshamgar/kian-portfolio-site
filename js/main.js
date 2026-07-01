// ============================================================
//  PORTFOLIO ENGINE — main.js
//  Reads from window.PORTFOLIO_DATA (set by data/projects.js)
//  No frameworks. No build step. Pure vanilla JS.
// ============================================================

(function () {
  'use strict';

  // ----------------------------------------------------------
  //  State
  // ----------------------------------------------------------
  var currentProject = null;
  var currentImageIndex = 0;

  // ----------------------------------------------------------
  //  DOM references (populated in cacheDOM)
  // ----------------------------------------------------------
  var dom = {};

  // ----------------------------------------------------------
  //  Entry point
  // ----------------------------------------------------------
  function init() {
    if (typeof PORTFOLIO_DATA === 'undefined') {
      console.error(
        '[Portfolio] PORTFOLIO_DATA is not defined. ' +
        'Make sure data/projects.js is loaded before main.js in index.html.'
      );
      return;
    }

    cacheDOM();
    populateStudentInfo();
    renderProjects();
    bindEvents();
  }

  // ----------------------------------------------------------
  //  Cache DOM references once
  // ----------------------------------------------------------
  function cacheDOM() {
    dom.nav           = document.getElementById('nav');
    dom.navName       = document.getElementById('nav-name');
    dom.navSchool     = document.getElementById('nav-school');
    dom.hamburger     = document.getElementById('nav-hamburger');
    dom.navLinks      = document.getElementById('nav-links');

    dom.heroName      = document.getElementById('hero-name');
    dom.heroTagline   = document.getElementById('hero-tagline');
    dom.heroSchool    = document.getElementById('hero-school');

    dom.aboutPhoto    = document.getElementById('about-photo');
    dom.aboutName     = document.getElementById('about-name');
    dom.aboutSchool   = document.getElementById('about-school');
    dom.aboutYear     = document.getElementById('about-year');
    dom.aboutBio      = document.getElementById('about-bio');
    dom.aboutLinks    = document.getElementById('about-links');

    dom.contactEmail  = document.getElementById('contact-email');
    dom.footerName    = document.getElementById('footer-name');
    dom.footerYear    = document.getElementById('footer-year');

    dom.filterBar     = document.getElementById('filter-bar');
    dom.projectsGrid  = document.getElementById('projects-grid');

    dom.modal             = document.getElementById('modal');
    dom.modalBackdrop     = document.getElementById('modal-backdrop');
    dom.modalClose        = document.getElementById('modal-close');
    dom.modalMainImage    = document.getElementById('modal-main-image');
    dom.modalImagePH      = document.getElementById('modal-image-placeholder');
    dom.modalPrev         = document.getElementById('modal-prev');
    dom.modalNext         = document.getElementById('modal-next');
    dom.modalCounter      = document.getElementById('modal-image-counter');
    dom.modalThumbs       = document.getElementById('modal-thumbnails');
    dom.modalTitle        = document.getElementById('modal-title');
    dom.modalSubtitle     = document.getElementById('modal-subtitle');
    dom.modalTags         = document.getElementById('modal-tags');
    dom.modalYear         = document.getElementById('modal-year');
    dom.modalDesc         = document.getElementById('modal-description');
    dom.modalVideo        = document.getElementById('modal-video-link');
  }

  // ----------------------------------------------------------
  //  Populate student info throughout the page
  // ----------------------------------------------------------
  function populateStudentInfo() {
    var s = PORTFOLIO_DATA.student;
    if (!s) return;

    // Nav
    if (dom.navName)   dom.navName.textContent = s.name || '';
    if (dom.navSchool) dom.navSchool.textContent = s.school || '';

    // Hero
    if (dom.heroName)    dom.heroName.textContent = s.name || '';
    if (dom.heroTagline) dom.heroTagline.textContent = s.tagline || 'Architecture';
    if (dom.heroSchool)  dom.heroSchool.textContent =
      [s.school, s.year].filter(Boolean).join(' · ');

    // Page title
    if (s.name) document.title = s.name + ' — Architecture Portfolio';

    // About: photo
    if (dom.aboutPhoto) {
      if (s.profileImage) {
        var img = document.createElement('img');
        img.src = s.profileImage;
        img.alt = s.name + ' profile photo';
        img.className = 'about-photo-img';
        img.loading = 'lazy';
        img.onerror = function () {
          // Replace with placeholder on load failure
          var ph = createPhotoPlaceholder();
          if (this.parentNode) {
            this.parentNode.replaceChild(ph, this);
          }
        };
        dom.aboutPhoto.appendChild(img);
      } else {
        dom.aboutPhoto.appendChild(createPhotoPlaceholder());
      }
    }

    // About: text
    if (dom.aboutName)   dom.aboutName.textContent = s.name || '';
    if (dom.aboutSchool) dom.aboutSchool.textContent = s.school || '';
    if (dom.aboutYear)   dom.aboutYear.textContent = s.year || '';
    if (dom.aboutBio)    dom.aboutBio.textContent = s.bio || '';

    // About: links — only show fields that have values
    if (dom.aboutLinks) {
      var linksHTML = '';
      if (s.email) {
        linksHTML += '<a href="mailto:' + attr(s.email) + '" class="about-link">Email ↗</a>';
      }
      if (s.linkedin) {
        linksHTML += '<a href="' + attr(s.linkedin) + '" target="_blank" rel="noopener noreferrer" class="about-link">LinkedIn ↗</a>';
      }
      if (s.instagram) {
        linksHTML += '<a href="' + attr(s.instagram) + '" target="_blank" rel="noopener noreferrer" class="about-link">Instagram ↗</a>';
      }
      dom.aboutLinks.innerHTML = linksHTML;
    }

    // Contact
    if (dom.contactEmail && s.email) {
      dom.contactEmail.href = 'mailto:' + s.email;
      dom.contactEmail.textContent = s.email;
    }

    // Footer
    if (dom.footerName) dom.footerName.textContent = s.name || '';
    if (dom.footerYear) dom.footerYear.textContent = new Date().getFullYear();
  }

  function createPhotoPlaceholder() {
    var div = document.createElement('div');
    div.className = 'about-photo-placeholder';
    div.setAttribute('role', 'img');
    div.setAttribute('aria-label', 'Profile photo placeholder');
    return div;
  }

  // ----------------------------------------------------------
  //  Render projects grid + filter bar
  // ----------------------------------------------------------
  function renderProjects() {
    if (!PORTFOLIO_DATA.projects || !dom.projectsGrid || !dom.filterBar) return;

    var projects = sortProjects(PORTFOLIO_DATA.projects);
    var tags = collectTags(projects);

    renderFilterBar(tags);
    renderProjectCards(projects);
  }

  function sortProjects(list) {
    // Featured projects first, then by year descending
    return list.slice().sort(function (a, b) {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0);
    });
  }

  function collectTags(projects) {
    var seen = {};
    var result = [];
    projects.forEach(function (p) {
      if (Array.isArray(p.tags)) {
        p.tags.forEach(function (t) {
          if (!seen[t]) {
            seen[t] = true;
            result.push(t);
          }
        });
      }
    });
    return result.sort();
  }

  function renderFilterBar(tags) {
    var html = '<button class="filter-btn active" data-tag="all">All</button>';
    tags.forEach(function (t) {
      html += '<button class="filter-btn" data-tag="' + attr(t) + '">' + esc(t) + '</button>';
    });
    dom.filterBar.innerHTML = html;
  }

  function renderProjectCards(projects) {
    var html = '';

    projects.forEach(function (p) {
      var firstImage = (Array.isArray(p.images) && p.images.length > 0) ? p.images[0] : '';
      var tagsCsv = Array.isArray(p.tags) ? p.tags.join(',') : '';

      html += '<div';
      html += ' class="project-card"';
      html += ' data-id="' + attr(p.id) + '"';
      html += ' data-tags="' + attr(tagsCsv) + '"';
      html += ' role="button"';
      html += ' tabindex="0"';
      html += ' aria-label="Open project: ' + attr(p.title) + '"';
      html += '>';

      html += '<div class="project-card__image-wrap">';

      if (firstImage) {
        html += '<img';
        html += ' src="' + attr(firstImage) + '"';
        html += ' alt="' + attr(p.title) + '"';
        html += ' class="project-card__img"';
        html += ' loading="lazy"';
        // On error: hide the broken img so the CSS bg placeholder shows
        html += ' onerror="this.style.opacity=\'0\'"';
        html += '>';
      }

      html += '<div class="project-card__overlay" aria-hidden="true">';
      html += '<h3 class="project-card__title">' + esc(p.title) + '</h3>';
      html += '<p class="project-card__subtitle">' + esc(p.subtitle || '') + '</p>';
      html += '</div>';

      html += '</div>'; // .project-card__image-wrap
      html += '</div>'; // .project-card
    });

    dom.projectsGrid.innerHTML = html;

    // Attach click & keyboard events to each card
    dom.projectsGrid.querySelectorAll('.project-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openModal(card.getAttribute('data-id'));
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card.getAttribute('data-id'));
        }
      });
    });
  }

  // ----------------------------------------------------------
  //  Filter logic
  // ----------------------------------------------------------
  function filterProjects(tag) {
    dom.projectsGrid.querySelectorAll('.project-card').forEach(function (card) {
      if (tag === 'all') {
        card.classList.remove('hidden');
      } else {
        var cardTags = card.getAttribute('data-tags').split(',').map(function (t) {
          return t.trim();
        });
        var match = cardTags.indexOf(tag) > -1;
        card.classList.toggle('hidden', !match);
      }
    });
  }

  // ----------------------------------------------------------
  //  Modal: open
  // ----------------------------------------------------------
  function openModal(id) {
    var project = findProject(id);
    if (!project) return;

    currentProject = project;
    currentImageIndex = 0;

    // Info panel
    if (dom.modalTitle)    dom.modalTitle.textContent = project.title || '';
    if (dom.modalSubtitle) dom.modalSubtitle.textContent = project.subtitle || '';
    if (dom.modalYear)     dom.modalYear.textContent = project.year || '';
    if (dom.modalDesc)     dom.modalDesc.textContent = project.description || '';

    // Tags
    if (dom.modalTags) {
      var tagsHTML = '';
      if (Array.isArray(project.tags)) {
        project.tags.forEach(function (t) {
          tagsHTML += '<span class="modal-tag">' + esc(t) + '</span>';
        });
      }
      dom.modalTags.innerHTML = tagsHTML;
    }

    // Video link
    if (dom.modalVideo) {
      if (project.video) {
        dom.modalVideo.href = project.video;
        dom.modalVideo.style.display = 'inline-flex';
      } else {
        dom.modalVideo.style.display = 'none';
      }
    }

    // Images / carousel
    renderCarousel();

    // Open
    dom.modal.classList.add('active');
    dom.modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    if (dom.modalClose) {
      requestAnimationFrame(function () { dom.modalClose.focus(); });
    }
  }

  // ----------------------------------------------------------
  //  Modal: carousel
  // ----------------------------------------------------------
  function renderCarousel() {
    var images = (currentProject && Array.isArray(currentProject.images))
      ? currentProject.images
      : [];

    if (images.length === 0) {
      // No images — show dark placeholder
      if (dom.modalMainImage)  { dom.modalMainImage.src = ''; dom.modalMainImage.style.display = 'none'; }
      if (dom.modalImagePH)    { dom.modalImagePH.classList.add('visible'); }
      if (dom.modalPrev)       dom.modalPrev.style.display = 'none';
      if (dom.modalNext)       dom.modalNext.style.display = 'none';
      if (dom.modalCounter)    dom.modalCounter.style.display = 'none';
      if (dom.modalThumbs)     { dom.modalThumbs.innerHTML = ''; dom.modalThumbs.style.display = 'none'; }
      return;
    }

    // Has images
    if (dom.modalMainImage) dom.modalMainImage.style.display = 'block';
    if (dom.modalImagePH)   dom.modalImagePH.classList.remove('visible');

    // Arrows & counter: only when multiple images
    var multi = images.length > 1;
    if (dom.modalPrev)    dom.modalPrev.style.display    = multi ? 'flex'  : 'none';
    if (dom.modalNext)    dom.modalNext.style.display    = multi ? 'flex'  : 'none';
    if (dom.modalCounter) dom.modalCounter.style.display = multi ? 'block' : 'none';

    // Thumbnails: only when multiple images
    if (dom.modalThumbs) {
      if (multi) {
        var thumbsHTML = '';
        images.forEach(function (src, i) {
          thumbsHTML += '<button class="modal-thumb' + (i === 0 ? ' active' : '') + '"';
          thumbsHTML += ' data-index="' + i + '"';
          thumbsHTML += ' role="listitem"';
          thumbsHTML += ' aria-label="View image ' + (i + 1) + '">';
          thumbsHTML += '<img src="' + attr(src) + '" alt="" loading="lazy" onerror="this.style.opacity=\'0\'">';
          thumbsHTML += '</button>';
        });
        dom.modalThumbs.innerHTML = thumbsHTML;
        dom.modalThumbs.style.display = 'flex';
      } else {
        dom.modalThumbs.innerHTML = '';
        dom.modalThumbs.style.display = 'none';
      }
    }

    // Load first image
    showImage(0);
  }

  function showImage(index) {
    var images = (currentProject && Array.isArray(currentProject.images))
      ? currentProject.images
      : [];
    if (images.length === 0) return;

    // Clamp
    index = Math.max(0, Math.min(images.length - 1, index));
    currentImageIndex = index;

    if (dom.modalMainImage) {
      dom.modalMainImage.style.opacity = '0';
      dom.modalMainImage.src = images[index];
      dom.modalMainImage.alt = (currentProject.title || '') + ' — image ' + (index + 1);
      dom.modalMainImage.onload = function () {
        dom.modalMainImage.style.opacity = '1';
      };
      dom.modalMainImage.onerror = function () {
        // Image failed: show the placeholder behind it
        if (dom.modalImagePH) dom.modalImagePH.classList.add('visible');
        dom.modalMainImage.style.opacity = '0';
      };
    }

    // Counter
    if (dom.modalCounter && images.length > 1) {
      dom.modalCounter.textContent = (index + 1) + ' ⁄ ' + images.length;
    }

    // Thumbnail active state
    if (dom.modalThumbs) {
      dom.modalThumbs.querySelectorAll('.modal-thumb').forEach(function (thumb, i) {
        thumb.classList.toggle('active', i === index);
      });
    }
  }

  function navigateImage(direction) {
    var images = (currentProject && Array.isArray(currentProject.images))
      ? currentProject.images
      : [];
    if (images.length < 2) return;
    var next = (currentImageIndex + direction + images.length) % images.length;
    showImage(next);
  }

  // ----------------------------------------------------------
  //  Modal: close
  // ----------------------------------------------------------
  function closeModal() {
    if (!dom.modal) return;
    dom.modal.classList.remove('active');
    dom.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    currentProject = null;
    currentImageIndex = 0;
  }

  // ----------------------------------------------------------
  //  Helpers
  // ----------------------------------------------------------
  function findProject(id) {
    if (!PORTFOLIO_DATA.projects) return null;
    for (var i = 0; i < PORTFOLIO_DATA.projects.length; i++) {
      if (PORTFOLIO_DATA.projects[i].id === id) return PORTFOLIO_DATA.projects[i];
    }
    return null;
  }

  // Safe HTML text content
  function esc(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str || '')));
    return d.innerHTML;
  }

  // Safe attribute value
  function attr(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  // ----------------------------------------------------------
  //  Event bindings
  // ----------------------------------------------------------
  function bindEvents() {
    // Scroll: sticky nav background
    window.addEventListener('scroll', function () {
      if (!dom.nav) return;
      dom.nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Hamburger toggle
    if (dom.hamburger && dom.navLinks) {
      dom.hamburger.addEventListener('click', function () {
        var isOpen = dom.navLinks.classList.contains('open');
        dom.navLinks.classList.toggle('open', !isOpen);
        dom.hamburger.classList.toggle('active', !isOpen);
        dom.hamburger.setAttribute('aria-expanded', String(!isOpen));
      });

      // Close mobile nav on link click
      dom.navLinks.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          dom.navLinks.classList.remove('open');
          dom.hamburger.classList.remove('active');
          dom.hamburger.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Filter buttons (event delegation on filter-bar)
    if (dom.filterBar) {
      dom.filterBar.addEventListener('click', function (e) {
        var btn = e.target.closest('.filter-btn');
        if (!btn) return;
        dom.filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        filterProjects(btn.getAttribute('data-tag'));
      });
    }

    // Modal: close button
    if (dom.modalClose) {
      dom.modalClose.addEventListener('click', closeModal);
    }

    // Modal: click backdrop to close
    if (dom.modalBackdrop) {
      dom.modalBackdrop.addEventListener('click', closeModal);
    }

    // Modal: prev / next
    if (dom.modalPrev) {
      dom.modalPrev.addEventListener('click', function () { navigateImage(-1); });
    }
    if (dom.modalNext) {
      dom.modalNext.addEventListener('click', function () { navigateImage(1); });
    }

    // Modal: thumbnail clicks (event delegation)
    if (dom.modalThumbs) {
      dom.modalThumbs.addEventListener('click', function (e) {
        var thumb = e.target.closest('.modal-thumb');
        if (!thumb) return;
        var idx = parseInt(thumb.getAttribute('data-index'), 10);
        if (!isNaN(idx)) showImage(idx);
      });
    }

    // Keyboard: ESC closes modal, arrow keys navigate images
    document.addEventListener('keydown', function (e) {
      if (!dom.modal || !dom.modal.classList.contains('active')) return;

      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          navigateImage(-1);
          break;
        case 'ArrowRight':
          navigateImage(1);
          break;
      }
    });
  }

  // ----------------------------------------------------------
  //  Run
  // ----------------------------------------------------------
  init();

}());
