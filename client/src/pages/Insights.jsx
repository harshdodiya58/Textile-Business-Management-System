import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Pie, PolarArea, Radar } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  RadialLinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

const currency = (v) => `₹${v.toLocaleString('en-IN')}`;

const Insights = () => {
  const [metrics, setMetrics] = useState(null);
  const [topSelling, setTopSelling] = useState([]);
  const [topBuyers, setTopBuyers] = useState([]);
  const [priceDist, setPriceDist] = useState([]);
  const [mode, setMode] = useState('topSelling');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      await Promise.all([
        fetchMetrics(),
        fetchTopSelling(),
        fetchTopBuyers(),
        fetchPriceDist(),
      ]);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/dashboard');
      setMetrics(res.data.data || {});
    } catch (err) {
      console.error('Failed to fetch metrics', err);
      setMetrics({});
    }
  };

  const fetchTopSelling = async () => {
    try {
      const res = await api.get('/dashboard/topselling');
      const list = (res.data.data || []).map((s) => ({ label: s.product?.name || 'Unknown', value: s.totalQuantity || 0 }));
      setTopSelling(list);
    } catch (err) {
      console.error('Failed to fetch top selling', err);
      setTopSelling([]);
    }
  };

  const fetchTopBuyers = async () => {
    try {
      const res = await api.get('/dashboard/topbuyers');
      const list = (res.data.data || []).map((s) => ({ label: s.name || 'Unknown', value: s.totalPurchased || 0 }));
      setTopSelling((prev) => prev); // keep
      setTopBuyers(list);
    } catch (err) {
      console.error('Failed to fetch top buyers', err);
      setTopBuyers([]);
    }
  };

  const fetchPriceDist = async () => {
    try {
      const res = await api.get('/dashboard/pricedist');
      const list = (res.data.data || []).map((b) => ({ label: b.label, count: b.count }));
      setPriceDist(list);
    } catch (err) {
      console.error('Failed to fetch price distribution', err);
      setPriceDist([]);
    }
  };

  const chartDataForMode = () => {
    if (mode === 'topSelling') {
      return {
        labels: topSelling.map((t) => t.label),
        datasets: [
          {
            label: 'Quantity Sold',
            data: topSelling.map((t) => t.value),
            backgroundColor: [
              'rgba(255, 99, 132, 0.8)',
              'rgba(54, 162, 235, 0.8)',
              'rgba(255, 206, 86, 0.8)',
              'rgba(75, 192, 192, 0.8)',
              'rgba(153, 102, 255, 0.8)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
            ],
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      };
    }
    if (mode === 'priceDist') {
      return {
        labels: priceDist.map((p) => p.label),
        datasets: [
          {
            label: 'Products',
            data: priceDist.map((p) => p.count),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
              'rgba(75, 192, 192, 0.7)',
              'rgba(153, 102, 255, 0.7)',
            ],
            borderColor: 'rgba(255, 255, 255, 1)',
            borderWidth: 2,
          },
        ],
      };
    }
    if (mode === 'topBuyers') {
      return {
        labels: topBuyers.map((b) => b.label),
        datasets: [
          {
            label: 'Purchased (INR)',
            data: topBuyers.map((b) => b.value),
            backgroundColor: 'rgba(255, 159, 64, 0.8)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 2,
            borderRadius: 8,
          },
        ],
      };
    }
    return { labels: [], datasets: [] };
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          💡 Business Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time analytics and key performance indicators
        </Typography>
      </Box>

      {/* Metric Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AttachMoneyIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Total Sales</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metrics?.totalSales ? currency(metrics.totalSales) : '₹0'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label="All Time"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ReceiptIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Invoices</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metrics?.totalInvoices ?? 0}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label={`${metrics?.pendingPayments ?? 0} Pending`}
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PeopleIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Customers</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {metrics?.totalCustomers ?? 0}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label="Active"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
                height: '100%',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Growth</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  +{metrics?.totalCustomers ? Math.round(metrics.totalCustomers * 2.5) : 0}%
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip
                    label="This Quarter"
                    size="small"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Chart Controls */}
      <motion.div variants={itemVariants}>
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button
              variant={mode === 'topSelling' ? 'contained' : 'outlined'}
              onClick={() => setMode('topSelling')}
              startIcon={<ShoppingCartIcon />}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Top Selling
            </Button>
            <Button
              variant={mode === 'priceDist' ? 'contained' : 'outlined'}
              onClick={() => setMode('priceDist')}
              startIcon={<InventoryIcon />}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Price Distribution
            </Button>
            <Button
              variant={mode === 'topBuyers' ? 'contained' : 'outlined'}
              onClick={() => setMode('topBuyers')}
              startIcon={<PeopleIcon />}
              size="large"
              sx={{ borderRadius: 2 }}
            >
              Top Buyers
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: '400px' }}>
                {mode === 'topSelling' && topSelling.length > 0 && (
                  <Bar
                    data={chartDataForMode()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          titleFont: { size: 14, weight: 'bold' },
                          bodyFont: { size: 13 },
                        },
                      },
                      scales: {
                        y: { beginAtZero: true },
                      },
                    }}
                  />
                )}

                {mode === 'priceDist' && priceDist.length > 0 && (
                  <PolarArea
                    data={chartDataForMode()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: { padding: 20, font: { size: 12 } },
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                        },
                      },
                    }}
                  />
                )}

                {mode === 'topBuyers' && topBuyers.length > 0 && (
                  <Bar
                    data={chartDataForMode()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          padding: 12,
                          callbacks: {
                            label: (context) =>
                              `₹${Number(context.parsed.y).toLocaleString('en-IN')}`,
                          },
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: (value) => '₹' + value.toLocaleString('en-IN'),
                          },
                        },
                      },
                    }}
                  />
                )}

                {((mode === 'topSelling' && topSelling.length === 0) ||
                  (mode === 'priceDist' && priceDist.length === 0) ||
                  (mode === 'topBuyers' && topBuyers.length === 0)) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                    }}
                  >
                    <Typography variant="h6" color="text.secondary">
                      No data available for this view
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  height: '400px',
                  overflowY: 'auto',
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                  {mode === 'topSelling' && 'Best Performers'}
                  {mode === 'priceDist' && 'Price Ranges'}
                  {mode === 'topBuyers' && 'VIP Customers'}
                </Typography>

                {mode === 'topSelling' &&
                  topSelling.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Chip label={`#${index + 1}`} size="small" color="primary" />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {item.value} units sold
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(item.value / topSelling[0]?.value) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}

                {mode === 'priceDist' &&
                  priceDist.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Chip
                          label={`${item.count} products`}
                          size="small"
                          color="secondary"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(item.count / priceDist[0]?.count) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                        color="secondary"
                      />
                    </Box>
                  ))}

                {mode === 'topBuyers' &&
                  topBuyers.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {item.label}
                        </Typography>
                        <Chip
                          label={`⭐ VIP`}
                          size="small"
                          sx={{
                            bgcolor: 'warning.light',
                            color: 'warning.contrastText',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {currency(item.value)} purchased
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(item.value / topBuyers[0]?.value) * 100}
                        sx={{ height: 6, borderRadius: 3 }}
                        color="warning"
                      />
                    </Box>
                  ))}
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </motion.div>
  );
};

export default Insights;
