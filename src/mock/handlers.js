// src/mocks/handlers.js
import { http, HttpResponse } from "msw";
import { db } from "../db/db";
import { simulateNetwork, shouldFail, makeSlug } from "./utils";

// Config for error rate and latency
const WRITE_ERROR_RATE = 0.08;
const LATENCY = { min: 200, max: 1200 };

// Helper: ensure DB is seeded
async function ensureSeeded() {
  const { seedIfEmpty } = await import("./seed");
  await seedIfEmpty();
}

export const handlers = [

  // -------------------- DASHBOARD SUMMARY --------------------
  http.get("/dashboard/summary", async () => {
    await simulateNetwork(LATENCY);
    await ensureSeeded();

    const totalJobs = await db.jobs.count();
    const activeJobs = await db.jobs.where("status").equalsIgnoreCase("active").count();
    const totalCandidates = await db.candidates.count();
    const hiredCandidates = await db.candidates.where("stage").equalsIgnoreCase("hired").count();
    const totalAssessments = await db.assessments.count();

    return HttpResponse.json({
      total_jobs: totalJobs,
      active_jobs: activeJobs,
      total_candidates: totalCandidates,
      hired_candidates: hiredCandidates,
      total_assessments: totalAssessments,
    });
  }),

  // -------------------- JOBS --------------------
  http.get("/jobs", async ({ request }) => {
    await simulateNetwork(LATENCY);
    await ensureSeeded();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const status = url.searchParams.get("status")?.toLowerCase() || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "10", 10);
    const sort = url.searchParams.get("sort") || "order";

    let collection = await db.jobs.toArray();

    if (search) {
      collection = collection.filter(
        j =>
          j.title.toLowerCase().includes(search) ||
          (j.tags || []).join(" ").toLowerCase().includes(search)
      );
    }

    if (status) {
      collection = collection.filter(j => j.status.toLowerCase() === status);
    }

    collection.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "status") return a.status.localeCompare(b.status);
      return (a.order || 0) - (b.order || 0);
    });

    const total = collection.length;
    const start = (page - 1) * pageSize;
    const items = collection.slice(start, start + pageSize);

    return HttpResponse.json({ total, page, pageSize, items });
  }),

  http.post("/jobs", async ({ request }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) {
      return HttpResponse.json({ message: "Simulated server error (create job)" }, { status: 500 });
    }

    await ensureSeeded();

    const body = await request.json();
    if (!body.title) {
      return HttpResponse.json({ message: "Title is required" }, { status: 400 });
    }

    let slug = body.slug || makeSlug(body.title);
    while (await db.jobs.where("slug").equals(slug).count()) {
      slug = slug + "-1";
    }

    const maxOrderRow = await db.jobs.orderBy("order").last();
    const order = maxOrderRow ? maxOrderRow.order + 1 : 1;

    const job = {
      title: body.title,
      slug,
      status: (body.status || "active").toLowerCase(),
      tags: body.tags || [],
      order,
    };

    const id = await db.jobs.add(job);
    const created = await db.jobs.get(id);

    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/jobs/:id", async ({ request, params }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) {
      return HttpResponse.json({ message: "Simulated error (patch job)" }, { status: 500 });
    }

    await ensureSeeded();

    const id = parseInt(params.id, 10);
    const body = await request.json();
    const job = await db.jobs.get(id);
    if (!job) return HttpResponse.json({ message: "Job not found" }, { status: 404 });

    if (body.slug && body.slug !== job.slug) {
      const exists = await db.jobs.where("slug").equals(body.slug).count();
      if (exists) return HttpResponse.json({ message: "Slug must be unique" }, { status: 400 });
    }

    if (body.status) body.status = body.status.toLowerCase();

    await db.jobs.update(id, body);
    const updated = await db.jobs.get(id);
    return HttpResponse.json(updated);
  }),

  http.patch("/jobs/:id/reorder", async ({ request, params }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) {
      return HttpResponse.json({ message: "Simulated reorder error" }, { status: 500 });
    }

    await ensureSeeded();

    const id = parseInt(params.id, 10);
    const { fromOrder, toOrder } = await request.json();
    const jobs = await db.jobs.orderBy("order").toArray();
    const moving = jobs.find(j => j.id === id);
    if (!moving) return HttpResponse.json({ message: "Job not found" }, { status: 404 });

    const others = jobs.filter(j => j.id !== id);
    const targetIndex = Math.max(0, Math.min(others.length, toOrder - 1));
    others.splice(targetIndex, 0, moving);

    await Promise.all(others.map((j, idx) => db.jobs.update(j.id, { order: idx + 1 })));

    return HttpResponse.json({ fromOrder, toOrder });
  }),

  // -------------------- CANDIDATES --------------------
  http.get("/candidates", async ({ request }) => {
    await simulateNetwork(LATENCY);
    await ensureSeeded();

    const url = new URL(request.url);
    const search = url.searchParams.get("search")?.toLowerCase() || "";
    const stage = url.searchParams.get("stage")?.toLowerCase() || "";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const pageSize = parseInt(url.searchParams.get("pageSize") || "25", 10);

    let collection = await db.candidates.toArray();

    if (search) {
      collection = collection.filter(
        c =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search)
      );
    }

    if (stage && stage !== "all") {
      collection = collection.filter(c => c.stage.toLowerCase() === stage);
    }

    const total = collection.length;
    const start = (page - 1) * pageSize;
    const items = collection.slice(start, start + pageSize);

    return HttpResponse.json({ total, page, pageSize, items });
  }),

  http.post("/candidates", async ({ request }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) {
      return HttpResponse.json({ message: "Simulated create candidate error" }, { status: 500 });
    }

    await ensureSeeded();

    const body = await request.json();
    if (!body.name || !body.email) {
      return HttpResponse.json({ message: "Name and email required" }, { status: 400 });
    }

    const candidate = {
      name: body.name,
      email: body.email,
      jobId: body.jobId || null,
      stage: (body.stage || "applied").toLowerCase(),
    };

    const id = await db.candidates.add(candidate);
    const created = await db.candidates.get(id);

    await db.timelines.add({
      candidateId: id,
      timestamp: Date.now(),
      fromStage: null,
      toStage: created.stage,
      meta: { note: "Candidate created" },
    });

    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/candidates/:id", async ({ request, params }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) {
      return HttpResponse.json({ message: "Simulated patch candidate error" }, { status: 500 });
    }

    await ensureSeeded();

    const id = parseInt(params.id, 10);
    const body = await request.json();
    const candidate = await db.candidates.get(id);
    if (!candidate) return HttpResponse.json({ message: "Candidate not found" }, { status: 404 });

    const updates = {};
    if (body.stage && body.stage !== candidate.stage) {
      updates.stage = body.stage.toLowerCase();
      await db.timelines.add({
        candidateId: id,
        timestamp: Date.now(),
        fromStage: candidate.stage,
        toStage: body.stage,
        meta: { note: body.note || "Stage changed" },
      });
    }

    if (body.jobId !== undefined) updates.jobId = body.jobId;

    if (Object.keys(updates).length > 0) {
      await db.candidates.update(id, updates);
    }

    const updated = await db.candidates.get(id);
    return HttpResponse.json(updated);
  }),

  http.get("/candidates/:id/timeline", async ({ params }) => {
    await simulateNetwork(LATENCY);
    const id = parseInt(params.id, 10);
    const items = await db.timelines.where("candidateId").equals(id).toArray();
    items.sort((a, b) => a.timestamp - b.timestamp);
    return HttpResponse.json({ items });
  }),

  http.get("/candidates/:id/notes", async ({ params }) => {
    await simulateNetwork(LATENCY);
    const candidateId = parseInt(params.id, 10);
    const notes = await db.notes.where("candidateId").equals(candidateId).toArray();
    notes.sort((a, b) => b.timestamp - a.timestamp);
    return HttpResponse.json({ items: notes });
  }),

  http.post("/candidates/:id/notes", async ({ request, params }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) {
      return HttpResponse.json({ message: "Simulated add note error" }, { status: 500 });
    }

    const candidateId = parseInt(params.id, 10);
    const body = await request.json();
    if (!body.text) return HttpResponse.json({ message: "Note text required" }, { status: 400 });

    const note = { candidateId, text: body.text, mentions: body.mentions || [], timestamp: Date.now() };
    const id = await db.notes.add(note);
    const created = await db.notes.get(id);

    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/notes/:id", async ({ request, params }) => {
  await simulateNetwork(LATENCY);
  const id = parseInt(params.id, 10);
  const body = await request.json();
  await db.notes.update(id, body);
  const updated = await db.notes.get(id);
  return HttpResponse.json(updated);
}),

