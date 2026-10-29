// The choices shown in the report forms
export const reportCategories = {
  driver: [
    { value: 'breakdown', label: '🔧 Vehicle breakdown' },
    { value: 'accident', label: '🚑 Accident' },
    { value: 'driver_absence', label: '🙋 Driver cannot work today' },
    { value: 'delay', label: '⏰ Serious delay' },
    { value: 'other', label: '❗ Other emergency' },
  ],
  parent: [
    { value: 'late_pickup', label: '⏰ Late pickup or drop-off' },
    { value: 'driver_behaviour', label: '🧑‍✈️ Driver behaviour' },
    { value: 'safety', label: '🦺 Safety concern' },
    { value: 'payment', label: '💳 Payment issue' },
    { value: 'other', label: '💬 Other' },
  ],
};

// "breakdown" -> "🔧 Vehicle breakdown"
export const categoryLabel = (value, type) => {
  const list = type === 'emergency' ? reportCategories.driver : reportCategories.parent;
  return list.find((c) => c.value === value)?.label || value;
};

export const reportStatusLabels = {
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
};