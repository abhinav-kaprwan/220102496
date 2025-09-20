import React, { useState } from 'react'
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  IconButton,
  Grid,
  Paper,
  Chip,
  CircularProgress,
} from '@mui/material'
import { Plus, Trash2, Copy, ExternalLink } from 'lucide-react'
import { createShortUrls, getShortUrl } from '../api'
import { UrlData } from '../types'
import { createLogger } from '../logger'

const logger = createLogger('component')

interface UrlEntry {
  url: string
  shortcode: string
  validity: number
}

interface Props {
  onUrlsCreated: () => void
}

const UrlShortenerForm: React.FC<Props> = ({ onUrlsCreated }) => {
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([
    { url: '', shortcode: '', validity: 60 },
  ])
  const [loading, setLoading] = useState(false)
  const [createdUrls, setCreatedUrls] = useState<UrlData[]>([])
  const [snackbar, setSnackbar] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: '',
  })

  const handleUrlChange = (
    index: number,
    field: keyof UrlEntry,
    value: string | number
  ) => {
    const newEntries = [...urlEntries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    setUrlEntries(newEntries)
  }

  const addEntry = () => {
    if (urlEntries.length < 5)
      setUrlEntries([...urlEntries, { url: '', shortcode: '', validity: 60 }])
  }

  const removeEntry = (index: number) => {
    if (urlEntries.length > 1)
      setUrlEntries(urlEntries.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const valid = urlEntries.filter((e) => e.url.trim() !== '')
      if (!valid.length) {
        setSnackbar({ open: true, msg: 'Please provide at least one URL' })
        setLoading(false)
        return
      }

      const response = await createShortUrls({
        urls: valid.map((e) => e.url),
        validity: valid[0].validity,
        shortcode: valid[0].shortcode || undefined,
      })

      setCreatedUrls(response.urls)
      setUrlEntries([{ url: '', shortcode: '', validity: 60 }])
      onUrlsCreated()
      setSnackbar({ open: true, msg: 'Short URLs created!' })
    } catch (err: any) {
      logger.error(err.message)
      setSnackbar({ open: true, msg: 'Failed to create URLs' })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt)
      setSnackbar({ open: true, msg: 'Copied!' })
    } catch {
      setSnackbar({ open: true, msg: 'Copy failed' })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: 4,
        background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
        color: '#f5f5f5',
      }}
    >

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {urlEntries.map((entry, i) => (
            <Grid item xs={12} key={i}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(128,255,234,0.3)',
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label='Original URL'
                      variant='outlined'
                      value={entry.url}
                      onChange={(e) =>
                        handleUrlChange(i, 'url', e.target.value)
                      }
                      InputLabelProps={{ style: { color: '#80ffea' } }}
                      sx={{
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#80ffea' },
                          '&:hover fieldset': { borderColor: '#ff61a6' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label='Shortcode'
                      value={entry.shortcode}
                      onChange={(e) =>
                        handleUrlChange(i, 'shortcode', e.target.value)
                      }
                      InputLabelProps={{ style: { color: '#80ffea' } }}
                      sx={{
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#80ffea' },
                          '&:hover fieldset': { borderColor: '#ff61a6' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <TextField
                      fullWidth
                      type='number'
                      label='Validity (min)'
                      value={entry.validity}
                      onChange={(e) =>
                        handleUrlChange(i, 'validity', e.target.value)
                      }
                      InputLabelProps={{ style: { color: '#80ffea' } }}
                      sx={{
                        input: { color: '#fff' },
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': { borderColor: '#80ffea' },
                          '&:hover fieldset': { borderColor: '#ff61a6' },
                        },
                      }}
                    />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={1}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    {urlEntries.length > 1 && (
                      <IconButton
                        onClick={() => removeEntry(i)}
                        sx={{ color: '#ff61a6' }}
                      >
                        <Trash2 />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box textAlign='center' mt={3}>
          {urlEntries.length < 5 && (
            <Button
              startIcon={<Plus />}
              onClick={addEntry}
              sx={{
                color: '#80ffea',
                borderColor: '#80ffea',
                borderRadius: 50,
                px: 3,
                '&:hover': { borderColor: '#ff61a6', color: '#ff61a6' },
              }}
              variant='outlined'
            >
              Add URL
            </Button>
          )}
        </Box>

        <Box textAlign='center' mt={4}>
          <Button
            type='submit'
            variant='contained'
            size='large'
            disabled={loading}
            sx={{
              background: 'linear-gradient(45deg, #80ffea, #ff61a6)',
              color: '#000',
              fontWeight: 'bold',
              px: 4,
              borderRadius: 50,
              '&:hover': { opacity: 0.9 },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color='inherit' />
            ) : (
              'Generate Short Links'
            )}
          </Button>
        </Box>
      </form>

      {createdUrls.length > 0 && (
        <Box mt={6}>
          <Typography variant='h5' gutterBottom sx={{ color: '#80ffea' }}>
            Your Links
          </Typography>
          <Grid container spacing={2}>
            {createdUrls.map((u, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(128,255,234,0.3)',
                  }}
                >
                  <Typography variant='body2' gutterBottom>
                    {u.originalUrl}
                  </Typography>
                  <Box display='flex' alignItems='center' gap={1}>
                    <Typography
                      variant='body1'
                      sx={{ fontFamily: 'monospace', color: '#fff' }}
                    >
                      {getShortUrl(u.shortcode)}
                    </Typography>
                    <IconButton
                      onClick={() => copyToClipboard(getShortUrl(u.shortcode))}
                    >
                      <Copy size={16} color='#80ffea' />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        window.open(getShortUrl(u.shortcode), '_blank')
                      }
                    >
                      <ExternalLink size={16} color='#ff61a6' />
                    </IconButton>
                  </Box>
                  <Chip
                    label={`Valid until: ${new Date(
                      u.expiresAt
                    ).toLocaleTimeString()}`}
                    size='small'
                    sx={{ mt: 1, borderColor: '#80ffea', color: '#80ffea' }}
                    variant='outlined'
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ open: false, msg: '' })}
        message={snackbar.msg}
      />
    </Box>
  )
}

export default UrlShortenerForm
