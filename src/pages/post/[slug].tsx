import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import format from 'date-fns/format';

import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  readingTime: number;
}

export default function Post({ post, readingTime }: PostProps): JSX.Element {
  const { query } = useRouter();

  return (
    <>
      <Head>
        <title>spacetravelling | {query.slug}</title>
      </Head>
      <article>
        <header className={styles.banner}>
          <img src={post.data.banner.url} alt="banner" />
        </header>
        <div className={commonStyles.container}>
          <main className={`${commonStyles.content} ${styles.postContent}`}>
            <header>
              <h1>{post.data.title}</h1>
              <ul>
                <li>
                  <FiCalendar size={16} />
                  {post.first_publication_date}
                </li>
                <li>
                  <FiUser size={16} />
                  {post.data.author}
                </li>
                <li>
                  <FiClock size={16} />
                  {readingTime} min
                </li>
              </ul>
            </header>
          </main>
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(params.slug), {});

  const readingTime = Math.round(
    response.data.content
      .map(
        item =>
          RichText.asText(item.body).split(/\s+/g).length +
          RichText.asText(item.heading).split(/\s+/g).length
      )
      .reduce((acc, value) => acc + value, 0) / 200
  );

  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd MMM yyyy'
    ),
    data: {
      banner: {
        url: response.data.banner.url,
      },
      title: response.data.title,
      author: response.data.author,
      content: [...response.data.content],
    },
  };

  return {
    props: {
      post,
      readingTime,
    },
  };
};
