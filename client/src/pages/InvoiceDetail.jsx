import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Stack,
  Button,
  Chip,
  Box,
} from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PaymentIcon from '@mui/icons-material/Payment';
import '../styles/print.css';
import { formatINR } from '../utils/currency';
import PageLayout from '../components/PageLayout';

const PrintableBill = ({ invoice }) => {
  if (!invoice) return null;
  const html = `
    <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #ddd; padding: 8px; }
          th { background: #f4f4f4; }
          h1 { font-size: 20px; }
        </style>
      </head>
      <body>
        <h1>Invoice: ${invoice.invoiceNumber}</h1>
        <p>Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        <h3>Customer</h3>
        <p>${invoice.customer.name}<br/>${invoice.customer.email || ''}<br/>${invoice.customer.phone || ''}<br/>${invoice.customer.address || ''}</p>
        <h3>Products</h3>
        <table>
          <thead>
            <tr><th>Product</th><th>Qty</th><th>Rate</th><th>Amount</th></tr>
          </thead>
          <tbody>
            ${invoice.products.map(p => `<tr><td>${p.product.name}</td><td>${p.quantity}</td><td>${p.rate}</td><td>${p.amount}</td></tr>`).join('')}
          </tbody>
        </table>
        <h3 style="text-align:right">Total: ${formatINR(invoice.totalAmount)}</h3>
      </body>
    </html>
  `;

  const handlePrint = () => {
    const myWindow = window.open('', 'Print', 'width=800,height=600');
    myWindow.document.open();
    myWindow.document.write(html);
    myWindow.document.close();
    myWindow.focus();
    setTimeout(() => {
      myWindow.print();
      myWindow.close();
    }, 500);
  };

  return (
    <div>
      <div id="printable-bill" dangerouslySetInnerHTML={{ __html: html }} style={{ display: 'none' }} />
      <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>Print Bill</Button>
    </div>
  );
};

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchInvoice(id);
    }
  }, [id]);

  const fetchInvoice = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      if (typeof response.data.data === 'object' && response.data.data !== null) {
        setInvoice(response.data.data);
      } else {
        console.error('API response data for invoice is not an object:', response.data);
        setInvoice(null);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      setInvoice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePaymentStatus = async () => {
    try {
      const newPaymentStatus = invoice.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
      await api.put(`/invoices/${invoice._id}/payment-status`, { paymentStatus: newPaymentStatus });
      setInvoice(prev => ({ ...prev, paymentStatus: newPaymentStatus }));
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

  if (loading) {
    return <Typography variant="h5">Loading Invoice Details...</Typography>;
  }

  if (!invoice) {
    return <Typography variant="h5">Invoice not found.</Typography>;
  }

  return (
    <PageLayout title={`Invoice ${invoice.invoiceNumber}`}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Invoice Details</Typography>
          <Stack direction="row" spacing={1} className="no-print">
            <Button 
              variant="outlined" 
              startIcon={<PaymentIcon />} 
              onClick={handleTogglePaymentStatus}
              color={invoice.paymentStatus === 'Paid' ? 'success' : 'warning'}
            >
              Mark as {invoice.paymentStatus === 'Paid' ? 'Pending' : 'Paid'}
            </Button>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>Back</Button>
            {/* Print whole page (legacy) */}
            <Button variant="contained" startIcon={<PrintIcon />} onClick={() => window.print()}>Print</Button>
          </Stack>
        </Stack>

        {/* Invoice content */}
        <div className="invoice-print-container">
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Invoice #: {invoice.invoiceNumber}</Typography>
              <Typography>Date: {new Date(invoice.invoiceDate).toLocaleDateString()}</Typography>
              <Typography>Payment Status: 
                <Chip 
                  label={invoice.paymentStatus || 'Pending'} 
                  color={invoice.paymentStatus === 'Paid' ? 'success' : 'warning'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="h6">Customer Details</Typography>
              <Typography>Name: {invoice.customer.name}</Typography>
              <Typography>Email: {invoice.customer.email}</Typography>
              <Typography>Phone: {invoice.customer.phone}</Typography>
              <Typography>Address: {invoice.customer.address}</Typography>
            </Grid>
          </Grid>

          <Typography variant="h5" gutterBottom>Products</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Rate</TableCell>
                  <TableCell>Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {invoice.products.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.product.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.rate}</TableCell>
                    <TableCell>{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h5" align="right" sx={{ mt: 3 }}>Total Amount: {formatINR(invoice.totalAmount)}</Typography>
        </div>

        {/* Dedicated bill print control */}
        <Box sx={{ mt: 3 }} className="no-print">
          <PrintableBill invoice={invoice} />
        </Box>
      </Paper>
    </PageLayout>
  );
};

export default InvoiceDetail;