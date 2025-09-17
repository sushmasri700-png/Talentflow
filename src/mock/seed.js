// src/mocks/seed.js
import { faker } from "@faker-js/faker";
import { db } from "../db/db";
import { makeSlug } from "./utils";

const STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

export async function seedIfEmpty() {
  const jobsCount = await db.jobs.count();
  const candidatesCount = await db.candidates.count();

  let allJobs = await db.jobs.toArray();

  // Seed jobs
  if (jobsCount === 0) {
    const jobs = Array.from({ length: 25 }).map((_, i) => {
      const title = faker.person.jobTitle() + (i < 5 ? " (Priority)" : "");
      return {
        title,
        slug: makeSlug(title) + "-" + i,
        status: Math.random() < 0.8 ? "active" : "archived",
        tags: faker.helpers.arrayElements(
          ["frontend", "backend", "fullstack", "design", "ml", "devops"],
          { min: 1, max: 3 }
        ),
        order: i + 1,
      };
    });
    await db.jobs.bulkAdd(jobs);
    allJobs = await db.jobs.toArray();
  }

  // Seed candidates
  if (candidatesCount === 0) {
    const candidates = Array.from({ length: 1000 }).map(() => {
      const job = faker.helpers.arrayElement(allJobs);
      return {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        jobId: job.id,
        stage: faker.helpers.arrayElement(STAGES),
      };
    });
    await db.candidates.bulkAdd(candidates);

    // timelines
    const allCandidates = await db.candidates.toArray();
    const timelineRecords = [];
    for (let c of allCandidates.slice(0, 200)) {
      let currentStage = "applied";
      const numberOfEvents = faker.number.int({ min: 1, max: 6 });
      for (let i = 0; i < numberOfEvents; i++) {
        const nextStage = faker.helpers.arrayElement(STAGES);
        timelineRecords.push({
          candidateId: c.id,
          timestamp:
            Date.now() -
            faker.number.int({ min: 0, max: 1000 * 60 * 60 * 24 * 90 }),
          fromStage: currentStage,
          toStage: nextStage,
          meta: { note: faker.lorem.sentence() },
        });
        currentStage = nextStage;
      }
    }
    await db.timelines.bulkAdd(timelineRecords);
  }

  // Seed assessments safely
  const assessmentsCount = await db.assessments.count();
  if (assessmentsCount === 0 && allJobs.length >= 3) {
    const assessments = [
      {
        jobId: allJobs[0].id,
        title: "Frontend Assessment",
        questions: Array.from({ length: 12 }).map(() => ({
          type: faker.helpers.arrayElement([
            "single",
            "multi",
            "short",
            "long",
            "numeric",
            "file",
          ]),
          label: faker.lorem.sentence(),
          required: Math.random() < 0.8,
          choices: ["A", "B", "C", "D"].slice(
            0,
            faker.number.int({ min: 2, max: 4 })
          ),
        })),
      },
      {
        jobId: allJobs[1].id,
        title: "Backend Assessment",
        questions: Array.from({ length: 10 }).map(() => ({
          type: faker.helpers.arrayElement([
            "single",
            "multi",
            "short",
            "long",
            "numeric",
          ]),
          label: faker.lorem.sentence(),
          required: Math.random() < 0.7,
          choices: ["Yes", "No"],
        })),
      },
      {
        jobId: allJobs[2].id,
        title: "Data Science Assessment",
        questions: Array.from({ length: 11 }).map(() => ({
          type: faker.helpers.arrayElement(["short", "long", "numeric"]),
          label: faker.lorem.sentence(),
          required: true,
        })),
      },
    ];

    // Add safely
    for (const a of assessments) {
      await db.assessments.add(a);
    }
  }

  console.log("✅ Seeded DB: jobs, candidates, timelines, assessments");
}
