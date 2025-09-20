import React, { useState, useEffect } from 'react'
import {
  Container,
  Tabs,
  Tab,
  Box,
  Typography,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
} from '@mui/material'
import { LinkIcon, BarChart3 } from 'lucide-react'
import UrlShortenerForm from './components/urlshortenerform'
import StatisticsTable from './components/StatisticsTable'
import { UrlData } from './types'
import { fetchUrls } from './api'
import { createLogger } from './logger'

// Initialize logger for the main app component
const logger = createLogger('component')

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8e2de2', // purple neon
    },
    secondary: {
      main: '#00f5d4', // cyan accent
    },
    background: {
      default: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      paper: 'rgba(255, 255, 255, 0.06)',
    },
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
    },
  },
  typography: {
    fontFamily: 'Poppins, Roboto, Helvetica, Arial, sans-serif',
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
      },
    },
  },
})

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`tab-panel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 4 }}>{children}</Box>}
    </div>
  )
}

function App() {
  const [tabValue, setTabValue] = useState(0)
  const [urls, setUrls] = useState<UrlData[]>([])
  const [loading, setLoading] = useState(false)

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    logger.info(`Tab: ${newValue === 0 ? 'Shorten' : 'Stats'}`)
    setTabValue(newValue)
  }

  const loadUrls = async () => {
    setLoading(true)
    try {
      logger.info('Loading URLs')
      const response = await fetchUrls()
      setUrls(response.urls)
      logger.info(`Loaded ${response.urls.length} URLs`)
    } catch (error) {
      console.error('Error loading URLs:', error)
      logger.error(
        `Load failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    logger.info('App mounted')
    loadUrls()
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Glassy Navbar */}
        <AppBar
          position='sticky'
          elevation={0}
          sx={{
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              variant='h5'
              sx={{ fontWeight: 'bold', color: '#00f5d4' }}
            >
              NeonShort
            </Typography>

            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              textColor='secondary'
              indicatorColor='secondary'
            >
              <Tab
                icon={<LinkIcon size={18} />}
                iconPosition='start'
                label='Shorten URLs'
              />
              <Tab
                icon={<BarChart3 size={18} />}
                iconPosition='start'
                label='Statistics'
              />
            </Tabs>
          </Toolbar>
        </AppBar>

        {/* Main Content */}
        <Container maxWidth='lg' sx={{ flex: 1, py: 6 }}>
          <TabPanel value={tabValue} index={0}>
            <Paper sx={{ p: 4 }}>
              <Typography
                variant='h4'
                gutterBottom
                sx={{ color: '#8e2de2', fontWeight: 'bold', mb: 3 }}
              >
                Create Short Links
              </Typography>
              <UrlShortenerForm onUrlsCreated={loadUrls} />
            </Paper>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Paper sx={{ p: 4 }}>
              <Typography
                variant='h4'
                gutterBottom
                sx={{ color: '#00f5d4', fontWeight: 'bold', mb: 3 }}
              >
                Link Statistics
              </Typography>
              <StatisticsTable
                urls={urls}
                loading={loading}
                onRefresh={loadUrls}
              />
            </Paper>
          </TabPanel>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
