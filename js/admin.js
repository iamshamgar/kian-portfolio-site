'use strict';

/* ============================================================
   PORTFOLIO EDITOR — admin.js

   A local content manager for the portfolio site. Two modes:

   1. "fs" mode (Chrome / Edge): uses the File System Access API
      to read and write data/projects.js and image files directly
      in the portfolio folder the user picks. Nothing is uploaded
      anywhere — everything stays on the user's own disk.

   2. "guided" mode (Safari / Firefox, or anywhere the API is
      unavailable): the same forms, but on save it produces the
      generated projects.js for download/copy plus a checklist of
      exactly which image files to rename and place where.

   No libraries. Works from file://.
   ============================================================ */


/* ============================================================
   PURE HELPERS
   (kept free of DOM access so they can be unit-tested)
   ============================================================ */

/**
 * Parse the text of data/projects.js into a data object.
 * The file declares `var PORTFOLIO_DATA = {...};` and may contain
 * comments and trailing commas, so JSON.parse is not an option.
 * Evaluating the whole file in a Function scope handles all of it.
 * Throws on syntax errors; returns whatever PORTFOLIO_DATA is.
 */
function parsePortfolioData(text) {
  var fn = new Function(text + '\n;return PORTFOLIO_DATA;');
  return fn();
}

/** Sanity-check that a parsed object looks like portfolio data. */
function isValidPortfolioData(data) {
  return !!(
    data &&
    typeof data === 'object' &&
    data.student &&
    typeof data.student === 'object' &&
    Array.isArray(data.projects)
  );
}

/** JS string literal (safe escaping via JSON). null/undefined -> "". */
function jsString(v) {
  return JSON.stringify(v === null || v === undefined ? '' : String(v));
}

/**
 * Serialize a data object back into the exact `var PORTFOLIO_DATA = {...};`
 * format the site expects, pretty-printed and human-editable.
 */
function serializePortfolioData(data) {
  var s = data.student || {};
  var projects = data.projects || [];
  var lines = [];

  lines.push('// ============================================================');
  lines.push('//  PORTFOLIO DATA — The only file you need to edit.');
  lines.push('//  Easiest way: open admin.html in Chrome or Edge and use the');
  lines.push('//  Portfolio Editor. You can also edit this file by hand —');
  lines.push('//  see README.md for instructions.');
  lines.push('// ============================================================');
  lines.push('');
  lines.push('var PORTFOLIO_DATA = {');
  lines.push('');
  lines.push('  // ----------------------------------------------------------');
  lines.push('  //  YOUR INFO');
  lines.push('  // ----------------------------------------------------------');
  lines.push('  student: {');
  lines.push('    name: ' + jsString(s.name) + ',');
  lines.push('    tagline: ' + jsString(s.tagline) + ',');
  lines.push('    school: ' + jsString(s.school) + ',');
  lines.push('    year: ' + jsString(s.year) + ',');
  lines.push('    bio: ' + jsString(s.bio) + ',');
  lines.push('    email: ' + jsString(s.email) + ',');
  lines.push('    linkedin: ' + jsString(s.linkedin) + ',    // Full URL, or "" to hide');
  lines.push('    instagram: ' + jsString(s.instagram) + ',   // Full URL, or "" to hide');
  lines.push('    profileImage: ' + jsString(s.profileImage) + '  // "" if no photo yet');
  lines.push('  },');
  lines.push('');
  lines.push('  // ----------------------------------------------------------');
  lines.push('  //  YOUR PROJECTS');
  lines.push('  //  Order below = order on the site.');
  lines.push('  //  The first image in each "images" list is the cover.');
  lines.push('  // ----------------------------------------------------------');
  lines.push('  projects: [');

  projects.forEach(function (p, i) {
    var imgs = p.images || [];
    var tags = p.tags || [];
    lines.push('    {');
    lines.push('      id: ' + jsString(p.id) + ',');
    lines.push('      title: ' + jsString(p.title) + ',');
    lines.push('      subtitle: ' + jsString(p.subtitle) + ',');
    lines.push('      description: ' + jsString(p.description) + ',');
    lines.push('      tags: [' + tags.map(jsString).join(', ') + '],');
    if (imgs.length === 0) {
      lines.push('      images: [],');
    } else {
      lines.push('      images: [');
      imgs.forEach(function (im, j) {
        lines.push('        ' + jsString(im) + (j < imgs.length - 1 ? ',' : ''));
      });
      lines.push('      ],');
    }
    lines.push('      video: ' + jsString(p.video) + ',');
    lines.push('      featured: ' + (p.featured ? 'true' : 'false') + ',');
    lines.push('      year: ' + jsString(p.year));
    lines.push('    }' + (i < projects.length - 1 ? ',' : ''));
  });

  lines.push('  ]');
  lines.push('');
  lines.push('};');
  lines.push('');
  return lines.join('\n');
}

