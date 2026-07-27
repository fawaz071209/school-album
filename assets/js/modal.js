// assets/js/modal.js
//
// A single, reusable modal element that gets its content swapped per
// student. Built once and reused for every click — fast, no re-render
// of the whole page, no library needed.

let modalEl = null;
let lastFocusedEl = null;

function buildModal() {
  const el = document.createElement('div');
  el.className = 'modal-overlay';
  el.innerHTML = `
    <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalName" tabindex="-1">
      <button class="modal-close" type="button" aria-label="Close">&times;</button>
      <div class="modal-hero">
        <div class="modal-image-wrap">
          <img class="modal-image" src="" alt="">
        </div>
        <div class="modal-details">
          <p class="modal-label">Student Portfolio</p>
          <h2 id="modalName"></h2>
          <p class="modal-role"></p>
          <div class="modal-meta">
            <span class="modal-course"></span>
            <span class="modal-email"></span>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <h3>About</h3>
        <p class="modal-bio"></p>
      </div>
      <div class="modal-body modal-personal">
        <h3>In Their Own Words</h3>
        <dl class="personal-grid">
          <div><dt>Best friend</dt><dd class="pd-bestFriend"></dd></div>
          <div><dt>Best subject</dt><dd class="pd-bestSubject"></dd></div>
          <div><dt>Motivational quote</dt><dd class="pd-quote"></dd></div>
          <div><dt>University plans</dt><dd class="pd-universityGoal"></dd></div>
          <div><dt>Teacher they'll miss</dt><dd class="pd-teacherMiss"></dd></div>
          <div><dt>What they'll miss about Seylek</dt><dd class="pd-whatMiss"></dd></div>
        </dl>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  // Click outside the card closes it
  el.addEventListener('click', (e) => {
    if (e.target === el) closeModal();
  });
  el.querySelector('.modal-close').addEventListener('click', () => closeModal());

  return el;
}

export function openModal(student, { updateUrl = true } = {}) {
  if (!student) return;
  if (!modalEl) modalEl = buildModal();

  modalEl.querySelector('.modal-image').src = student.image;
  modalEl.querySelector('.modal-image').alt = student.name;
  modalEl.querySelector('#modalName').textContent = student.name;
  modalEl.querySelector('.modal-role').textContent = student.title;
  modalEl.querySelector('.modal-course').textContent = student.course;
  modalEl.querySelector('.modal-email').textContent = student.email;
  modalEl.querySelector('.modal-bio').textContent = student.bio;

  modalEl.querySelector('.pd-bestFriend').textContent = student.bestFriend;
  modalEl.querySelector('.pd-bestSubject').textContent = student.bestSubject;
  modalEl.querySelector('.pd-quote').textContent = student.quote;
  modalEl.querySelector('.pd-universityGoal').textContent = student.universityGoal;
  modalEl.querySelector('.pd-teacherMiss').textContent = student.teacherMiss;
  modalEl.querySelector('.pd-whatMiss').textContent = student.whatMiss;

  lastFocusedEl = document.activeElement;
  modalEl.classList.add('open');
  document.body.classList.add('modal-open');
  modalEl.querySelector('.modal-card').focus();

  if (updateUrl) {
    const url = new URL(location.href);
    url.searchParams.set('student', student.id);
    history.pushState({ studentId: student.id }, '', url);
  }
}

export function closeModal({ updateUrl = true } = {}) {
  if (!modalEl || !modalEl.classList.contains('open')) return;
  modalEl.classList.remove('open');
  document.body.classList.remove('modal-open');
  lastFocusedEl?.focus?.();

  if (updateUrl) {
    const url = new URL(location.href);
    if (url.searchParams.has('student')) {
      url.searchParams.delete('student');
      history.pushState({}, '', url);
    }
  }
}

export function isModalOpen() {
  return !!modalEl?.classList.contains('open');
}

// Global keyboard + history handling (registered once)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

window.addEventListener('popstate', () => {
  const params = new URLSearchParams(location.search);
  if (!params.has('student')) {
    closeModal({ updateUrl: false });
  }
});
