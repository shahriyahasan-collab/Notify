export interface NotificationContent {
  title: string;
  body: string;
  icon?: string;
}

export const NOTIFICATION_MESSAGES: NotificationContent[] = [
  { title: "Hello there!", body: "Just checking in on you.", icon: "👋" },
  { title: "Drink Water", body: "Stay hydrated throughout the day!", icon: "💧" },
  { title: "Alert!", body: "This is a random simulated alert.", icon: "🚨" },
  { title: "Did you know?", body: "Honey never spoils.", icon: "🍯" },
  { title: "Reminder", body: "Take a deep breath.", icon: "🧘" },
  { title: "New Message", body: "You have 1 new random message.", icon: "📩" },
  { title: "Focus", body: "Time to get back to work!", icon: "🎯" },
  { title: "System Update", body: "Just kidding, everything is fine.", icon: "⚙️" },
  { title: "Look out!", body: "A wild notification appeared.", icon: "👀" },
  { title: "Code", body: "Review your latest commit.", icon: "💻" },
  { title: "Music", body: "Time to listen to some tunes?", icon: "🎵" },
  { title: "Weather", body: "It might be sunny somewhere.", icon: "☀️" },
];