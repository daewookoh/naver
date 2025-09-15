export function formatDateOrTime(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit"
  });

  if (date.toLocaleDateString() === now.toLocaleDateString()) {
    return timeFormatter.format(date);
  } else {
    return dateFormatter.format(date);
  }
}

export function formatDateYear(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });

  return dateFormatter.format(date);
}
