export type TaskStatus = 'todo' | 'inprogress' | 'review' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Member {
  _id: string;
  name: string;
  email: string;
  avatarColor: string;
  initials: string;
}

export interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  projectName: string;
  projectColor: string;
  assignee?: Member;
  subtasksDone?: number;
  subtasksTotal?: number;
  commentCount?: number;
}

export interface Project {
  _id: string;
  name: string;
  color: string;
  icon: string;
  memberCount: number;
  taskCount: number;
  completedCount: number;
  dueDate?: string;
}

export interface Meeting {
  _id: string;
  title: string;
  time: string;
  durationMinutes: number;
  attendees: Member[];
}

export interface ActivityItem {
  _id: string;
  actor: Member;
  action: string;
  target: string;
  timeAgo: string;
}
