export const COURSE_OPTIONS = [
  {
    value: "Computer Engineering",
    label: "Computer Engineering",
    years: [1, 2, 3, 4],
  },
  {
    value: "Information Technology",
    label: "Information Technology",
    years: [1, 2, 3, 4],
  },
  {
    value: "Artificial Intelligence & Data Science",
    label: "Artificial Intelligence & Data Science",
    years: [1, 2, 3, 4],
  },
  {
    value: "Electronics & Telecommunication",
    label: "Electronics & Telecommunication",
    years: [1, 2, 3, 4],
  },
  {
    value: "Mechanical Engineering",
    label: "Mechanical Engineering",
    years: [1, 2, 3, 4],
  },
  {
    value: "Civil Engineering",
    label: "Civil Engineering",
    years: [1, 2, 3, 4],
  },
  {
    value: "BCA",
    label: "BCA",
    years: [1, 2, 3],
  },
  {
    value: "BBA",
    label: "BBA",
    years: [1, 2, 3],
  },
  {
    value: "MCA",
    label: "MCA",
    years: [1, 2],
  },
  {
    value: "MBA",
    label: "MBA",
    years: [1, 2],
  },
];

const hasText = (value) => typeof value === "string" && value.trim().length > 0;

const hasValue = (value) =>
  value !== null &&
  value !== undefined &&
  String(value).trim().length > 0;

const hasSkills = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => hasText(item));
  }

  if (typeof value === "string") {
    return value
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean).length > 0;
  }

  return false;
};

export const getCourseYearOptions = (course) => {
  const selectedCourse = COURSE_OPTIONS.find((item) => item.value === course);
  return selectedCourse?.years || [];
};

export const getYearLabel = (year) => {
  if (!hasValue(year)) return "";
  return `Year ${year}`;
};

export const normalizeSkillsInput = (value) =>
  value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const skillsToInputValue = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).join(" ");
  }

  return typeof value === "string" ? value.trim() : "";
};

export const normalizeUrlInput = (value) => {
  if (!hasText(value)) return "";

  const trimmedValue = value.trim();
  if (/^https?:\/\//i.test(trimmedValue)) {
    return trimmedValue;
  }

  return `https://${trimmedValue}`;
};

const PROFILE_COMPLETION_FIELDS = [
  {
    key: "name",
    label: "Full name",
    isFilled: (profile) => hasText(profile?.name),
  },
  {
    key: "bio",
    label: "Bio",
    isFilled: (profile) => hasText(profile?.bio),
  },
  {
    key: "branch",
    label: "Course",
    isFilled: (profile) => hasText(profile?.branch),
  },
  {
    key: "year",
    label: "Year",
    isFilled: (profile) => {
      const yearOptions = getCourseYearOptions(profile?.branch);
      const numericYear = Number(profile?.year);

      if (!Number.isFinite(numericYear)) {
        return false;
      }

      return yearOptions.length === 0 || yearOptions.includes(numericYear);
    },
  },
  {
    key: "sapId",
    label: "SAP ID",
    isFilled: (profile) => hasValue(profile?.sapId),
  },
  {
    key: "skills",
    label: "Skills",
    isFilled: (profile) => hasSkills(profile?.skills),
  },
  {
    key: "githubUrl",
    label: "GitHub URL",
    isFilled: (profile) => hasText(profile?.githubUrl),
  },
  {
    key: "linkedinUrl",
    label: "LinkedIn URL",
    isFilled: (profile) => hasText(profile?.linkedinUrl),
  },
  {
    key: "resumeUrl",
    label: "Resume URL",
    isFilled: (profile) => hasText(profile?.resumeUrl),
  },
];

export const getProfileCompletion = (profile) => {
  const completedFields = PROFILE_COMPLETION_FIELDS.filter((field) =>
    field.isFilled(profile)
  );
  const missingFields = PROFILE_COMPLETION_FIELDS.filter(
    (field) => !field.isFilled(profile)
  ).map((field) => field.label);
  const totalFields = PROFILE_COMPLETION_FIELDS.length;
  const percentage = totalFields
    ? Math.round((completedFields.length / totalFields) * 100)
    : 0;

  return {
    completedFields: completedFields.length,
    totalFields,
    percentage,
    missingFields,
  };
};
