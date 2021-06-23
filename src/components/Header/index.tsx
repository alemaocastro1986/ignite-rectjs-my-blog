import Image from 'next/image';
import Head from 'next/head';

import styles from './header.module.scss';

export default function Header(): JSX.Element {
  // TODO
  return (
    <>
      <Head>
        <title>spacetravelling | posts</title>
      </Head>
      <header className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <Image src="/images/logo.svg" alt="logo" width={238} height={25} />
        </div>
      </header>
    </>
  );
}
