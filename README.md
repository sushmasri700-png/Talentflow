# 🌟 TalentFlow – A Mini Hiring Platform

TalentFlow is a *React-based front-end application* designed as a mini hiring platform for HR teams.  
It enables managing *Jobs, Candidates, and Assessments* with a smooth, modern UI.  
All data is persisted locally via *IndexedDB (Dexie.js)* with *MSW/MirageJS* simulating APIs.  
Deployed seamlessly on *Vercel*.  

---

## 🚀 Live Demo

🔗 [Visit TalentFlow on Vercel](https://tanlentflow.vercel.app/)

---

## 📌 Features

### 🔹 Jobs Management
- Create, edit, archive/unarchive jobs.  
- Unique slug generation & validation.  
- Drag-and-drop reordering with optimistic updates and rollback.  
- Deep linking to jobs: /jobs/:jobId.  
- Pagination & filtering (title, status, tags).  

### 🔹 Candidate Management
- Virtualized list to handle 1000+ seeded candidates.  
- Client-side search (name/email) + stage filtering.  
- Candidate profile with timeline: /candidates/:id.  
- Kanban board for stage transitions (Applied → Screen → Tech → Offer → Hired/Rejected).  
- Notes with @mentions (render only).  

### 🔹 Assessments
- Job-specific assessment builder.  
- Add sections & multiple question types:
  - Single choice, multi-choice  
  - Short/long text  
  - Numeric with range  
  - File upload (stub)  
- Live preview while building.  
- Candidate responses stored locally.  
- Validation & conditional logic (e.g., show Q3 if Q1 === “Yes”).  

### 🔹 Persistence & Network Simulation
- *IndexedDB via Dexie* for storage.  
- *MSW/MirageJS* simulates REST APIs:
  - /jobs, /candidates, /assessments  
  - Artificial latency (200–1200ms).  
  - Error rate (5–10%) for resilience testing.  
- State restored on refresh from IndexedDB.  

---

## 🛠 Tech Stack

- *React 18* – core UI framework  
- *Vite* – fast bundler and dev server  
- *React Router* – client-side routing  
- *Dexie.js* – IndexedDB persistence  
- *MSW / MirageJS* – mock REST API  
- *Tailwind CSS + shadcn/ui* – styling & UI components  
- *Lucide Icons* – icon system  
- *Vercel* – deployment  

---

## ⚙ Installation Process

Follow these steps to set up *TalentFlow* locally:

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/sushmasri700-png/Tanlentflow.git
cd TalentFlow
npm install
npm run dev
