// app/layout.j
import "../styles/globals.css";
import { Suspense } from "react";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import dynamic from "next/dynamic";
import Header from "./components/layout/Header";
const PageContainer = dynamic(() => import("./components/layout/PageContainer"), {
  ssr: false,
});
const ThemeProviderWrapper = dynamic(
  () => import("./components/layout/ThemeProviderWrapper"),
  { ssr: false }
);
const SessionProviderWrapper = dynamic(
  () => import("./components/layout/SessionProviderWrapper"),
  { ssr: false }
);
const LoadingSpinner = dynamic(
  () => import("./components/layout/LoadingSpinner"),
  { ssr: false }
);


export const metadata: Metadata = {
  title: "AlSaqr",
  description: "AlSaqr social media for the MENA region.",
  icons: "https://res.cloudinary.com/aa1997/image/upload/v1751518600/favicon_hiqtp9.svg",
  openGraph: {
    title: "AlSaqr",
    description: "AlSaqr social media for the MENA region.",
    url: "https://myapp.com",

    images: [
      {
        url: "https://res.cloudinary.com/aa1997/image/upload/v1751518600/favicon_hiqtp9.svg",
        width: 560,
        height: 440,
        alt: "AlSaqr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@alsaqr",
    creator: "@alialhaddad",
    title: "الصقر/AlSaqr",
    description: "AlSaqr social media for the MENA region.",
    images:
      "https://res.cloudinary.com/aa1997/image/upload/v1751518600/favicon_hiqtp9.svg",
  },
};

interface LayoutProps {
  className?: string;
  metadata?: Metadata;
}

export default async function RootLayout({
  children,
  metadata,
}: React.PropsWithChildren<LayoutProps>) {

  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper
          session={session}
          refetchInterval={5 * 60}
          refetchWhenOffline={false}
        >
          <ThemeProviderWrapper>
            <Header metadata={metadata} />

            <div className="mx-auto max-h-screen overflow-hidden lg:max-w-6xl">
              <main className="grid grid-cols-9">
                <Suspense
                  fallback={
                    <LoadingSpinner color="text-green-500" size="w-8 h-8" />
                  }
                >
                  <PageContainer>{children}</PageContainer>
                </Suspense>
              </main>
            </div>
            <footer className="fixed bottom-0 left-0 z-[999] bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-300 mt-8 w-[100vw]">
              <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex justify-start">
                    <img
                      className={`
                        m-0 h-full w-full md:w-[90%] transition-all duration-200 
                        sidebarLogo
                        cursor-pointer
                    `}
                      alt=""
                      style={{ maxWidth: "unset" }}
                    />
                  </div>

                  <div className="flex gap-6 text-sm">
                    <a href="/privacy-policy" className="hover:text-white">
                      Privacy
                    </a>
                    <a href="/terms-and-conditions" className="hover:text-white">
                      Terms
                    </a>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-300 dark:border-gray-700 pt-4 text-center text-sm text-gray-400">
                  © {new Date().getFullYear()} AlSaqr. All rights reserved.
                </div>
              </div>
            </footer>
          </ThemeProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
