export const UNDERGRADUATE_YEARS = ["Freshman", "Sophomore", "Junior", "Senior"];
export const GRADUATION_TERMS = ["Spring", "Summer", "Fall"];

export function isUndergraduateYear(year) {
  return UNDERGRADUATE_YEARS.includes(year);
}

export function getGraduationYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 9 }, (_, index) => currentYear + index);
}

export function formatExpectedGraduation(profile) {
  if (!profile?.expected_graduation_term || !profile?.expected_graduation_year) {
    return "Not set";
  }

  return `${profile.expected_graduation_term} ${profile.expected_graduation_year}`;
}
