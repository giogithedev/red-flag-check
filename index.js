
import Head from 'next/head';
import dynamic from 'next/dynamic';

const RedFlagApp = dynamic(() => import('../public/redflag-app'), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Red Flag Detector</title>
        <meta name="description" content="Analyze red flags in chats" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <RedFlagApp />
      </main>
    </>
  );
}
