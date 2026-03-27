export function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - timezoneOffset * 60_000);
  return adjusted.toISOString().slice(0, 16);
}

export function toIsoDateTimeOrNull(value: string) {
  if (!value) {
    return null;
  }

  return new Date(value).toISOString();
}

export function formatEventLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (segment) => segment.toUpperCase());
}
