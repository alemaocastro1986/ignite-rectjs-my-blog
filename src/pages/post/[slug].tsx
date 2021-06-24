import { Fragment } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';

import { Comments } from '../../components/Comments';

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
  preview: boolean;
}

export default function Post({ post, preview }: PostProps): JSX.Element {
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
            <Comments />
            {preview && (
              <aside className={commonStyles.preview}>
                <Link href="/api/exit-preview">
                  <a>Sair do modo Preview</a>
                </Link>
              </aside>
            )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(params.slug), {
    ref: previewData?.ref ?? null,
  });

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
      preview,
    },
  };
};
