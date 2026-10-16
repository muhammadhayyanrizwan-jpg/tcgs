/**
 * The City Grammar School (TCGS) - Portal & Website Configuration
 * Centralized config for classes, exam sessions, academic years, and social endpoints.
 */

// Instagram URL config - if empty (""), Instagram icon is automatically hidden across the site
const INSTAGRAM_URL = "";

// School founding year (Established 1992)
const ESTABLISHED_YEAR = 1992;

// Newsletter subscription endpoint (front-end only mock or live API)
const NEWSLETTER_ENDPOINT = "";

// Examination Portal Dropdown Options
// Seeded with authentic example values; easily extensible
const CLASSES = [
  "Class 6"
];

const EXAMS = [
  "Exam no 1"
];

const YEARS = [
  "2025"
];

// Demo sample mode (strictly disabled in production)
const DEMO_ENABLED = false;

// Export for module or browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    INSTAGRAM_URL,
    ESTABLISHED_YEAR,
    NEWSLETTER_ENDPOINT,
    CLASSES,
    EXAMS,
    YEARS,
    DEMO_ENABLED
  };
}
