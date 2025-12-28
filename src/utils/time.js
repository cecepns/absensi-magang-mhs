export function formatTime(date) {
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date);
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

export function isTimeInRange(timeString, startTime, endTime) {
  const time = new Date(`1970-01-01T${timeString}:00`);
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);
  
  return time >= start && time <= end;
}

export function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function isClockInTime() {
  const currentTime = getCurrentTime();
  return isTimeInRange(currentTime, '07:30', '08:00');
}

export function isClockOutTime() {
  const currentTime = getCurrentTime();
  return isTimeInRange(currentTime, '17:00', '17:30');
}

export function isLogbookTime() {
  const currentTime = getCurrentTime();
  return isTimeInRange(currentTime, '07:30', '17:30');
}