import { ActivityItem, Meeting, Member, Project, Task } from '../types';

export const currentMember: Member = {
  _id: 'u1',
  name: 'Rejina Shrestha',
  email: 'rejina@planify.app',
  avatarColor: '#4F9DFF',
  initials: 'RS',
};

export const members: Member[] = [
  currentMember,
  { _id: 'u2', name: 'Aayush Karki', email: 'aayush@planify.app', avatarColor: '#F59E0B', initials: 'AK' },
  { _id: 'u3', name: 'Sabina Rai', email: 'sabina@planify.app', avatarColor: '#22C55E', initials: 'SR' },
  { _id: 'u4', name: 'Nabin Thapa', email: 'nabin@planify.app', avatarColor: '#A855F7', initials: 'NT' },
];

export const projects: Project[] = [
  { _id: 'p1', name: 'Website Redesign', color: '#4F9DFF', icon: '🎨', memberCount: 5, taskCount: 24, completedCount: 16, dueDate: 'Jul 24' },
  { _id: 'p2', name: 'Mobile App Launch', color: '#22C55E', icon: '📱', memberCount: 4, taskCount: 38, completedCount: 12, dueDate: 'Aug 02' },
  { _id: 'p3', name: 'Q3 Marketing Plan', color: '#F59E0B', icon: '📈', memberCount: 3, taskCount: 15, completedCount: 9, dueDate: 'Jul 15' },
  { _id: 'p4', name: 'Customer Portal', color: '#A855F7', icon: '🧩', memberCount: 6, taskCount: 42, completedCount: 30, dueDate: 'Sep 10' },
];

export const todayTasks: Task[] = [
  {
    _id: 't1', title: 'Finalize onboarding wireframes', status: 'inprogress', priority: 'high',
    dueDate: 'Today, 5:00 PM', projectName: 'Website Redesign', projectColor: '#4F9DFF',
    assignee: currentMember, subtasksDone: 3, subtasksTotal: 5, commentCount: 4,
  },
  {
    _id: 't2', title: 'Review App Store screenshots', status: 'todo', priority: 'medium',
    dueDate: 'Today, 3:30 PM', projectName: 'Mobile App Launch', projectColor: '#22C55E',
    assignee: members[1], subtasksDone: 0, subtasksTotal: 2, commentCount: 1,
  },
  {
    _id: 't3', title: 'Approve Q3 ad creatives', status: 'review', priority: 'urgent',
    dueDate: 'Today, 6:00 PM', projectName: 'Q3 Marketing Plan', projectColor: '#F59E0B',
    assignee: members[2], subtasksDone: 2, subtasksTotal: 2, commentCount: 6,
  },
];

export const upcomingTasks: Task[] = [
  {
    _id: 't4', title: 'Set up billing webhook handlers', status: 'todo', priority: 'high',
    dueDate: 'Tomorrow', projectName: 'Customer Portal', projectColor: '#A855F7',
    assignee: members[3], subtasksDone: 0, subtasksTotal: 4, commentCount: 0,
  },
  {
    _id: 't5', title: 'Draft release notes for v2.4', status: 'todo', priority: 'low',
    dueDate: 'Jul 10', projectName: 'Mobile App Launch', projectColor: '#22C55E',
    assignee: currentMember, subtasksDone: 1, subtasksTotal: 1, commentCount: 2,
  },
  {
    _id: 't6', title: 'User interview synthesis', status: 'todo', priority: 'medium',
    dueDate: 'Jul 11', projectName: 'Website Redesign', projectColor: '#4F9DFF',
    assignee: members[2], subtasksDone: 0, subtasksTotal: 3, commentCount: 3,
  },
];

export const todayMeetings: Meeting[] = [
  { _id: 'm1', title: 'Design sync', time: '10:00 AM', durationMinutes: 30, attendees: [members[0], members[2]] },
  { _id: 'm2', title: 'Sprint planning', time: '2:00 PM', durationMinutes: 45, attendees: members },
];