// Fetch candidate timeline
http.get("/candidates/:id/timeline", async ({ params }) => {
  await simulateNetwork(LATENCY);
  const id = parseInt(params.id, 10);
  const items = await db.timelines.where("candidateId").equals(id).sortBy("timestamp");
  return HttpResponse.json({ items });
}),

  // -------------------- ASSESSMENTS --------------------
  http.get("/assessments/:jobId", async ({ params }) => {
    await simulateNetwork(LATENCY);
    const jobId = parseInt(params.jobId, 10);
    const assessments = await db.assessments.where("jobId").equals(jobId).toArray();
    if (!assessments.length) return HttpResponse.json({ message: "No assessments found" }, { status: 404 });
    return HttpResponse.json(assessments);
  }),

  http.get("/assessment/:id", async ({ params }) => {
    await simulateNetwork(LATENCY);
    const id = parseInt(params.id, 10);
    const assessment = await db.assessments.get(id);
    if (!assessment) return HttpResponse.json({ message: "Assessment not found" }, { status: 404 });
    return HttpResponse.json(assessment);
  }),

  http.put("/assessments/:jobId", async ({ request, params }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) return HttpResponse.json({ message: "Simulated save assessment error" }, { status: 500 });

    const jobId = parseInt(params.jobId, 10);
    const body = await request.json();
    if (!body.questions) return HttpResponse.json({ message: "Invalid assessment payload" }, { status: 400 });

    const payload = { ...body, jobId, createdAt: new Date().toISOString() };
    const id = await db.assessments.add(payload);
    const saved = await db.assessments.get(id);
    return HttpResponse.json(saved);
  }),

  http.post("/assessments/:jobId/submit", async ({ request, params }) => {
    await simulateNetwork(LATENCY);
    if (shouldFail(WRITE_ERROR_RATE)) return HttpResponse.json({ message: "Simulated submit error" }, { status: 500 });

    const jobId = parseInt(params.jobId, 10);
    const body = await request.json();
    if (!body.candidateId || !body.answers) return HttpResponse.json({ message: "candidateId and answers required" }, { status: 400 });

    const record = { jobId, candidateId: body.candidateId, answers: body.answers, submittedAt: Date.now() };
    const id = await db.submissions.add(record);
    const created = await db.submissions.get(id);

    return HttpResponse.json(created, { status: 201 });
  }),
];
