import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

import { useState } from 'react';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);

  async function handlePage(): Promise<void> {
    if (posts.next_page) {
      await fetch(posts.next_page)
        .then(res => res.json())
        .then(res => {
          setPosts({
            next_page: res.next_page,
            results: [
              ...posts.results,
              ...res.results.map(post => {
                return {
                  uid: post.uid,
                  first_publication_date: post.first_publication_date,
                  data: {
                    title: post.data.title,
                    subtitle: post.data.subtitle,
                    author: post.data.author,
                  },
                };
              }),
            ],
          });
        });
    }
  }

  return (
    <main className={commonStyles.container}>
      <div className={styles.postsContainer}>
        {posts.results.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a>
              <strong>{post.data.title}</strong>
              <p>{post.data.subtitle}</p>
              <div>
                <time>
                  <FiCalendar size={15} />
                  {format(
                    parseISO(post.first_publication_date),
                    'dd MMM yyyy'
                  ).toLowerCase()}
                </time>
                <span>
                  <FiUser size={15} />
                  {post.data.author}
                </span>
              </div>
            </a>
          </Link>
        ))}

        {posts.next_page && (
          <div className={styles.postPagging}>
            <button type="button" onClick={handlePage}>
              Carregar mais posts
            </button>
          </div>
        )}
        {preview && (
          <aside className={commonStyles.preview}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </div>
    </main>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      orderings: '[document.first_publication_date desc]',
      ref: previewData?.ref ?? null,
    }
  );

  const postsPagination: PostPagination = {
    next_page: postsResponse.next_page,
    results: postsResponse.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        },
      };
    }),
  };

  return {
    props: {
      postsPagination,
      preview,
    },
    revalidate: 60,
  };
};
