import Head from "next/head";
import ChessGame from "@/components/ChessGame";
import styles from "@/styles/Home.module.css";

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Chess Game</title>
        <meta name="description" content="AI vs AI Chess Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>AI Chess Game</h1>
          <ChessGame />
        </main>
      </div>
    </>
  );
}
