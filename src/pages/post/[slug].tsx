import Head from 'next/head';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import Prismic from '@prismicio/client';

import { RichText } from 'prismic-dom';
import { Fragment } from 'react';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
}

export default function Post({ post }: PostProps): JSX.Element {
  const { isFallback } = useRouter();

  const readingTime = Math.ceil(
    post.data.content.reduce((acc, item) => {
      const bodyCount = RichText.asText(item.body).split(/\s+/g).length;
      const headingCount = String(item.heading).split(/\s+/g).length;
      return acc + (bodyCount + headingCount);
    }, 0) / 200
  );

  return isFallback ? (
    <h1>Carregando...</h1>
  ) : (
    <>
      <Head>
        <title>spacetravelling | {post.data.title}</title>
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
                  {format(
                    new Date(post.first_publication_date).getTime(),
                    'dd MMM yyyy'
                  ).toLowerCase()}
                </li>
                <li>
                  <FiUser size={16} />
                  {post.data.author}
                </li>
                <li>
                  <FiClock size={16} />
                  {String(readingTime)} min
                </li>
              </ul>
            </header>

            {post.data.content.map(data => (
              <section key={data.heading}>
                <h4>{data.heading}</h4>
                {data.body.map(({ text }, index) => (
                  <Fragment key={`${data.heading}-${String(index)}`}>
                    <p>{text}</p>
                    <br />
                  </Fragment>
                ))}
              </section>
            ))}
          </main>
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.predicates.at('document.type', 'posts')
  );

  return {
    paths: posts.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(params.slug), {});

  const post: Post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      subtitle: response.data.subtitle,
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
    },
  };
};
