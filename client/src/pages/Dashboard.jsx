import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardContent, Typography, Grid, Box, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { formatINR } from '../utils/currency';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentInvoices, setRecentInvoices] = useState([]);

  useEffect(() => {
    fetchMetrics();
    fetchRecentInvoices();
  }, []);

  const fetchRecentInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setRecentInvoices((res.data.data || []).slice(0, 5));
    } catch (err) {
      console.error('Failed to fetch recent invoices', err);
      setRecentInvoices([]);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await api.get('/dashboard');
      if (typeof response.data.data === 'object' && response.data.data !== null) {
        setMetrics(response.data.data);
      } else {
        console.error('API response data is not an object:', response.data);
        setMetrics({}); // Ensure metrics is always an object
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      setMetrics({}); // Ensure metrics is always an object on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Typography variant="h5">Loading Dashboard...</Typography>;
  }

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <Avatar className="stat-avatar primary"><MonetizationOnIcon /></Avatar>
            <Box className="stat-info">
              <Typography className="stat-sub">Total Sales</Typography>
              <Typography className="stat-value">{formatINR(metrics.totalSales)}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <Avatar className="stat-avatar accent"><AssessmentIcon /></Avatar>
            <Box className="stat-info">
              <Typography className="stat-sub">Pending Payments</Typography>
              <Typography className="stat-value">{metrics.pendingPayments}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <Avatar className="stat-avatar primary"><InventoryIcon /></Avatar>
            <Box className="stat-info">
              <Typography className="stat-sub">Low Stock Items</Typography>
              <Typography className="stat-value">{metrics.lowStockItems}</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="dashboard-card">
            <Avatar className="stat-avatar accent"><PeopleIcon /></Avatar>
            <Box className="stat-info">
              <Typography className="stat-sub">Total Customers</Typography>
              <Typography className="stat-value">{metrics.totalCustomers}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Recent Invoices</Typography>
        <TableContainer component={Paper}>
          <Table className="table-compact">
            <TableHead>
              <TableRow>
                <TableCell>Invoice #</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Payment Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentInvoices.map(inv => (
                <TableRow key={inv._id}>
                  <TableCell>{inv.invoiceNumber}</TableCell>
                  <TableCell>{inv.customer?.name}</TableCell>
                  <TableCell>{new Date(inv.invoiceDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatINR(inv.totalAmount)}</TableCell>
                  <TableCell>
                    <Typography 
                      color={inv.paymentStatus === 'Paid' ? 'success.main' : 'warning.main'}
                      sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                    >
                      {inv.paymentStatus || 'Pending'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default Dashboard;