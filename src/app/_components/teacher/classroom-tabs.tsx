"use client";

import { useState } from "react";
import { TabStudents } from "./tab-students";
import { TabSections } from "./tab-sections";
import { TabMockExams } from "./tab-mock-exams";
import { TabWeakTopics } from "./tab-weak-topics";

const TABS = [
  { id: "students", label: "Ученики · активность" },
  { id: "sections", label: "Разделы" },
  { id: "mock-exams", label: "Пробники" },
  { id: "weak-topics", label: "Слабые темы" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ClassroomTabs({
  classroomId,
  inviteToken,
}: {
  classroomId: string;
  inviteToken: string;
}) {
  const [active, setActive] = useState<TabId>("students");

  return (
    <div className="mt-7">
      <div className="bg-surface-2 rounded-pill mb-6 inline-flex max-w-full gap-1 overflow-x-auto p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActive(tab.id)}
            className={`rounded-pill px-[17px] py-2.5 text-[14px] whitespace-nowrap transition-colors ${
              active === tab.id
                ? "bg-ink text-on-ink font-medium"
                : "text-ink-3 hover:text-ink"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === "students" && (
        <TabStudents classroomId={classroomId} inviteToken={inviteToken} />
      )}
      {active === "sections" && <TabSections classroomId={classroomId} />}
      {active === "mock-exams" && <TabMockExams classroomId={classroomId} />}
      {active === "weak-topics" && <TabWeakTopics classroomId={classroomId} />}
    </div>
  );
}
