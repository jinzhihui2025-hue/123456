export function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDays(dateKey, days) {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + days);
  return todayKey(date);
}

export function createRecord() {
  return {
    status: "new",
    ease: 2.5,
    interval: 0,
    dueDate: todayKey(),
    correct: 0,
    wrong: 0,
    streak: 0,
    lastSeen: null
  };
}

export function reviewRecord(record, isCorrect, at = todayKey()) {
  const next = { ...createRecord(), ...record };

  next.lastSeen = at;

  if (isCorrect) {
    next.correct += 1;
    next.streak = (next.streak || 0) + 1;
    next.ease = Math.max(1.3, Number((next.ease + 0.05).toFixed(2)));

    const steps = [1, 3, 7, 15, 30];
    const index = Math.min(next.streak - 1, steps.length - 1);
    next.interval = steps[index];
    next.dueDate = addDays(at, next.interval);
    next.status = next.streak >= 5 ? "mastered" : "learning";
  } else {
    next.wrong += 1;
    next.streak = 0;
    next.ease = Math.max(1.3, Number((next.ease - 0.2).toFixed(2)));
    next.interval = 1;
    next.dueDate = addDays(at, 1);
    next.status = "learning";
  }

  return next;
}

export function markMastered(record) {
  return {
    ...createRecord(),
    ...record,
    status: "mastered",
    streak: Math.max(5, record?.streak || 0),
    interval: Math.max(30, record?.interval || 30),
    dueDate: addDays(todayKey(), 30),
    lastSeen: todayKey()
  };
}

export function resetLearning(record) {
  return {
    ...createRecord(),
    correct: record?.correct || 0,
    wrong: record?.wrong || 0,
    lastSeen: todayKey()
  };
}
