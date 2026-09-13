import { hotelConfig } from "./hotelConfig";
import type { ServiceRequest, TranscriptEntry } from "./types";

/** Simulated dispatch only. Validate every model-supplied parameter at the boundary. */
export function createServiceRequest(parameters: unknown): ServiceRequest {
  if (!parameters || typeof parameters !== "object") throw new Error("Service request details are required.");
  const p = parameters as Record<string, unknown>;
  if (p.room !== hotelConfig.room) throw new Error("This demonstration only supports Room 110.");
  if (p.requestType !== "amenity_request") throw new Error("Only amenity requests are supported.");
  if (p.item !== "extra_towels" && p.item !== "bottled_water") throw new Error("Only extra towels and bottled water are supported.");
  if (typeof p.quantity !== "number" || !Number.isSafeInteger(p.quantity) || p.quantity <= 0) throw new Error("Ask the guest for a positive whole-number quantity before creating the request.");
  if (p.department !== hotelConfig.department) throw new Error("Amenity requests go to Housekeeping.");
  return { room: hotelConfig.room, requestType: "amenity_request", item: p.item, quantity: p.quantity, department: hotelConfig.department, status: "created" };
}

// A question alone is never treated as resolved. Record only the known answer in an agent event.
export function hasWifiResponse(messages: TranscriptEntry[]): boolean {
  return messages.some(message => message.role === "agent" &&
    (message.text.includes(hotelConfig.wifi.password) || message.text.includes(hotelConfig.wifi.network)));
}
