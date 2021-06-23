import Image from 'next/image';
import Link from 'next/link';
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
          <Link href="/">
            <a>
              <Image
                src="/images/logo.svg"
                alt="logo"
                width={238}
                height={25}
              />
            </a>
          </Link>
        </div>
      </header>
    </>
  );
}
