import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { formatINR } from '../../utils/currency';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SalesReport = () => {
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [salesByMonth, setSalesByMonth] = useState([]);
  const [loadingTopSelling, setLoadingTopSelling] = useState(true);
  const [loadingSalesByMonth, setLoadingSalesByMonth] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [avgSalePerMonth, setAvgSalePerMonth] = useState(0);

  useEffect(() => {
    fetchTopSellingProducts();
    fetchSalesByMonth();
  }, []);

  const fetchTopSellingProducts = async () => {
    try {
      const response = await api.get('/dashboard/topselling');
      if (Array.isArray(response.data.data)) {
        setTopSellingProducts(response.data.data);
      } else {
        console.error('API response data for top selling products is not an array:', response.data);
        setTopSellingProducts([]);
      }
    } catch (error) {
      console.error('Error fetching top selling products:', error);
      setTopSellingProducts([]);
    } finally {
      setLoadingTopSelling(false);
    }
  };

  const fetchSalesByMonth = async () => {
    try {
      const response = await api.get('/invoices');
      if (Array.isArray(response.data.data)) {
        const invoices = response.data.data;
        const sales = {};
        let revenue = 0;
        
        invoices.forEach(invoice => {
          if (invoice.paymentStatus === 'Paid') {
            revenue += invoice.totalAmount;
            const invoiceDate = new Date(invoice.invoiceDate);
            const month = invoiceDate.toLocaleString('default', { month: 'short', year: 'numeric' });
            const sortKey = `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`;
            
            if (sales[month]) {
              sales[month].total += invoice.totalAmount;
            } else {
              sales[month] = {
                total: invoice.totalAmount,
                sortKey: sortKey
              };
            }
          }
        });
        
        // Sort by date and format for display
        const sortedSales = Object.entries(sales)
          .sort(([, a], [, b]) => a.sortKey.localeCompare(b.sortKey)) // Chronological order
          .map(([month, data]) => ({ month, total: data.total }));
        
        setSalesByMonth(sortedSales);
        setTotalRevenue(revenue);
        setAvgSalePerMonth(sortedSales.length > 0 ? revenue / sortedSales.length : 0);
      } else {
        console.error('API response data for invoices is not an array:', response.data);
        setSalesByMonth([]);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setSalesByMonth([]);
    } finally {
      setLoadingSalesByMonth(false);
    }
  };

  if (loadingTopSelling || loadingSalesByMonth) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Chart data configurations
  const monthlyBarChartData = {
    labels: salesByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Sales Revenue',
        data: salesByMonth.map(item => item.total),
        backgroundColor: 'rgba(25, 118, 210, 0.7)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: 'rgba(25, 118, 210, 0.9)',
      },
    ],
  };

  const monthlyLineChartData = {
    labels: salesByMonth.map(item => item.month),
    datasets: [
      {
        label: 'Sales Trend',
        data: salesByMonth.map(item => item.total),
        fill: true,
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderColor: 'rgba(76, 175, 80, 1)',
        tension: 0.4,
        pointBackgroundColor: 'rgba(76, 175, 80, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(76, 175, 80, 1)',
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const topProductsChartData = {
    labels: topSellingProducts.slice(0, 5).map(item => item.product.name),
    datasets: [
      {
        data: topSellingProducts.slice(0, 5).map(item => item.totalQuantity),
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
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        callbacks: {
          label: function(context) {
            return formatINR(context.parsed.y);
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₹' + value.toLocaleString('en-IN');
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + ' units';
          },
        },
      },
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
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
                  <Typography variant="h6">Total Revenue</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatINR(totalRevenue)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  From paid invoices
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
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
                  <TrendingUpIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Avg Sales/Month</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatINR(avgSalePerMonth)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Monthly average
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
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
                  <ShoppingCartIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Sales Months</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {salesByMonth.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Active periods
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Monthly Bar Chart */}
        <Grid item xs={12} lg={8}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '400px' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Monthly Sales Revenue
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  {salesByMonth.length > 0 ? (
                    <Bar data={monthlyBarChartData} options={chartOptions} />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        No sales data available yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Products Doughnut */}
        <Grid item xs={12} lg={4}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '400px' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Top 5 Products
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  {topSellingProducts.length > 0 ? (
                    <Doughnut data={topProductsChartData} options={doughnutOptions} />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        No product data
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Sales Trend Line Chart */}
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '400px' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Sales Growth Trend
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  {salesByMonth.length > 0 ? (
                    <Line data={monthlyLineChartData} options={chartOptions} />
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                      }}
                    >
                      <Typography variant="body1" color="text.secondary">
                        No trend data available
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Selling Products List */}
        <Grid item xs={12}>
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  Top Selling Products Breakdown
                </Typography>
                {topSellingProducts.length > 0 ? (
                  <Grid container spacing={2}>
                    {topSellingProducts.map((item, index) => (
                      <Grid item xs={12} md={6} key={item._id}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              bgcolor: 'background.default',
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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={`#${index + 1}`}
                                  size="small"
                                  color="primary"
                                  sx={{ fontWeight: 600 }}
                                />
                                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                  {item.product.name}
                                </Typography>
                              </Box>
                              <Chip
                                label={`${item.totalQuantity} units`}
                                color="success"
                                size="small"
                              />
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (item.totalQuantity / topSellingProducts[0].totalQuantity) * 100
                              }
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary" textAlign="center" py={3}>
                    No sales data available. Products will appear here once invoices are created.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default SalesReport;