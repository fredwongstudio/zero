import test from "node:test";
import assert from "node:assert/strict";
import { createServiceRequest, hasWifiResponse } from "../lib/serviceRequests";

const towels = { room: "110", requestType: "amenity_request", item: "extra_towels", quantity: 2, department: "Housekeeping" };

test("supported amenities create only a simulated request for the known room", () => {
  assert.deepEqual(createServiceRequest(towels), { ...towels, status: "created" });
  assert.equal(createServiceRequest({ ...towels, item: "bottled_water" }).item, "bottled_water");
});

test("missing, fractional, negative and model-invented quantities cannot become completed requests", () => {
  for (const quantity of [undefined, null, "two", "2", 0, -2, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
    assert.throws(() => createServiceRequest({ ...towels, quantity }), /quantity/);
  }
});

test("model parameters cannot dispatch to another room, department or unsupported service", () => {
  for (const value of [null, {}, { ...towels, room: "1209" }, { ...towels, item: "room_service" }, { ...towels, department: "Restaurant" }, { ...towels, requestType: "reservation" }]) {
    assert.throws(() => createServiceRequest(value));
  }
});

test("Wi-Fi is resolved from an operator answer, never from the guest question or an empty call", () => {
  assert.equal(hasWifiResponse([]), false);
  assert.equal(hasWifiResponse([{ role: "user", text: "Is the password welcometozero?" }]), false);
  assert.equal(hasWifiResponse([{ role: "agent", text: "How may I assist you?" }]), false);
  assert.equal(hasWifiResponse([{ role: "agent", text: "The network is Room Eleven and the password is welcometozero." }]), true);
});