/** Turn a title into a folder-safe id: "Urban Void!" -> "urban-void". */
function slugify(title) {
  var slug = String(title || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')   // strip accents left over from normalize()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'project';
}

/** Ensure an id is unique among existing ids by appending -2, -3, ... */
function uniqueId(base, existingIds) {
  if (existingIds.indexOf(base) === -1) return base;
  var n = 2;
  while (existingIds.indexOf(base + '-' + n) !== -1) n++;
  return base + '-' + n;
}

/** Lowercased file extension, defaulting to jpg. "jpeg" stays "jpeg". */
function extOf(name) {
  var m = /\.([A-Za-z0-9]+)$/.exec(String(name || ''));
  return m ? m[1].toLowerCase() : 'jpg';
}

/** Zero-padded two-digit number: 1 -> "01", 12 -> "12". */
function pad2(n) {
  return String(n).length < 2 ? '0' + n : String(n);
}

/** Highest NN found in paths like ".../03.jpg"; returns 0 if none. */
function maxImageNumber(paths) {
  var max = 0;
  (paths || []).forEach(function (p) {
    var m = /(\d+)\.[A-Za-z0-9]+$/.exec(String(p));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  });
  return max;
}

/** Last path segment: "images/projects/x/01.jpg" -> "01.jpg". */
function basename(p) {
  return String(p).split('/').pop();
}

/** Deep clone plain data (our data is JSON-safe). */
function deepClone(x) {
  return JSON.parse(JSON.stringify(x));
}


/* ============================================================
   APP STATE
   ============================================================ */

var state = {
  mode: null,          // 'fs' | 'guided'
  dirHandle: null,     // FileSystemDirectoryHandle of the portfolio folder
  data: null,          // working copy of PORTFOLIO_DATA
  editing: null,       // { index, images: [...], removed: [...] } while project form open
  pendingProfile: null, // File chosen for profile photo, not yet saved
  guidedTodos: []      // accumulated image-placement instructions (guided mode)
};

var el = {}; // DOM element cache, filled by init()


/* ============================================================
   INIT
   ============================================================ */

function init() {
  [
    'connect-panel', 'guided-panel', 'editor',
    'btn-open-folder', 'connect-error', 'btn-start-guided', 'guided-error',
    'tab-info', 'tab-projects', 'panel-info', 'panel-projects',
    'info-form', 'f-name', 'f-tagline', 'f-school', 'f-year', 'f-bio',
    'f-email', 'f-linkedin', 'f-instagram',
    'f-profile', 'profile-preview', 'profile-preview-empty', 'profile-hint',
    'project-list-view', 'project-list', 'btn-add-project',
    'project-form-view', 'project-form', 'project-form-title',
    'f-p-title', 'f-p-subtitle', 'f-p-year', 'f-p-tags', 'f-p-description',
    'f-p-video', 'f-p-featured',
    'dropzone', 'f-p-images', 'image-strip', 'p-error',
    'btn-save-project', 'btn-cancel-project',
    'guided-output', 'generated-code', 'btn-download', 'btn-copy',
    'copy-confirm', 'file-instructions',
    'toast', 'toast-text', 'toast-open-site', 'toast-close'
  ].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  var hasFS = typeof window.showDirectoryPicker === 'function';

  if (hasFS) {
    el['connect-panel'].hidden = false;
    el['btn-open-folder'].addEventListener('click', connectFolder);
  } else {
    el['guided-panel'].hidden = false;
    el['btn-start-guided'].addEventListener('click', startGuided);
  }

  // Tabs
  el['tab-info'].addEventListener('click', function () { switchTab('info'); });
  el['tab-projects'].addEventListener('click', function () { switchTab('projects'); });

  // My Info form
  el['info-form'].addEventListener('submit', function (e) {
    e.preventDefault();
    saveInfo();
  });
  el['f-profile'].addEventListener('change', function () {
    if (el['f-profile'].files && el['f-profile'].files[0]) {
      state.pendingProfile = el['f-profile'].files[0];
      setProfilePreview(URL.createObjectURL(state.pendingProfile));
      el['profile-hint'].textContent =
        'New photo picked — click "Save my info" to keep it.';
    }
  });

  // Project list / form
  el['btn-add-project'].addEventListener('click', function () { openProjectForm(-1); });
  el['btn-cancel-project'].addEventListener('click', closeProjectForm);
  el['project-form'].addEventListener('submit', function (e) {
    e.preventDefault();
    saveProject();
  });

  // Image drop zone
  el['dropzone'].addEventListener('click', function () { el['f-p-images'].click(); });
  el['dropzone'].addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el['f-p-images'].click();
    }
  });
  el['f-p-images'].addEventListener('change', function () {
    addImageFiles(el['f-p-images'].files);
    el['f-p-images'].value = '';
  });
  ['dragenter', 'dragover'].forEach(function (evt) {
    el['dropzone'].addEventListener(evt, function (e) {
      e.preventDefault();
      el['dropzone'].classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    el['dropzone'].addEventListener(evt, function (e) {
      e.preventDefault();
      el['dropzone'].classList.remove('dragover');
    });
  });
  el['dropzone'].addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) addImageFiles(e.dataTransfer.files);
  });

  // Guided output buttons
  el['btn-download'].addEventListener('click', downloadGeneratedFile);
  el['btn-copy'].addEventListener('click', copyGeneratedFile);

  // Toast
  el['toast-open-site'].addEventListener('click', function () {
    window.open('index.html', '_blank');
  });
  el['toast-close'].addEventListener('click', function () {
    el['toast'].hidden = true;
  });
}

