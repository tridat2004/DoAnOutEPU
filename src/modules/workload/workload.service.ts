import { Injectable } from '@nestjs/common';

@Injectable()
export class WorkloadService {
  summary() {
    return [
      { userId: 'u1', activeTasks: 3, capacity: 10, availability: 0.8 },
      { userId: 'u2', activeTasks: 5, capacity: 10, availability: 0.5 },
      { userId: 'u3', activeTasks: 1, capacity: 10, availability: 0.9 },
    ];
  }
}
