import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Stack,
  Typography,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatINR } from '../utils/currency';
import PageLayout from '../components/PageLayout';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('All');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await api.get('/invoices');
      if (Array.isArray(response.data.data)) {
        setInvoices(response.data.data);
      } else {
        console.error('API response data is not an array:', response.data);
        setInvoices([]); // Ensure invoices is always an array
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setInvoices([]); // Ensure invoices is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/invoices/${id}`);
      fetchInvoices();
    } catch (error) {
      console.error('Error deleting invoice:', error);
    }
  };

  const handleTogglePaymentStatus = async (invoice) => {
    try {
      const newPaymentStatus = invoice.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
      await api.put(`/invoices/${invoice._id}/payment-status`, { paymentStatus: newPaymentStatus });
      fetchInvoices();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Paid':
        return <Chip label="Paid" color="success" />;
      case 'Pending':
        return <Chip label="Pending" color="warning" />;
      case 'Cancelled':
        return <Chip label="Cancelled" color="error" />;
      default:
        return <Chip label={status} />;
    }
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
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return <Typography variant="h5">Loading Invoices...</Typography>;
  }

  return (
    <PageLayout title="Invoices">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack>
            <Typography variant="h4">Invoices</Typography>
            <FormControl size="small" sx={{ mt: 1, minWidth: 200 }}>
              <InputLabel>Filter by Payment Status</InputLabel>
              <Select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            component={Link}
            to="/invoices/new"
          >
            Add Invoice
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Total Amount</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices
                .filter(invoice => paymentFilter === 'All' || invoice.paymentStatus === paymentFilter)
                .map((invoice) => (
                <motion.tr key={invoice._id} variants={itemVariants}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  <TableCell>{invoice.customer?.name}</TableCell>
                  <TableCell>{new Date(invoice.invoiceDate).toLocaleDateString()}</TableCell>
                  <TableCell>{formatINR(invoice.totalAmount)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={invoice.paymentStatus || 'Pending'} 
                      color={invoice.paymentStatus === 'Paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => handleTogglePaymentStatus(invoice)}
                      title={`Mark as ${invoice.paymentStatus === 'Paid' ? 'Pending' : 'Paid'}`}
                      color={invoice.paymentStatus === 'Paid' ? 'success' : 'warning'}
                    >
                      <PaymentIcon />
                    </IconButton>
                    <IconButton component={Link} to={`/invoices/${invoice._id}`}>
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton component={Link} to={`/invoices/${invoice._id}/edit`}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(invoice._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
    </PageLayout>
  );
};

export default Invoices;