document.addEventListener('DOMContentLoaded', init);


/* ============================================================
   MODE STARTUP
   ============================================================ */

/** Chrome/Edge: pick the portfolio folder and load its data file. */
async function connectFolder() {
  hideError(el['connect-error']);
  var dirHandle;
  try {
    dirHandle = await window.showDirectoryPicker({ mode: 'readwrite', id: 'portfolio-editor' });
  } catch (err) {
    if (err && err.name === 'AbortError') return; // user closed the picker — fine
    showError(el['connect-error'],
      'Hmm, the folder picker didn’t open. Try again, or use Chrome or Edge.');
    return;
  }

  // Verify this really is the portfolio folder: it must contain data/projects.js
  var text;
  try {
    var dataDir = await dirHandle.getDirectoryHandle('data');
    var fileHandle = await dataDir.getFileHandle('projects.js');
    var file = await fileHandle.getFile();
    text = await file.text();
  } catch (err) {
    showError(el['connect-error'],
      'That doesn’t look like the portfolio folder — I couldn’t find ' +
      'data/projects.js inside it. Pick the folder that contains index.html and try again.');
    return;
  }

  var data;
  try {
    data = parsePortfolioData(text);
    if (!isValidPortfolioData(data)) throw new Error('Unexpected shape');
  } catch (err) {
    showError(el['connect-error'],
      'I found data/projects.js but couldn’t read it — it may have a typo ' +
      '(often a missing comma or quote). Fix the file in a text editor, or restore a ' +
      'backup, then try again.');
    return;
  }

  state.mode = 'fs';
  state.dirHandle = dirHandle;
  state.data = data;
  enterEditor();
}

