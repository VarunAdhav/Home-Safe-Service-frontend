const formatBookingSlot = (slot) => {
  if (!slot?.date || !slot?.time) return "—";
  const date = new Date(slot.date);
  return `${date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })} at ${slot.time}`;
};
