import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from './components/Layout';
import Robots from './pages/Robots';
import Metrics from './pages/Metrics';
import Logs from './pages/Logs';

const queryClient = new QueryClient();

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Robots />} />
              <Route path="/metrics" element={<Metrics />} />
              <Route path="/logs" element={<Logs />} />
            </Routes>
          </Layout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
