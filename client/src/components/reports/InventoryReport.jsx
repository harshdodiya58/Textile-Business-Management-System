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
  Alert,
  Paper,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import InventoryIcon from '@mui/icons-material/Inventory';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const InventoryReport = () => {
  const [products, setProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      if (Array.isArray(response.data.data)) {
        setProducts(response.data.data);
        setLowStockProducts(response.data.data.filter(p => p.stock < p.minStock));
      } else {
        console.error('API response data for products is not an array:', response.data);
        setProducts([]);
        setLowStockProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const healthyStock = products.filter(p => p.stock >= p.minStock).length;
  
  // Stock categories
  const categoryData = {};
  products.forEach(p => {
    if (!categoryData[p.category]) {
      categoryData[p.category] = { count: 0, stock: 0 };
    }
    categoryData[p.category].count += 1;
    categoryData[p.category].stock += p.stock;
  });

  const stockByCategoryChart = {
    labels: Object.keys(categoryData),
    datasets: [
      {
        label: 'Total Stock',
        data: Object.values(categoryData).map(c => c.stock),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const stockHealthChart = {
    labels: ['Healthy Stock', 'Low Stock'],
    datasets: [
      {
        data: [healthyStock, lowStockProducts.length],
        backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(244, 67, 54, 0.8)'],
        borderColor: ['rgba(76, 175, 80, 1)', 'rgba(244, 67, 54, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
      },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 15, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
      },
    },
  };

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
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InventoryIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Total Products</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {products.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Active SKUs
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <InventoryIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Total Stock</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {totalStock.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Units in warehouse
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CheckCircleIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Healthy Stock</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {healthyStock}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Above minimum
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={3}>
          <motion.div variants={itemVariants}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Low Stock</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {lowStockProducts.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Need restock
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Alert
            severity="warning"
            icon={<WarningIcon fontSize="large" />}
            sx={{ mb: 3, fontSize: '1rem' }}
          >
            <Typography variant="h6" gutterBottom>
              {lowStockProducts.length} product(s) need restocking!
            </Typography>
            <Typography variant="body2">
              Some products are below minimum stock levels. Consider placing orders soon.
            </Typography>
          </Alert>
        </motion.div>
      )}

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '400px' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Stock by Category
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  <Bar data={stockByCategoryChart} options={barChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '400px' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Stock Health
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  <Pie data={stockHealthChart} options={pieChartOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Low Stock Products List */}
      {lowStockProducts.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <TrendingDownIcon color="error" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Low Stock Products - Immediate Attention Required
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {lowStockProducts.map((product, index) => (
                  <Grid item xs={12} md={6} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2,
                          borderLeft: '4px solid',
                          borderColor: 'error.main',
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
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {product.productCode}
                            </Typography>
                          </Box>
                          <Chip label={product.category} size="small" color="primary" />
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              mb: 0.5,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              Stock Level
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {product.stock} / {product.minStock} {product.unitOfMeasurement}
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(product.stock / product.minStock) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: 'error.light',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: 'error.main',
                              },
                            }}
                          />
                        </Box>
                        <Chip
                          label={`${product.minStock - product.stock} units short`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* All Products Overview */}
      <motion.div variants={itemVariants}>
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              All Products Stock Status
            </Typography>
            <Grid container spacing={2}>
              {products.map((product, index) => {
                const isLowStock = product.stock < product.minStock;
                const stockPercentage = (product.stock / product.minStock) * 100;
                
                return (
                  <Grid item xs={12} md={6} lg={4} key={product._id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          borderLeft: '3px solid',
                          borderColor: isLowStock ? 'error.main' : 'success.main',
                          transition: 'all 0.3s',
                          '&:hover': {
                            elevation: 4,
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: 1,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.productCode}
                            </Typography>
                          </Box>
                          <Chip
                            label={product.category}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {product.stock} {product.unitOfMeasurement}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(stockPercentage, 100)}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: isLowStock ? 'error.light' : 'success.light',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: isLowStock ? 'error.main' : 'success.main',
                              },
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Min: {product.minStock}
                          </Typography>
                          <Chip
                            label={isLowStock ? 'Low Stock' : 'Healthy'}
                            size="small"
                            color={isLowStock ? 'error' : 'success'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                );
              })}
            </Grid>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default InventoryReport;