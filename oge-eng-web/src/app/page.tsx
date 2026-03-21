import Link from "next/link";
import { TrainingCard } from "./_components/training-card";
import { TheoryCard } from "./_components/theory-card";
import styles from "./page.module.css";
import { DiagnosticsCard } from "./_components/DiagnosticsCard";
import { RoleUpdater } from "./_components/role-updater";

export default function HomePage() {
  const cards = {
    training: [
      {
        key: "audio",
        title: "Аудирование",
        image: "ic_audio.svg",
        urlSuffix: "/topics",
      },
      {
        key: "reading",
        title: "Чтение",
        image: "ic_reading.svg",
        urlSuffix: "/topics",
      },
      {
        key: "use-of-english",
        title: "Языковой материал",
        image: "ic_use_of_english.svg",
        urlSuffix: "/topics",
      },
      {
        key: "writing",
        title: "Письмо",
        image: "ic_writing.svg",
        urlSuffix: "",
      },
    ],
    diagnostics: [
      {
        key: "grammar",
        title: "Первоначальная грамматическая диагностика",
        image: "ic_diagnostics.svg",
      },
    ],
    theory: [
      {
        key: "general",
        title: "Общая информация об экзамене",
        image: "ic_exam.svg",
      },
      {
        key: "use-of-english",
        title: "Языковой материал",
        image: "ic_use_of_english.svg",
      },
      {
        key: "writing",
        title: "Письмо",
        image: "ic_writing.svg",
      },
    ],
  };

  return (
    <>
      <RoleUpdater />
      <div className={styles.mainPageSections}>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Тренировки</p>
          <div className={styles.trainingsGrid}>
            {cards.training.map(({ key, title, image, urlSuffix }) => (
              <Link
                key={key}
                href={`/training/${key}${urlSuffix}`}
                className={styles.trainingLink}
              >
                <TrainingCard
                  className="grid-cols-[1fr_2fr]"
                  title={title}
                  image={image}
                />
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Теория</p>
          <div className={styles.theoryGrid}>
            {cards.theory.map(({ key, title, image }) => (
              <Link
                key={key}
                href={`/theory/${key}`}
                className={styles.theoryLink}
              >
                <TheoryCard title={title} image={image} />
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Диагностика</p>
          <div className={styles.trainingsGrid}>
            {cards.diagnostics.map((card) => (
              <DiagnosticsCard key={card.key} card={card} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
