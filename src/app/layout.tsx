import type { Metadata } from 'next';
import './globals.css';
import { AnalyticsProvider } from '@/lib/store/useAnalyticsStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { FilterBar } from '@/components/layout/FilterBar';

export const metadata: Metadata = {
  title: 'SENTIX | AI-Driven Multi-Vector Social Media Intelligence & Network Analysis',
  description: 'Enterprise framework for cross-platform audience intelligence, multi-dimensional sentiment NLP, demographic profiling, trend prediction, and graph link topology analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white">
        <AnalyticsProvider>
          <Header />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 flex flex-col min-w-0">
              <FilterBar />
              <div className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
                {children}
              </div>
            </main>
          </div>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
