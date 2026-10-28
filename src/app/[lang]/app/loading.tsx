import { InlineLoading } from '@/components/Loading';

// Suspense boundary for every page under /app: on navigation the nav stays put
// and only the page area waits for its data.
export default function AppLoading() {
  return <InlineLoading className="py-24" />;
}
