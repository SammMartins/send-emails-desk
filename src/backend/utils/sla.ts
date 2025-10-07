// Calculate business hours between two dates
export function calculateBusinessHours(startDate: Date, endDate: Date): number {
  let hours = 0;
  const current = new Date(startDate);
  
  while (current < endDate) {
    const day = current.getDay();
    const hour = current.getHours();
    
    // Monday = 1, Friday = 5, business hours 9-18
    if (day >= 1 && day <= 5 && hour >= 9 && hour < 18) {
      hours++;
    }
    
    current.setHours(current.getHours() + 1);
  }
  
  return hours;
}

// Check if current time is within business hours
export function isBusinessHours(date: Date): boolean {
  const day = date.getDay();
  const hour = date.getHours();
  
  return day >= 1 && day <= 5 && hour >= 9 && hour < 18;
}