/** Safari/Firefox: use the data that data/projects.js loaded via <script>. */
function startGuided() {
  hideError(el['guided-error']);
  if (typeof window.PORTFOLIO_DATA === 'undefined' || !isValidPortfolioData(window.PORTFOLIO_DATA)) {
    showError(el['guided-error'],
      'I couldn’t find your portfolio data. Make sure admin.html is sitting in the ' +
      'portfolio folder, right next to index.html, and that data/projects.js exists.');
    return;
  }
  state.mode = 'guided';
  state.data = deepClone(window.PORTFOLIO_DATA);
  enterEditor();
}

function enterEditor() {
  el['connect-panel'].hidden = true;
  el['guided-panel'].hidden = true;
  el['editor'].hidden = false;
  renderInfoForm();
  renderProjectList();
  switchTab('projects');
}


/* ============================================================
   TABS
   ============================================================ */

function switchTab(which) {
  var isInfo = which === 'info';
  el['tab-info'].classList.toggle('active', isInfo);
  el['tab-projects'].classList.toggle('active', !isInfo);
  el['tab-info'].setAttribute('aria-selected', String(isInfo));
  el['tab-projects'].setAttribute('aria-selected', String(!isInfo));
  el['panel-info'].hidden = !isInfo;
  el['panel-projects'].hidden = isInfo;
}


/* ============================================================
   MY INFO
   ============================================================ */

function renderInfoForm() {
  var s = state.data.student || {};
  el['f-name'].value = s.name || '';
  el['f-tagline'].value = s.tagline || '';
  el['f-school'].value = s.school || '';
  el['f-year'].value = s.year || '';
  el['f-bio'].value = s.bio || '';
  el['f-email'].value = s.email || '';
  el['f-linkedin'].value = s.linkedin || '';
  el['f-instagram'].value = s.instagram || '';

  if (s.profileImage) {
    if (state.mode === 'fs') {
      loadThumbFromFolder(s.profileImage, function (url) { setProfilePreview(url); });
    } else {
      setProfilePreview(s.profileImage); // relative path works from file://
    }
  }
}

function setProfilePreview(src) {
  el['profile-preview'].innerHTML = '';
  var img = document.createElement('img');
  img.alt = 'Profile photo preview';
  img.src = src;
  img.addEventListener('error', function () {
    el['profile-preview'].innerHTML =
      '<span class="profile-preview-empty">No photo yet</span>';
  });
  el['profile-preview'].appendChild(img);
}

async function saveInfo() {
  var s = state.data.student || (state.data.student = {});
  s.name = el['f-name'].value.trim();
  s.tagline = el['f-tagline'].value.trim();
  s.school = el['f-school'].value.trim();
  s.year = el['f-year'].value.trim();
  s.bio = el['f-bio'].value.trim();
  s.email = el['f-email'].value.trim();
  s.linkedin = el['f-linkedin'].value.trim();
  s.instagram = el['f-instagram'].value.trim();
  if (s.profileImage === undefined) s.profileImage = '';

  if (state.pendingProfile) {
    var ext = extOf(state.pendingProfile.name);
    var newPath = 'images/profile/photo.' + ext;

    if (state.mode === 'fs') {
      try {
        var profileDir = await getDirByPath(state.dirHandle, ['images', 'profile'], true);
        await writeFileTo(profileDir, 'photo.' + ext, state.pendingProfile);
      } catch (err) {
        showToast('I couldn’t save the photo (' + err.name + '). Your other info was still saved.');
      }
    } else {
      addGuidedTodo(
        'Rename <code>' + escapeHtml(state.pendingProfile.name) + '</code> to ' +
        '<code>photo.' + ext + '</code> and put it in <code>images/profile/</code>'
      );
    }
    s.profileImage = newPath;
    state.pendingProfile = null;
    el['profile-hint'].textContent = 'A square-ish photo works best.';
  }

  await persist();
}


