import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Toaster } from 'react-hot-toast';

// Create a client
const queryClient = new QueryClient({
  // default options for all queries
  defaultOptions: {
    queries: {
      // disable refetching on window focus (e.g. when user comes back to the tab)
      refetchOnWindowFocus: false,
      // number of times to retry a failed query before giving up
      retry: 1,
    },
  },
});

// what does this do?
// this sets up a global config for all react-query instances in the app
// it tells react-query to:
//  - not refetch data when the window regains focus (e.g. when user comes back to the tab)
//  - retry failed queries only once before giving up
// this way, we can control the behavior of all queries in the app from a single place
// and avoid having to repeat the same config options for each query

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <AppRoutes />
            <Toaster position="top-right" />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
