import { createTaskStore } from './taskStore';
import { createTaskRepository } from '../storage/taskRepository';
import { appStorage } from '../storage/appStorage';

export const useTaskStore = createTaskStore(createTaskRepository(appStorage));