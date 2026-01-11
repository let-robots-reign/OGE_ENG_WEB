import { BackButton } from "@/app/_components/BackButton";
import { MenuListItem } from "@/app/_components/MenuListItem";
import styles from "./page.module.css";

const topicsMap: Record<string, string[]> = {
  audio: ["Задания 1-4"],
  reading: ["Задание 12"],
  "use-of-english": [
    "По всем темам",
    "Словообразование",
    "Множественное число существительных",
    "Порядковые числительные",
    "Объектные местоимения",
    "Степени сравнения",
    "Притяжательные и возвратные местоимения",
    "Пассивный залог",
    "Глагол to be",
    "I wish + V2",
    "Модальные глаголы",
    "Условное предложение (реальное)",
    "Условное предложение (нереальное)",
    "Настоящее Простое/Продолженное",
    "Настоящее/Прошедшее Совершенное",
    "Прошедшее Простое",
    "Прошедшее Продолженное",
    "Будущее Простое",
    "Would + V",
  ],
};

type TopicsPageProps = {
  params: {
    key: string;
  };
};

export default function TopicsPage({ params }: TopicsPageProps) {
  const { key } = params;
  const titles = topicsMap[key] ?? [];
  const baseClickLink = `/training/${key}`;

  return (
    <div className={styles.menu}>
      <BackButton />
      <div className={styles.menu__list}>
        {titles.map((title) => (
          <MenuListItem
            key={title}
            title={title}
            baseClickLink={baseClickLink}
          />
        ))}
      </div>
    </div>
  );
}
