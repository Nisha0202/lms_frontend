# 🎓 CourseMaster Frontend - Student & Admin Portal

A modern, responsive learning platform built with Next.js 15 (App Router). This application provides a seamless experience for students to enroll in courses, consume video content, and track their grades, while offering admins powerful tools to manage the curriculum.

## Live Link
https://coursemaster-frontend-kappa-one.vercel.app

## Github Backend
https://github.com/Nisha0202/lms_backend

## ✨ Key Features

-   **Modern UI/UX**: Built with Tailwind CSS and Lucide Icons for a clean, accessible interface.
-   **Dashboard System**:
    -   **Student View**: Track enrolled courses, progress bars, and grades.
    -   **Admin View**: Manage courses, edit curriculum, and grade submissions.
-   **User Administration**: Dedicated interface for admins to search users and manage access (Ban/Restore).
-   **Interactive Learning**: Video player integration, assignment submission forms, and quiz interfaces.
-   **Secure Payments**: Integrated Stripe Checkout flow.
-   **Real-time Feedback**: Toast notifications for user actions (Success/Error states).
-   **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices.


## 🛠️ Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Icons**: Lucide React
-   **HTTP Client**: Axios
-   **State Management**: React Context API & Hooks
-   **Payments**: Stripe Elements (Frontend SDK)


## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:4000/api

````

## 🚀 Installation & Setup

### 1\. Clone the repository

```bash
git clone [https://github.com/Nisha0202/lms_frontend](https://github.com/Nisha0202/lms_frontend)
cd lms-frontend
```

### 2\. Install dependencies

```bash
npm install
```

### 3\. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```bash
/src
  ├── app/              # Next.js App Router pages (Dashboard, Login, Courses)
  ├── components/       # Reusable UI components (Navbar, CourseCard, Toast)
  ├── hooks/            # Custom hooks (useAuth, useToast)
  ├── lib/              # Utilities (API configuration)
  └── types/            # TypeScript interfaces
  └── moddleware/            # Protect Routes
```
## 💳 Standard Successful Payment (Stripe Test Card)

| Field        | Value                              |
|--------------|-------------------------------------|
| Card Number  | 4242 4242 4242 4242                 |
| Expiry       | Any future date (e.g., 12/30)       |
| CVC          | Any 3 digits (e.g., 123)            |
| ZIP          | Any valid ZIP (e.g., 10001)         |

