// src/types/index.ts

export interface Batch {
  name: string;
  startDate: string;
  endDate: string;
  seatLimit: number;
}

export interface Lesson {
  _id?: string;
  title: string;
  videoUrl: string;
  quizFormUrl: string;
  assignmentText: string;
  isExpanded?: boolean; 
}

export interface CourseResponse {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  tags: string[];
  batches: Batch[];
  lessons: Lesson[];
  instructor?: { name: string; email: string }; // Optional
}

// You can also add payload types here
export interface CoursePayload {
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  tags: string[];
  batches: Batch[];
}