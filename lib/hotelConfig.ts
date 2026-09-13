export const hotelConfig = {
  room: "110",
  wifi: { network: "Room Eleven", password: "welcometozero" },
  department: "Housekeeping",
} as const;

export const description = "ZERO is a working AI hotel operator prototype that lets hotel guests press 0 and speak naturally to an AI operator.";

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