/* ============================================================
   PROJECT LIST
   ============================================================ */

function renderProjectList() {
  var list = el['project-list'];
  list.innerHTML = '';
  var projects = state.data.projects;

  if (projects.length === 0) {
    var empty = document.createElement('div');
    empty.className = 'project-list-empty';
    empty.textContent = 'No projects yet — click "+ Add project" to create your first one.';
    list.appendChild(empty);
    return;
  }

  projects.forEach(function (p, i) {
    var row = document.createElement('div');
    row.className = 'project-card-row';

    // Thumbnail (cover = first image)
    var thumb = document.createElement('div');
    thumb.className = 'project-card-thumb';
    if (p.images && p.images.length > 0) {
      var img = document.createElement('img');
      img.alt = '';
      if (state.mode === 'fs') {
        loadThumbFromFolder(p.images[0], function (url) { img.src = url; });
      } else {
        img.src = p.images[0];
      }
      img.addEventListener('error', function () { img.remove(); });
      thumb.appendChild(img);
    }
    row.appendChild(thumb);

    // Info
    var info = document.createElement('div');
    info.className = 'project-card-info';
    var title = document.createElement('div');
    title.className = 'project-card-title';
    title.textContent = p.title || '(untitled)';
    var meta = document.createElement('div');
    meta.className = 'project-card-meta';
    var bits = [];
    if (p.subtitle) bits.push(p.subtitle);
    bits.push((p.images ? p.images.length : 0) + ' image' + ((p.images && p.images.length === 1) ? '' : 's'));
    meta.textContent = bits.join(' · ');
    info.appendChild(title);
    info.appendChild(meta);
    if (p.featured) {
      var star = document.createElement('div');
      star.className = 'project-card-featured';
      star.textContent = '★ Featured';
      info.appendChild(star);
    }
    row.appendChild(info);

    // Actions: up / down / edit / delete
    var actions = document.createElement('div');
    actions.className = 'project-card-actions';

    var up = iconButton('↑', 'Move "' + (p.title || 'project') + '" up', function () { moveProject(i, -1); });
    up.disabled = (i === 0);
    var down = iconButton('↓', 'Move "' + (p.title || 'project') + '" down', function () { moveProject(i, 1); });
    down.disabled = (i === projects.length - 1);

    var edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'text-btn';
    edit.textContent = 'Edit';
    edit.addEventListener('click', function () { openProjectForm(i); });

    var del = iconButton('×', 'Delete "' + (p.title || 'project') + '"', function () { deleteProject(i); });
    del.classList.add('icon-btn-danger');

    actions.appendChild(up);
    actions.appendChild(down);
    actions.appendChild(edit);
    actions.appendChild(del);
    row.appendChild(actions);

    list.appendChild(row);
  });
}

function iconButton(symbol, label, onClick) {
  var b = document.createElement('button');
  b.type = 'button';
  b.className = 'icon-btn';
  b.textContent = symbol;
  b.setAttribute('aria-label', label);
  b.title = label;
  b.addEventListener('click', onClick);
  return b;
}

async function moveProject(i, dir) {
  var arr = state.data.projects;
  var j = i + dir;
  if (j < 0 || j >= arr.length) return;
  var tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
  renderProjectList();
  await persist();
}

async function deleteProject(i) {
  var p = state.data.projects[i];
  var ok = window.confirm(
    'Delete "' + (p.title || 'this project') + '" from your portfolio?\n\n' +
    'Its image files will stay in your images folder, so you can always add it back later.'
  );
  if (!ok) return;
  state.data.projects.splice(i, 1);
  renderProjectList();
  await persist();
}


/* ============================================================
   PROJECT ADD / EDIT FORM
   ============================================================ */

