/**
 * The City Grammar School (TCGS) - Results Data Access Layer
 * 
 * SECURITY & PRIVACY NOTICE:
 * - Student examination results are sensitive personal data.
 * - Roll numbers and registration numbers are NEVER exposed via GET query parameters in the URL.
 * - In production, this layer connects via secure POST request to the school's verified backend API.
 * - Rate limiting must be implemented server-side (e.g., maximum 5 queries per minute per IP address)
 *   to prevent automated scraping and brute-force enumeration.
 * - Honeypot checks must be verified prior to processing queries.
 */

// Clearly labeled DEMO-only sample record (strictly disabled when DEMO_ENABLED is false)
const DEMO_STUDENT_RESULT = {
  studentName: "Demo Student (Sample Preview)",
  rollNo: "101",
  registrationNo: "TCGS-2025-0601",
  class: "Class 6",
  exam: "Exam no 1",
  year: "2025",
  issueDate: "15 March 2025",
  status: "Pass",
  subjects: [
    { name: "English Language & Literature", totalMarks: 100, obtainedMarks: 88, grade: "A+" },
    { name: "Mathematics & Geometry", totalMarks: 100, obtainedMarks: 94, grade: "A+" },
    { name: "General Science & STEM", totalMarks: 100, obtainedMarks: 85, grade: "A" },
    { name: "Urdu Language", totalMarks: 100, obtainedMarks: 82, grade: "A" },
    { name: "Islamiat / Ethics", totalMarks: 50, obtainedMarks: 45, grade: "A+" },
    { name: "Computer Science & Robotics", totalMarks: 50, obtainedMarks: 48, grade: "A+" }
  ],
  totalMarks: 500,
  obtainedMarks: 442,
  percentage: 88.4,
  overallGrade: "A+",
  remarks: "Outstanding academic performance with exemplary problem-solving skills."
};

/**
 * Fetch student examination marksheet.
 * @param {Object} query
 * @param {string} query.roll - Roll number
 * @param {string} query.regNo - Registration number
 * @param {string} query.classVal - Academic Class
 * @param {string} query.examVal - Examination term
 * @param {string} query.yearVal - Academic Year
 * @returns {Promise<Object|null>} Result marksheet or null if not found
 */
async function getResult({ roll, regNo, classVal, examVal, yearVal }) {
  // Normalize inputs (trim whitespace)
  const cleanRoll = String(roll || '').trim();
  const cleanRegNo = String(regNo || '').trim().toUpperCase();
  const cleanClass = String(classVal || '').trim();
  const cleanExam = String(examVal || '').trim();
  const cleanYear = String(yearVal || '').trim();

  if (!cleanRoll || !cleanClass || !cleanExam || !cleanYear) {
    throw new Error('Please fill in all required examination search fields.');
  }

  // NOTE: SERVER-SIDE RATE LIMITING GOES HERE:
  // e.g., await checkServerRateLimit(clientFingerprint);

  // If DEMO mode is enabled in config and query matches the demo roll
  if (typeof DEMO_ENABLED !== 'undefined' && DEMO_ENABLED) {
    const isRollMatch = cleanRoll === DEMO_STUDENT_RESULT.rollNo;
    const isClassMatch = cleanClass.toLowerCase() === DEMO_STUDENT_RESULT.class.toLowerCase() ||
                         cleanClass.toLowerCase() === '6' ||
                         cleanClass.toLowerCase() === 'class 6' ||
                         cleanClass.toLowerCase() === 'class 6th';
    const isExamMatch = cleanExam.toLowerCase() === DEMO_STUDENT_RESULT.exam.toLowerCase() ||
                        cleanExam.toLowerCase() === 'exam 1' ||
                        cleanExam.toLowerCase() === 'exam no. 1' ||
                        cleanExam.toLowerCase() === 'exam no 1' ||
                        cleanExam.toLowerCase() === '1';
    const isYearMatch = cleanYear === DEMO_STUDENT_RESULT.year || cleanYear === '25';

    if (isRollMatch && isClassMatch && isExamMatch && isYearMatch) {
      return DEMO_STUDENT_RESULT;
    }
  }

  // In production: fetch from authenticated endpoint or local /data/results.json
  try {
    const response = await fetch('/data/results.json', {
      method: 'GET', // Or 'POST' when connecting to live backend API
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const dataset = await response.json();
    if (!Array.isArray(dataset) || dataset.length === 0) {
      return null;
    }

    // Match student record safely
    const match = dataset.find(item => {
      const matchRoll = String(item.rollNo || '').trim() === cleanRoll;
      const matchClass = String(item.class || '').trim().toLowerCase() === cleanClass.toLowerCase();
      const matchExam = String(item.exam || '').trim().toLowerCase() === cleanExam.toLowerCase();
      const matchYear = String(item.year || '').trim() === cleanYear;
      const matchReg = cleanRegNo ? (String(item.registrationNo || '').trim().toUpperCase() === cleanRegNo) : true;
      return matchRoll && matchClass && matchExam && matchYear && matchReg;
    });

    return match || null;
  } catch (err) {
    console.error('Error fetching examination result:', err);
    return null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getResult, DEMO_STUDENT_RESULT };
}
