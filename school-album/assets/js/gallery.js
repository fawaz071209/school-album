// assets/js/gallery.js
//
// Renders the grid of student cards and wires up search + modal opening.
// Uses event delegation (ONE listener on the grid) instead of one
// listener per card, so it stays fast even with hundreds of students.

import { students, searchStudents, getStudentById } from './students-data.js';
import { openModal } from './modal.js';

const gallery = document.getElementById('studentGallery');
const searchInput = document.getElementById('searchInput');
const resultsCount = document.getElementById('resultsCount');

function cardHTML(student) {
  return `
    <div class="student-card">
      <a class="student-link" href="?student=${student.id}" data-id="${student.id}" aria-label="View ${student.name} portfolio">
        <div class="student-image">
          <img src="${student.image}" alt="${student.name}" loading="lazy">
        </div>
        <h3 class="student-name">${student.name}</h3>
      </a>
    </div>
  `;
}

function render(list) {
  gallery.innerHTML = list.map(cardHTML).join('');
  if (resultsCount) {
    resultsCount.textContent = list.length === students.length
      ? `${students.length} students`
      : `${list.length} of ${students.length} students`;
  }
}

// Event delegation: one listener handles clicks for every current
// and future card, no matter how many students are rendered.
gallery.addEventListener('click', (e) => {
  const link = e.target.closest('.student-link');
  if (!link) return;
  e.preventDefault(); // open modal instead of navigating away
  const student = getStudentById(link.dataset.id);
  openModal(student);
});

searchInput?.addEventListener('input', (e) => {
  render(searchStudents(e.target.value));
});

export function initGallery() {
  render(students);

  // Deep-link support: visiting index.html?student=5 (or sharing that
  // link) opens the modal for that student immediately on load.
  const params = new URLSearchParams(location.search);
  if (params.has('student')) {
    const student = getStudentById(params.get('student'));
    if (student) openModal(student, { updateUrl: false });
  }
}