export const recentActivity: ActivityItem[] = [
  { _id: 'a1', actor: members[1], action: 'completed', target: 'Fix login redirect bug', timeAgo: '12m ago' },
  { _id: 'a2', actor: members[2], action: 'commented on', target: 'Approve Q3 ad creatives', timeAgo: '38m ago' },
  { _id: 'a3', actor: members[3], action: 'created', target: 'Set up billing webhook handlers', timeAgo: '1h ago' },
  { _id: 'a4', actor: currentMember, action: 'moved', target: 'Finalize onboarding wireframes to In Progress', timeAgo: '2h ago' },
];

export const allTasks: Task[] = [
  ...todayTasks,
  ...upcomingTasks,
  {
    _id: 't7',
    title: 'Publish changelog for v2.3',
    status: 'done',
    priority: 'low',
    dueDate: 'Jul 05',
    projectName: 'Mobile App Launch',
    projectColor: '#22C55E',
    assignee: members[1],
    subtasksDone: 1,
    subtasksTotal: 1,
    commentCount: 0,
  },
];

export const productivitySummary = {
  completedThisWeek: 18,
  totalThisWeek: 26,
  weeklyTrend: [4, 6, 3, 8, 5, 2, 0], // Mon–Sun, tasks completed per day
};

export interface NotificationItem {
  _id: string;
  type: 'mention' | 'task_update' | 'project_update' | 'system';
  actor?: Member;
  title: string;
  body: string;
  timeAgo: string;
  read: boolean;
}

export const notifications: NotificationItem[] = [
  { _id: 'n1', type: 'mention', actor: members[1], title: 'Aayush mentioned you', body: 'in "Finalize onboarding wireframes"', timeAgo: '5m ago', read: false },
  { _id: 'n2', type: 'task_update', actor: members[2], title: 'Task moved to Review', body: '"Approve Q3 ad creatives" is ready for your review', timeAgo: '38m ago', read: false },
  { _id: 'n3', type: 'project_update', actor: members[3], title: 'New member added', body: 'Nabin joined Customer Portal', timeAgo: '1h ago', read: false },
  { _id: 'n4', type: 'task_update', actor: members[0], title: 'Task completed', body: '"Fix login redirect bug" was marked done', timeAgo: '2h ago', read: true },
  { _id: 'n5', type: 'system', title: 'Weekly summary is ready', body: 'You completed 18 tasks this week — 12% more than last week', timeAgo: 'Yesterday', read: true },
  { _id: 'n6', type: 'mention', actor: members[2], title: 'Sabina mentioned you', body: 'in "User interview synthesis"', timeAgo: '2d ago', read: true },
];

export interface CalendarEvent {
  _id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: 'meeting' | 'deadline';
  color: string;
}

export const calendarEvents: CalendarEvent[] = [
  { _id: 'e1', title: 'Design sync', date: '2026-07-08', time: '10:00 AM', type: 'meeting', color: '#4F9DFF' },
  { _id: 'e2', title: 'Sprint planning', date: '2026-07-08', time: '2:00 PM', type: 'meeting', color: '#4F9DFF' },
  { _id: 'e3', title: 'Q3 Marketing Plan due', date: '2026-07-15', time: 'All day', type: 'deadline', color: '#F59E0B' },
  { _id: 'e4', title: '1:1 with Aayush', date: '2026-07-10', time: '11:00 AM', type: 'meeting', color: '#4F9DFF' },
  { _id: 'e5', title: 'Website Redesign due', date: '2026-07-24', time: 'All day', type: 'deadline', color: '#EF4444' },
  { _id: 'e6', title: 'Team retro', date: '2026-07-08', time: '4:30 PM', type: 'meeting', color: '#4F9DFF' },
];

// ---- Chat ----
export interface ChatMessage {
  _id: string;
  senderId: string;
  text: string;
  time: string;
}

