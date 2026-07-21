import { theoryTopics, type CategorySlug } from "@/app/data/theory-topics";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SectionSubHeader } from "@/app/_components/training/shared/training-sub-header";

export function generateStaticParams() {
  return Object.keys(theoryTopics).map((category) => ({
    category,
  }));
}

interface TheoryCategoryPageProps {
  params: Promise<{
    category: CategorySlug;
  }>;
}

export default async function TheoryCategoryPage({
  params,
}: TheoryCategoryPageProps) {
  const { category } = await params;
  const categoryData = theoryTopics[category];

  if (!categoryData) {
    notFound();
  }

  return (
    <>
      <SectionSubHeader
        section="теория"
        title={categoryData.title}
        backHref="/"
      />
      <div className="px-5 pt-8 pb-16 sm:px-8 lg:px-14">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:[grid-auto-rows:130px] sm:grid-cols-2 lg:grid-cols-3">
          {categoryData.topics.map((topic) => (
            <Link
              href={`/theory/${category}/${topic.id}`}
              key={topic.id}
              className="group bg-surface border-line flex h-full flex-col gap-3 rounded-lg border p-6 no-underline transition-shadow hover:shadow-md"
            >
              <h2 className="font-display text-ink m-0 flex-1 text-[22px] leading-[1.15] tracking-[-0.02em]">
                {topic.title}
              </h2>
              <div className="flex justify-end">
                <div className="bg-surface-2 text-ink-2 grid h-8 w-8 place-items-center rounded-full transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
