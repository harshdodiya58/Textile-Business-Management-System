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
  Avatar,
  Paper,
  Divider,
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
import { Doughnut, Bar } from 'react-chartjs-2';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const PartyReport = () => {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await api.get('/parties');
      if (Array.isArray(response.data.data)) {
        const allParties = response.data.data;
        setCustomers(allParties.filter(p => p.type === 'Customer'));
        setSuppliers(allParties.filter(p => p.type === 'Supplier'));
      } else {
        console.error('API response data is not an array:', response.data);
        setCustomers([]);
        setSuppliers([]);
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
      setCustomers([]);
      setSuppliers([]);
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

  const allParties = [...customers, ...suppliers];
  const paidCustomers = customers.filter(c => c.paymentStatus === 'Paid').length;
  const pendingCustomers = customers.filter(c => c.paymentStatus === 'Pending').length;
  
  const paymentStatusChart = {
    labels: ['Paid', 'Pending'],
    datasets: [
      {
        data: [paidCustomers, pendingCustomers],
        backgroundColor: ['rgba(76, 175, 80, 0.8)', 'rgba(255, 193, 7, 0.8)'],
        borderColor: ['rgba(76, 175, 80, 1)', 'rgba(255, 193, 7, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const partyTypeChart = {
    labels: ['Customers', 'Suppliers'],
    datasets: [
      {
        data: [customers.length, suppliers.length],
        backgroundColor: ['rgba(33, 150, 243, 0.8)', 'rgba(156, 39, 176, 0.8)'],
        borderColor: ['rgba(33, 150, 243, 1)', 'rgba(156, 39, 176, 1)'],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
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
                  <PeopleIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Total Parties</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {allParties.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Customers & Suppliers
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
                  <BusinessIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Customers</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {customers.length}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Active customers
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
                  <CheckCircleIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Paid</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {paidCustomers}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Customers paid
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
                  <PendingIcon sx={{ fontSize: 40, mr: 1 }} />
                  <Typography variant="h6">Pending</Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {pendingCustomers}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                  Awaiting payment
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '350px' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Party Type Distribution
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  <Doughnut data={partyTypeChart} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={6}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '350px' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Payment Status
                </Typography>
                <Box sx={{ height: 'calc(100% - 40px)' }}>
                  <Doughnut data={paymentStatusChart} options={chartOptions} />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Customer Directory */}
      <motion.div variants={itemVariants}>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              Customer Directory
            </Typography>
            <Grid container spacing={2}>
              {customers.map((customer, index) => (
                <Grid item xs={12} md={6} key={customer._id}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2.5,
                        transition: 'all 0.3s',
                        '&:hover': {
                          elevation: 6,
                          transform: 'translateY(-4px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 50,
                            height: 50,
                            mr: 2,
                            fontSize: '1.2rem',
                          }}
                        >
                          {customer.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {customer.name}
                          </Typography>
                          <Chip
                            label={customer.paymentStatus || 'Pending'}
                            size="small"
                            color={customer.paymentStatus === 'Paid' ? 'success' : 'warning'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PeopleIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {customer.contactPerson}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">{customer.phone}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <EmailIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                            {customer.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                          <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {customer.address}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
            {customers.length === 0 && (
              <Typography variant="body1" color="text.secondary" textAlign="center" py={3}>
                No customers found. Add customers to see them here.
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Supplier Directory */}
      {suppliers.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                Supplier Directory
              </Typography>
              <Grid container spacing={2}>
                {suppliers.map((supplier, index) => (
                  <Grid item xs={12} md={6} key={supplier._id}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Paper
                        elevation={2}
                        sx={{
                          p: 2.5,
                          transition: 'all 0.3s',
                          borderLeft: '4px solid',
                          borderColor: 'secondary.main',
                          '&:hover': {
                            elevation: 6,
                            transform: 'translateY(-4px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'secondary.main',
                              width: 50,
                              height: 50,
                              mr: 2,
                              fontSize: '1.2rem',
                            }}
                          >
                            {supplier.name.charAt(0)}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {supplier.name}
                            </Typography>
                            <Chip
                              label="Supplier"
                              size="small"
                              color="secondary"
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ my: 1.5 }} />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PeopleIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {supplier.contactPerson}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">{supplier.phone}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                              {supplier.email}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                            <LocationOnIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {supplier.address}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PartyReport;