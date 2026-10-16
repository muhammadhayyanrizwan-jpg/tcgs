/**
 * The City Grammar School (TCGS) - Results Portal UI Controller
 * Handles form validation, dynamic config dropdowns, skeleton loader,
 * paper marksheet rendering, print action, and sessionStorage prefill.
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resultSearchForm');
  const classInput = document.getElementById('classInput');
  const examInput = document.getElementById('examInput');
  const yearInput = document.getElementById('yearInput');
  const skeleton = document.getElementById('resultSkeleton');
  const notFoundCard = document.getElementById('resultNotFound');
  const marksheetContainer = document.getElementById('resultMarksheet');
  const printBtn = document.getElementById('btnPrintMarksheet');
  const newSearchBtn = document.getElementById('btnNewSearch');
  const tryAgainBtn = document.getElementById('btnTryAgain');

  // Reset UI Views
  function showFormView() {
    form.style.display = 'block';
    skeleton.style.display = 'none';
    notFoundCard.style.display = 'none';
    marksheetContainer.style.display = 'none';
  }

  function showLoadingView() {
    form.style.display = 'none';
    notFoundCard.style.display = 'none';
    marksheetContainer.style.display = 'none';
    skeleton.style.display = 'flex';
  }

  function showNotFoundView() {
    form.style.display = 'none';
    skeleton.style.display = 'none';
    marksheetContainer.style.display = 'none';
    notFoundCard.style.display = 'block';
  }

  function showMarksheetView(data) {
    form.style.display = 'none';
    skeleton.style.display = 'none';
    notFoundCard.style.display = 'none';

    // Populate Student Data
    document.getElementById('msStudentName').textContent = data.studentName || 'Student';
    document.getElementById('msRollNo').textContent = data.rollNo || '-';
    document.getElementById('msRegNo').textContent = data.registrationNo || '-';
    document.getElementById('msClass').textContent = data.class || '-';
    document.getElementById('msExam').textContent = data.exam || '-';
    document.getElementById('msYear').textContent = data.year || '-';

    const statusBadge = document.getElementById('msStatusBadge');
    if (statusBadge) {
      const isPass = (data.status || 'Pass').toLowerCase() === 'pass';
      statusBadge.textContent = isPass ? 'Status: PASS' : 'Status: FAIL';
      statusBadge.className = isPass ? 'marksheet-status-badge pass' : 'marksheet-status-badge fail';
    }

    // Populate Subjects Table
    const tbody = document.getElementById('msSubjectRows');
    if (tbody && Array.isArray(data.subjects)) {
      tbody.innerHTML = '';
      data.subjects.forEach(sub => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${sub.name}</td>
          <td class="num-col">${sub.totalMarks}</td>
          <td class="num-col font-bold">${sub.obtainedMarks}</td>
          <td class="num-col">${sub.grade || '-'}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    // Populate Totals
    document.getElementById('msTotalMarks').textContent = data.totalMarks || '-';
    document.getElementById('msObtainedMarks').textContent = data.obtainedMarks || '-';
    document.getElementById('msPercentage').textContent = (data.percentage ? data.percentage + '%' : '-');
    document.getElementById('msOverallGrade').textContent = data.overallGrade || '-';

    marksheetContainer.style.display = 'block';
    marksheetContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Handle Form Submission
  async function handleSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    // Honeypot security verification
    const hp = document.getElementById('website_hp');
    if (hp && hp.value) {
      console.warn('Bot detected via honeypot.');
      return;
    }

    const roll = document.getElementById('rollInput').value.trim();
    const regNo = document.getElementById('regInput').value.trim();
    const classVal = classInput ? classInput.value.trim() : '';
    const examVal = examInput ? examInput.value.trim() : '';
    const yearVal = yearInput ? yearInput.value.trim() : '';

    if (!roll || !classVal || !examVal || !yearVal) {
      alert('Please fill in Roll No, Class, Exam, and Year to look up your result.');
      return;
    }

    showLoadingView();

    try {
      // Artificial slight delay for realistic, smooth skeleton transition
      await new Promise(r => setTimeout(r, 650));
      const result = await getResult({ roll, regNo, classVal, examVal, yearVal });

      if (result) {
        showMarksheetView(result);
      } else {
        showNotFoundView();
      }
    } catch (err) {
      console.error(err);
      showNotFoundView();
    }
  }

  if (form) {
    form.addEventListener('submit', handleSubmit);
  }

  if (tryAgainBtn) {
    tryAgainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showFormView();
    });
  }

  if (newSearchBtn) {
    newSearchBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showFormView();
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Auto-Prefill from Home Quick-Check Band (via sessionStorage)
  try {
    const quickDataStr = sessionStorage.getItem('tcgs_quick_check');
    if (quickDataStr) {
      const quick = JSON.parse(quickDataStr);
      sessionStorage.removeItem('tcgs_quick_check');

      if (quick.roll) {
        document.getElementById('rollInput').value = quick.roll;
      }
      if (quick.classVal && classInput) {
        classInput.value = quick.classVal;
      }
      if (quick.yearVal && yearInput) {
        yearInput.value = quick.yearVal;
      }
      if (examInput && typeof EXAMS !== 'undefined' && EXAMS.length > 0) {
        examInput.value = EXAMS[0];
      }

      // Auto submit if all required values are populated
      if (quick.roll && quick.classVal && quick.yearVal) {
        handleSubmit();
      }
    }
  } catch (err) {
    console.error('SessionStorage error:', err);
  }
});