/** Open the form. index = -1 for a brand-new project. */
function openProjectForm(index) {
  var isNew = index === -1;
  var p = isNew
    ? { id: '', title: '', subtitle: '', description: '', tags: [], images: [], video: '', featured: false, year: String(new Date().getFullYear()) }
    : state.data.projects[index];

  state.editing = {
    index: index,
    images: (p.images || []).map(function (path) {
      return { kind: 'existing', path: path };
    }),
    removed: []
  };

  el['project-form-title'].textContent = isNew ? 'Add a project' : 'Edit “' + (p.title || 'project') + '”';
  el['f-p-title'].value = p.title || '';
  el['f-p-subtitle'].value = p.subtitle || '';
  el['f-p-year'].value = p.year || '';
  el['f-p-tags'].value = (p.tags || []).join(', ');
  el['f-p-description'].value = p.description || '';
  el['f-p-video'].value = p.video || '';
  el['f-p-featured'].checked = !!p.featured;
  hideError(el['p-error']);

  renderImageStrip();
  el['project-list-view'].hidden = true;
  el['project-form-view'].hidden = false;
  el['f-p-title'].focus();
}

function closeProjectForm() {
  releaseEditingUrls();
  state.editing = null;
  el['project-form-view'].hidden = true;
  el['project-list-view'].hidden = false;
}

function releaseEditingUrls() {
  if (!state.editing) return;
  state.editing.images.forEach(function (im) {
    if (im.url) URL.revokeObjectURL(im.url);
  });
}

function addImageFiles(fileList) {
  if (!state.editing) return;
  var accepted = ['image/jpeg', 'image/png', 'image/webp'];
  var skipped = 0;
  Array.prototype.forEach.call(fileList, function (f) {
    if (accepted.indexOf(f.type) === -1) { skipped++; return; }
    state.editing.images.push({ kind: 'new', file: f, url: URL.createObjectURL(f) });
  });
  if (skipped > 0) {
    showError(el['p-error'],
      skipped + ' file' + (skipped === 1 ? ' was' : 's were') +
      ' skipped — only JPEG, PNG, and WebP images work here.');
  } else {
    hideError(el['p-error']);
  }
  renderImageStrip();
}

function renderImageStrip() {
  var strip = el['image-strip'];
  strip.innerHTML = '';
  if (!state.editing) return;

  state.editing.images.forEach(function (im, i) {
    var tile = document.createElement('div');
    tile.className = 'image-tile';

    var img = document.createElement('img');
    img.className = 'image-tile-img';
    img.alt = '';
    if (im.kind === 'new') {
      img.src = im.url;
    } else if (state.mode === 'fs') {
      if (im.url) {
        img.src = im.url;
      } else {
        loadThumbFromFolder(im.path, function (url) {
          im.url = url;
          img.src = url;
        });
      }
    } else {
      img.src = im.path;
    }
    tile.appendChild(img);

    if (i === 0) {
      var badge = document.createElement('span');
      badge.className = 'image-tile-badge';
      badge.textContent = 'Cover';
      tile.appendChild(badge);
    }
    if (im.kind === 'new') {
      var flag = document.createElement('span');
      flag.className = 'image-tile-new';
      flag.textContent = 'New';
      tile.appendChild(flag);
    }

    var controls = document.createElement('div');
    controls.className = 'image-tile-controls';

    var left = iconButton('←', 'Move image earlier', function () { moveImage(i, -1); });
    left.disabled = (i === 0);
    var right = iconButton('→', 'Move image later', function () { moveImage(i, 1); });
    right.disabled = (i === state.editing.images.length - 1);
    var remove = iconButton('×', 'Remove image', function () { removeImage(i); });
    remove.classList.add('icon-btn-danger');

    controls.appendChild(left);
    controls.appendChild(right);
    controls.appendChild(remove);
    tile.appendChild(controls);

    strip.appendChild(tile);
  });
}

function moveImage(i, dir) {
  var arr = state.editing.images;
  var j = i + dir;
  if (j < 0 || j >= arr.length) return;
  var tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
  renderImageStrip();
}

