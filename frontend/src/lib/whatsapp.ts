import { MealPoll, User } from "./types";

export function generatePollWhatsAppShareLink(poll: MealPoll, baseUrl: string): string {
  const voteUrl = `${baseUrl}/vote/${poll.token}`;
  const text = `🍽️ *${poll.date} Daily Meal Poll*\n\n` +
    `Hello Members of *Shanti Nibash Hostel Mess*!\n` +
    `Please vote for today's Lunch & Dinner before *${poll.cutoffTime}*.\n\n` +
    `👇 Click the 1-Click Voting Link below:\n` +
    `${voteUrl}\n\n` +
    `Thank you!\n— Mess Manager`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function generateReminderWhatsAppLink(user: User, poll: MealPoll, baseUrl: string): string {
  const voteUrl = `${baseUrl}/vote/${poll.token}`;
  const cleanPhone = user.phone.replace(/[^0-9]/g, "");
  const text = `👋 Hi *${user.name}*,\n\n` +
    `You haven't voted in today's meal poll (${poll.date}) yet!\n` +
    `Cutoff time is *${poll.cutoffTime}*.\n\n` +
    `Please submit your vote now:\n${voteUrl}`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

export function generateReportWhatsAppLink(month: string, baseUrl: string): string {
  const text = `📊 *Mess Monthly Report ready for ${month}*\n\n` +
    `Dear Members, the complete meal rate & financial report for ${month} has been published!\n\n` +
    `View online report & download Excel/PDF statement:\n` +
    `${baseUrl}\n\n` +
    `— Mess Manager`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
