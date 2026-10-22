# 💻 Tech Flow - IT Ticketing Exchange Platform

Tech Flow is a modern, full-stack IT support platform designed to bridge the gap between individuals needing technical help (Requesters) and IT professionals (Technicians). 

By replacing slow, traditional helpdesk tickets with a real-time exchange platform, simple chat interface, and live screen sharing, Tech Flow reduces downtime and improves resolution accuracy.

## ✨ Key Features

### 👤 Authentication & Roles
*   Secure Authentication via Supabase Auth (Email/Password).
*   Role-based access control (Requester vs. Technician).
*   Automatic profile creation using Supabase Database Triggers.
*   Profile management with CV and Portfolio uploads for Technicians.

### 🎫 Ticketing System
*   **Requesters** can submit tickets with issue descriptions, device types, and image attachments.
*   **Technicians** have an "Open Queue" to accept tickets and an "Active Tickets" dashboard to manage ongoing issues.
*   Advanced filtering, searching, and pagination on all dashboards.
*   Requesters can edit or delete their tickets at any time.

### 💬 Real-Time Chat & Support
*   WhatsApp-style real-time chat board powered by Supabase Realtime.
*   Read receipts (single and double checkmarks).
*   File and image sharing directly in the chat.
*   System notifications for ticket acceptance and remote control status.

### 🖥️ Live Screen Sharing (WebRTC)
*   Requesters can share their screen directly with the Technician via WebRTC.
*   Technicians get a live video feed inside the chat to guide the user step-by-step.

### ⭐ Reviews & Feedback
*   After a ticket is resolved, Requesters can leave a 1-5 star rating and a comment.
*   Reviews are displayed dynamically on the public landing page for social proof.

## 🛠️ Tech Stack
*   **Frontend:** React.js, Vite, React Router DOM, Vanilla CSS
*   **Backend & Database:** Supabase (PostgreSQL)
*   **Authentication:** Supabase Auth
*   **File Storage:** Supabase Storage
*   **Real-time Communication:** Supabase Realtime & WebRTC (Peer-to-Peer)
*   **Deployment:** Netlify

## 🚀 Getting Started Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tech-flow.git
   cd tech-flow
