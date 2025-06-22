import { Metadata } from "next";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

interface HeaderProps {
  metadata: Metadata | undefined;
}

function Header({ metadata }: HeaderProps) {
  return (
    <>
      <div className="mx-auto max-h-screen overflow-hidden lg:max-w-6xl">
        <Head>
          <title>{metadata ? metadata.title as string : 'Maydān'}</title>
          <meta name="description" content="Maydān" />
          <link
            rel="icon"
            href="https://res.cloudinary.com/aa1997/image/upload/v1717352483/xqqejvpf6hwmmntj438l.png"
          />
        </Head>
        <Toaster />
      </div>
    </>
  );
}

export default Header;