function removeImage(i) {
  var im = state.editing.images[i];
  if (im.kind === 'existing') {
    state.editing.removed.push(im.path);
  } else if (im.url) {
    URL.revokeObjectURL(im.url);
  }
  state.editing.images.splice(i, 1);
  renderImageStrip();
}

async function saveProject() {
  hideError(el['p-error']);

  var title = el['f-p-title'].value.trim();
  if (!title) {
    showError(el['p-error'], 'Give your project a title first — that’s the only must-have.');
    el['f-p-title'].focus();
    return;
  }

  var isNew = state.editing.index === -1;
  var project = isNew ? {} : state.data.projects[state.editing.index];

  // Keep existing ids stable so image folders don't go stale.
  if (isNew || !project.id) {
    var existingIds = state.data.projects.map(function (p) { return p.id; });
    project.id = uniqueId(slugify(title), existingIds);
  }

  project.title = title;
  project.subtitle = el['f-p-subtitle'].value.trim();
  project.year = el['f-p-year'].value.trim();
  project.description = el['f-p-description'].value.trim();
  project.video = el['f-p-video'].value.trim();
  project.featured = el['f-p-featured'].checked;
  project.tags = el['f-p-tags'].value
    .split(',')
    .map(function (t) { return t.trim(); })
    .filter(function (t) { return t.length > 0; });

  // ---- Images ----
  var keptPaths = state.editing.images
    .filter(function (im) { return im.kind === 'existing'; })
    .map(function (im) { return im.path; });
  var newImages = state.editing.images.filter(function (im) { return im.kind === 'new'; });
  var folder = 'images/projects/' + project.id;

  // Number new files after everything already in play (kept + removed),
  // so we never overwrite an existing file.
  var nextNum = maxImageNumber(keptPaths.concat(state.editing.removed)) + 1;

  var btn = el['btn-save-project'];
  btn.disabled = true;
  btn.textContent = 'Saving…';

  try {
    if (state.mode === 'fs') {
      var projDir = null;
      if (newImages.length > 0 || state.editing.removed.length > 0) {
        projDir = await getDirByPath(state.dirHandle, ['images', 'projects', project.id], true);
      }

      // Also scan the folder itself for stray numbered files, to be extra safe.
      if (projDir && newImages.length > 0) {
        var onDisk = [];
        for await (var entry of projDir.values()) {
          if (entry.kind === 'file') onDisk.push(entry.name);
        }
        nextNum = Math.max(nextNum, maxImageNumber(onDisk) + 1);
      }

      // Write new images: 01.jpg, 02.png, ... continuing the sequence.
      for (var k = 0; k < newImages.length; k++) {
        var name = pad2(nextNum + k) + '.' + extOf(newImages[k].file.name);
        await writeFileTo(projDir, name, newImages[k].file);
        newImages[k].savedPath = folder + '/' + name;
      }

      // Tidy up: delete files the student removed in the editor.
      for (var r = 0; r < state.editing.removed.length; r++) {
        try {
          await projDir.removeEntry(basename(state.editing.removed[r]));
        } catch (e) { /* already gone — fine */ }
      }
    } else {
      // Guided mode: assign names and write instructions instead.
      newImages.forEach(function (im, k) {
        var name = pad2(nextNum + k) + '.' + extOf(im.file.name);
        im.savedPath = folder + '/' + name;
        addGuidedTodo(
          'Rename <code>' + escapeHtml(im.file.name) + '</code> to <code>' + name +
          '</code> and put it in <code>' + folder + '/</code>' +
          ' <span class="optional">(create the folder if it doesn’t exist)</span>'
        );
      });
      state.editing.removed.forEach(function (path) {
        addGuidedTodo('You can delete <code>' + escapeHtml(path) + '</code> — it’s no longer used.');
      });
    }

    // Final ordered image list: exactly the order shown in the strip.
    project.images = state.editing.images.map(function (im) {
      return im.kind === 'existing' ? im.path : im.savedPath;
    });

    if (isNew) state.data.projects.unshift(project);

    await persist();
    closeProjectForm();
    renderProjectList();
  } catch (err) {
    showError(el['p-error'],
      'Something went wrong while saving (' + (err && err.name ? err.name : 'unknown error') +
      '). Nothing was lost — try clicking Save again.');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save project';
  }
}


