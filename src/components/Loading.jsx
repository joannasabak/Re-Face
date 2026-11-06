import styles from "../ui/Loading.module.css";

export default function Loading({ className }) {
  return (
    <div className={className}>
      <div className={styles.spinner}></div>
    </div>
  );
}