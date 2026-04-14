import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

type Task = CreateTaskDto & {
  id: string;
  status: string;
  assigneeId?: string;
};

@Injectable()
export class TasksService {
  private readonly tasks: Task[] = [
    {
      id: 't1',
      title: 'Build task board UI',
      description: 'Create the first version of the task board for the dashboard.',
      requiredSkills: [
        {
          name: 'frontend',
          minLevel: 70,
        },
      ],
      status: 'todo',
      assigneeId: 'u1',
      priority: 4,
    },
  ];

  findAll(): Task[] {
    return this.tasks;
  }

  create(task: CreateTaskDto): Task {
    const newTask: Task = {
      id: `t${this.tasks.length + 1}`,
      status: 'todo',
      ...task,
    };
    this.tasks.push(newTask);
    return newTask;
  }
}
