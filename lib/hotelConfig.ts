export const hotelConfig = {
  room: "110",
  wifi: { network: "Room Eleven", password: "welcometozero" },
  department: "Housekeeping",
} as const;

export const description = "ZERO is a prototype exploring how an AI hotel operator can answer guest calls, understand requests, provide information and coordinate simple service requests.";

export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
}
