import Layout from '../platform/layout/Layout';
import { useHealth } from '../queries/health';

export default function Home() {
  const { data, isLoading } = useHealth();
  return <Layout>Server status: {isLoading ? 'loading' : data?.status}</Layout>;
}
