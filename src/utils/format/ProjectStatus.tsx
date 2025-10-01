// utils/statusFormatter.ts
export function formatStatus(status?: string) {
  if (!status) return "---";
  switch (status.toUpperCase()) {
    case "UAT":
      return "uat";
    case "PRODUCTION":
      return "Production";
    default:
      return status;
  }
}
