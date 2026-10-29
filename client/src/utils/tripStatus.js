// Friendly text for each trip status
export const tripStatusLabels = {
  waiting: 'Waiting for pickup',
  picked_up: 'Picked up',
  at_school: 'At school',
  dropped_off: 'Dropped off at home',
  absent: 'Absent today',
};

// "2026-10-29T01:15:00.000Z" -> "06:45 AM"
export const formatTime = (value) =>
  value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';