export interface Conversation {
  _id: string;
  isGroup: boolean;
  name: string;
  participants: Member[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online?: boolean;
  messages: ChatMessage[];
}

export const conversations: Conversation[] = [
  {
    _id: 'conv1', isGroup: false, name: members[1].name, participants: [currentMember, members[1]],
    lastMessage: 'Sounds good, I\u2019ll update the ticket', lastMessageTime: '2m ago', unreadCount: 2, online: true,
    messages: [
      { _id: 'm1', senderId: members[1]._id, text: 'Hey, can you review the App Store screenshots today?', time: '9:12 AM' },
      { _id: 'm2', senderId: currentMember._id, text: 'Yep, looking now', time: '9:14 AM' },
      { _id: 'm3', senderId: members[1]._id, text: 'Sounds good, I\u2019ll update the ticket', time: '9:15 AM' },
    ],
  },
  {
    _id: 'conv2', isGroup: true, name: 'Website Redesign', participants: [currentMember, members[1], members[2]],
    lastMessage: 'Sabina: Approved from my side 👍', lastMessageTime: '40m ago', unreadCount: 0,
    messages: [
      { _id: 'm4', senderId: members[2]._id, text: 'Approved from my side 👍', time: '8:40 AM' },
    ],
  },
  {
    _id: 'conv3', isGroup: false, name: members[2].name, participants: [currentMember, members[2]],
    lastMessage: 'You: Thanks for the quick turnaround!', lastMessageTime: '1h ago', unreadCount: 0, online: false,
    messages: [
      { _id: 'm5', senderId: currentMember._id, text: 'Thanks for the quick turnaround!', time: '8:05 AM' },
    ],
  },
];

// ---- Time Tracking ----
export interface TimeEntry {
  _id: string;
  taskTitle: string;
  projectName: string;
  projectColor: string;
  durationMinutes: number;
  date: string;
}

export const timeEntries: TimeEntry[] = [
  { _id: 'te1', taskTitle: 'Finalize onboarding wireframes', projectName: 'Website Redesign', projectColor: '#4F9DFF', durationMinutes: 95, date: 'Today' },
  { _id: 'te2', taskTitle: 'Review App Store screenshots', projectName: 'Mobile App Launch', projectColor: '#22C55E', durationMinutes: 40, date: 'Today' },
  { _id: 'te3', taskTitle: 'User interview synthesis', projectName: 'Website Redesign', projectColor: '#4F9DFF', durationMinutes: 130, date: 'Yesterday' },
  { _id: 'te4', taskTitle: 'Draft release notes for v2.4', projectName: 'Mobile App Launch', projectColor: '#22C55E', durationMinutes: 25, date: 'Yesterday' },
];

// ---- Billing ----
export const currentPlan = {
  name: 'Pro',
  price: '$12',
  interval: 'per member / month',
  renewsOn: 'Aug 8, 2026',
  seats: 8,
};

export const plans = [
  { key: 'free', name: 'Free', price: '$0', tagline: 'For individuals getting started', features: ['Up to 3 projects', '5 team members', 'Basic task management'] },
  { key: 'pro', name: 'Pro', price: '$12', tagline: 'For growing teams', features: ['Unlimited projects', 'Unlimited members', 'Kanban & Calendar views', 'Time tracking'] },
  { key: 'business', name: 'Business', price: '$24', tagline: 'For scaling organizations', features: ['Everything in Pro', 'Advanced analytics', 'Admin controls', 'Priority support'] },
];

export interface Invoice {
  _id: string;
  date: string;
  amount: string;
  status: 'paid' | 'pending' | 'failed';
}

export const invoices: Invoice[] = [
  { _id: 'inv1', date: 'Jul 1, 2026', amount: '$96.00', status: 'paid' },
  { _id: 'inv2', date: 'Jun 1, 2026', amount: '$96.00', status: 'paid' },
  { _id: 'inv3', date: 'May 1, 2026', amount: '$84.00', status: 'paid' },
];

// ---- Admin ----
export const adminStats = {
  totalUsers: 128,
  activeToday: 47,
  totalTeams: 14,
  totalProjects: 62,
  mrr: '$1,536',
};
