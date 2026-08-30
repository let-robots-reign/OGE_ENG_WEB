import { BackButton } from "./BackButton";
import styles from "./TrainingHeader.module.css";

type TrainingHeaderProps = {
  topic: string;
};

export function TrainingHeader({ topic }: TrainingHeaderProps) {
  return (
    <>
      <BackButton />
      <div className={`${styles.card} ${styles.trainingHeader}`}>
        <p className={styles.trainingHeader__title}>{topic}</p>
      </div>
    </>
  );
}
