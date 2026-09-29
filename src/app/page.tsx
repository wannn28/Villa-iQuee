import { VillaTour } from "@/components/VillaTour";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <VillaTour />
    </main>
  );
}
