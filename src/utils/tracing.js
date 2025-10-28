import { v4 as uuidv4 } from "uuid";

// Generate a rotating beacon id per day (simple demo)
export function getDailyBeaconId() {
  const key = "my_beacon_id_" + new Date().toISOString().slice(0,10);
  let id = localStorage.getItem(key);
  if (!id) {
    id = uuidv4();
    localStorage.setItem(key, id);
  }
  return id;
}

export function logEncounter(otherBeaconId) {
  const encounters = JSON.parse(localStorage.getItem("encounters") || "[]");
  encounters.push({ id: otherBeaconId, at: new Date().toISOString() });
  localStorage.setItem("encounters", JSON.stringify(encounters));
  return encounters;
}

export function getEncounters() {
  return JSON.parse(localStorage.getItem("encounters") || "[]");
}
