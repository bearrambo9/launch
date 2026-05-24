export const PROJECT_NAME_REGEX = /^[a-z][a-z0-9-]*[a-z0-9]$|^[a-z]$/;

export function validateProjectName(name: string): string | null {
  if (name.length < 3) return "Name must be at least 3 characters.";
  if (name.length > 50) return "Name must be 50 characters or fewer.";
  if (!PROJECT_NAME_REGEX.test(name)) return "Invalid format.";
  return null;
}
