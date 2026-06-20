import { api } from './api';
import { Task, TaskPriority, TaskStatus } from '../types';

interface ApiTaskAssignee {
  _id: string;
  name: string;
  email: string;
}

interface ApiTask {
  _id: string;
  title: string;
  status: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: ApiTaskAssignee | string;
  subTasks?: string[];
  space?: string;
  list?: string;
}

interface HierarchyList {
  _id: string;
  name: string;
}

interface HierarchySpace {
  _id: string;
  name: string;
  lists?: HierarchyList[];
  folders?: { lists?: HierarchyList[] }[];
}

// A small, fixed palette so each project/space gets a stable-looking color
// without the backend needing to store one.
const PROJECT_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899'];
function colorForId(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
}

function mapAssignee(assignee?: ApiTaskAssignee | string) {
  if (!assignee || typeof assignee === 'string') return undefined;
  const initials = assignee.name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return {
    _id: assignee._id,
    name: assignee.name,
    email: assignee.email,
    avatarColor: colorForId(assignee._id),
    initials,
  };
}

export function mapTask(apiTask: ApiTask, spaceName: string, spaceId: string): Task {
  return {
    _id: apiTask._id,
    title: apiTask.title,
    status: apiTask.status,
    priority: apiTask.priority || 'medium',
    dueDate: apiTask.dueDate,
    projectName: spaceName,
    projectColor: colorForId(spaceId),
    assignee: mapAssignee(apiTask.assignee),
    subtasksTotal: apiTask.subTasks?.length ?? 0,
    subtasksDone: 0, // Not available without fetching each subtask's status individually
    commentCount: 0, // Not available from this endpoint
  };
}

export const taskService = {
  /**
   * Fetches every task across every list in a workspace by first loading the
   * hierarchy (spaces -> lists), then fetching each list's tasks in parallel.
   * There's no single "all tasks in workspace" endpoint on the backend yet,
   * so this fans out — fine for typical list counts, but worth revisiting
   * with a dedicated endpoint if workspaces grow very large.
   */
  async getWorkspaceTasks(workspaceId: string): Promise<Task[]> {
    const hierarchyRes = await api.get(`/workspaces/${workspaceId}/hierarchy`);
    const spaces: HierarchySpace[] = hierarchyRes.data?.data?.spaces || [];

    const listJobs: Promise<Task[]>[] = [];

    for (const space of spaces) {
      const directLists = space.lists || [];
      const folderLists = (space.folders || []).flatMap((f) => f.lists || []);
      const allLists = [...directLists, ...folderLists];

      for (const list of allLists) {
        listJobs.push(
          api
            .get(`/lists/${list._id}/tasks`)
            .then((res) => {
              const apiTasks: ApiTask[] = res.data?.data || [];
              return apiTasks.map((t) => mapTask(t, space.name, space._id));
            })
            .catch(() => [] as Task[]) // one bad list shouldn't break the whole screen
        );
      }
    }

    const results = await Promise.all(listJobs);
    return results.flat();
  },

  async getTask(taskId: string) {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data?.data;
  },

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    const res = await api.patch(`/tasks/${taskId}`, { status });
    return res.data?.data;
  },

  async getSubtasks(taskId: string) {
    const res = await api.get(`/tasks/${taskId}/subtasks`);
    return (res.data?.data || []) as ApiTask[];
  },

  async toggleSubtask(subtaskId: string, currentlyDone: boolean) {
    const res = await api.patch(`/tasks/${subtaskId}`, {
      status: currentlyDone ? 'todo' : 'done',
    });
    return res.data?.data;
  },

  async getComments(taskId: string) {
    const res = await api.get(`/tasks/${taskId}/activity`, { params: { type: 'comment' } });
    return (res.data?.data || []) as { _id: string; user: { _id: string; name: string }; content: string; createdAt: string }[];
  },

  async addComment(taskId: string, content: string) {
    const res = await api.post(`/tasks/${taskId}/comments`, { content });
    return res.data?.data;
  },

  async createTask(
    listId: string,
    data: { title: string; description?: string; priority?: TaskPriority; assignee?: string | null; dueDate?: string }
  ) {
    const res = await api.post(`/lists/${listId}/tasks`, data);
    return res.data?.data;
  },
};