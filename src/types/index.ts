// src/types/index.ts

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
} 
export interface Batch {
  name: string;
  startDate: string;
  endDate: string;
  seatLimit: number;
}

export interface Lesson {
  _id?: string;
  title: string;
  description?: string;
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

export interface StatsApiResponse {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  courses: CourseResponse[];
}

export interface EnrolledCourse {
  _id: string;
  course: {
    _id: string;
    title: string;
    description: string;
    category: string;
    price: number;
    thumbnail?: string;
  };
  batchName: string;
  startDate: string;
  progress: number;
  paymentStatus: string;
  createdAt: string;
}

export interface EnrollmentData {
    _id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    batchName: string;
    enrolledAt: string;
} 

export interface GradeData {
  assignments: {
    _id: string;
    lesson: Lesson | null; 
    grade?: number;
    feedback?: string;
    createdAt: string;
  }[];
}

export interface GradingItem {
  _id: string; 
  student: { name: string; email: string };
  lesson: { title: string };
  grade?: number;
  feedback?: string;
  driveLink?: string; 
  createdAt?: string;
}

export interface CoursesResponse {
  total: number;
  page: number;
  limit: number;
  courses: any[];
}
