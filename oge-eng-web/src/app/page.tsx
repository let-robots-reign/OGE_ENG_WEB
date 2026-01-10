import Link from "next/link";
import { TrainingCard } from "./_components/TrainingCard";
import { TheoryCard } from "./_components/TheoryCard";
import styles from "./page.module.css";

export default function HomePage() {
  const cards = {
    training: [
      {
        key: 'audio',
        title: 'Аудирование',
        image: 'ic_audio.svg',
      },
      {
        key: 'reading',
        title: 'Чтение',
        image: 'ic_reading.svg',
      },
      {
        key: 'use-of-english',
        title: 'Языковой материал',
        image: 'ic_use_of_english.svg',
      },
      {
        key: 'writing',
        title: 'Письмо',
        image: 'ic_writing.svg',
      }
    ],
    theory: [
      {
        key: 'general',
        title: 'Общая информация об экзамене',
        image: 'ic_exam.svg',
      },
      {
        key: 'use-of-english',
        title: 'Языковой материал',
        image: 'ic_use_of_english.svg',
      },
      {
        key: 'writing',
        title: 'Письмо',
        image: 'ic_writing.svg',
      },
    ]
  }

  return (
    <main className={styles.main}>
      <div className={styles.mainPageSections}>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Тренировки</p>
          <div className={styles.trainingsGrid}>
            {cards.training.map(({ key, title, image}) => (
              <Link key={key} href={`/trainings/${key}`} className={styles.trainingLink}>
                <TrainingCard title={title} image={image} />
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.mainPageSection}>
          <p className={styles.sectionName}>Теория</p>
          <div className={styles.theoryGrid}>
            {cards.theory.map(({ key, title, image}) => (
              <Link key={key} href={`/theory/${key}`} className={styles.theoryLink}>
                <TheoryCard title={title} image={image} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