/* ============================================================
   PERSISTENCE
   ============================================================ */

/** Write data/projects.js (fs mode) or refresh the guided output. */
async function persist() {
  var text = serializePortfolioData(state.data);

  if (state.mode === 'fs') {
    var dataDir = await state.dirHandle.getDirectoryHandle('data', { create: true });
    await writeFileTo(dataDir, 'projects.js', new Blob([text], { type: 'text/javascript' }));
    showToast('Saved. Refresh index.html to see your changes.');
  } else {
    el['generated-code'].value = text;
    renderGuidedTodos();
    el['guided-output'].hidden = false;
    el['guided-output'].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function addGuidedTodo(html) {
  if (state.guidedTodos.indexOf(html) === -1) state.guidedTodos.push(html);
}

function renderGuidedTodos() {
  var ul = el['file-instructions'];
  ul.innerHTML = '';
  if (state.guidedTodos.length === 0) {
    var li = document.createElement('li');
    li.className = 'all-done';
    li.textContent = 'No image files to move — replacing data/projects.js is all you need to do.';
    ul.appendChild(li);
    return;
  }
  state.guidedTodos.forEach(function (html) {
    var li = document.createElement('li');
    li.innerHTML = html;
    ul.appendChild(li);
  });
}

function downloadGeneratedFile() {
  var blob = new Blob([el['generated-code'].value], { type: 'text/javascript' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'projects.js';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
}

function copyGeneratedFile() {
  var text = el['generated-code'].value;
  var done = function () {
    el['copy-confirm'].hidden = false;
    setTimeout(function () { el['copy-confirm'].hidden = true; }, 2500);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
  } else {
    legacyCopy(text, done);
  }
}

function legacyCopy(text, done) {
  el['generated-code'].focus();
  el['generated-code'].select();
  try { document.execCommand('copy'); } catch (e) { /* selection stays for manual copy */ }
  done();
}


/* ============================================================
   FILE SYSTEM HELPERS (fs mode only)
   ============================================================ */

/** Walk (and optionally create) nested directories: ['images','projects','x']. */
async function getDirByPath(root, parts, create) {
  var h = root;
  for (var i = 0; i < parts.length; i++) {
    h = await h.getDirectoryHandle(parts[i], { create: !!create });
  }
  return h;
}

/** Write a Blob/File into a directory under the given name. */
async function writeFileTo(dirHandle, name, blob) {
  var fh = await dirHandle.getFileHandle(name, { create: true });
  var writable = await fh.createWritable();
  await writable.write(blob);
  await writable.close();
}

/**
 * Load a thumbnail for an image path like "images/projects/x/01.jpg"
 * from the picked folder. Calls cb(objectURL) on success; falls back
 * to the relative path (works because admin.html lives in the folder).
 */
function loadThumbFromFolder(path, cb) {
  (async function () {
    try {
      var parts = String(path).split('/');
      var name = parts.pop();
      var dir = await getDirByPath(state.dirHandle, parts, false);
      var fh = await dir.getFileHandle(name);
      var file = await fh.getFile();
      cb(URL.createObjectURL(file));
    } catch (e) {
      cb(path); // best-effort fallback
    }
  })();
}


/* ============================================================
   SMALL UI HELPERS
   ============================================================ */

var toastTimer = null;

function showToast(message) {
  el['toast-text'].textContent = message;
  el['toast'].hidden = false;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el['toast'].hidden = true; }, 8000);
}

function showError(node, message) {
  node.textContent = message;
  node.hidden = false;
}

function hideError(node) {
  node.textContent = '';
  node.hidden = true;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
