import { BackButton } from "./BackButton";
import styles from "./TrainingHeader.module.css";
import clsx from "clsx";

type TrainingHeaderProps = {
  topic: string;
  onShowInstruction: () => void;
};

export function TrainingHeader({
  topic,
  onShowInstruction,
}: TrainingHeaderProps) {
  return (
    <>
      <BackButton />
      <div className={`${styles.card} ${styles.trainingHeader}`}>
        <p className={styles.trainingHeader__title}>{topic}</p>
        <button
          className={clsx(styles.btn, styles.primary)}
          onClick={onShowInstruction}
        >
          Инструкция
        </button>
      </div>
    </>
  );
}
