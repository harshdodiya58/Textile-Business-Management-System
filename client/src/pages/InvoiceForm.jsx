import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Button,
  TextField,
  Autocomplete,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import PageLayout from '../components/PageLayout';

const InvoiceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState({
    invoiceNumber: '',
    customer: null,
    products: [],
    totalAmount: 0,
    paymentStatus: 'Pending',
  });
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInvoice, setLoadingInvoice] = useState(true);

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    if (id) {
      fetchInvoice(id);
    } else {
      setLoadingInvoice(false);
    }
  }, [id]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/parties?type=Customer');
      if (Array.isArray(response.data.data)) {
        setCustomers(response.data.data);
      } else {
        console.error('API response data for customers is not an array:', response.data);
        setCustomers([]);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      if (Array.isArray(response.data.data)) {
        setProducts(response.data.data);
      } else {
        console.error('API response data for products is not an array:', response.data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchInvoice = async (id) => {
    try {
      const response = await api.get(`/invoices/${id}`);
      setInvoice(response.data.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleCustomerChange = (event, value) => {
    setInvoice((prev) => ({ ...prev, customer: value }));
  };

  const handleProductAdd = (event, value) => {
    if (value) {
      const newProduct = {
        product: value,
        quantity: 1,
        rate: value.price,
        amount: value.price,
      };
      setInvoice((prev) => ({
        ...prev,
        products: [...prev.products, newProduct],
      }));
    }
  };

  const handleProductChange = (index, field, value) => {
    const updatedProducts = [...invoice.products];
    updatedProducts[index][field] = value;
    if (field === 'quantity' || field === 'rate') {
      updatedProducts[index].amount = updatedProducts[index].quantity * updatedProducts[index].rate;
    }
    setInvoice((prev) => ({ ...prev, products: updatedProducts }));
  };

  const handleProductRemove = (index) => {
    const updatedProducts = [...invoice.products];
    updatedProducts.splice(index, 1);
    setInvoice((prev) => ({ ...prev, products: updatedProducts }));
  };

  useEffect(() => {
    const total = invoice.products.reduce((sum, item) => sum + item.amount, 0);
    setInvoice((prev) => ({ ...prev, totalAmount: total }));
  }, [invoice.products]);

  const handleSave = async () => {
    try {
      const payload = {
        ...invoice,
        customer: invoice.customer._id,
        products: invoice.products.map(p => ({...p, product: p.product._id}))
      }
      if (id) {
        await api.put(`/invoices/${id}`, payload);
      } else {
        await api.post('/invoices', payload);
      }
      navigate('/invoices');
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  if (loadingCustomers || loadingProducts || loadingInvoice) {
    return <Typography variant="h5">Loading Invoice Form...</Typography>;
  }

  return (
    <PageLayout title={id ? 'Edit Invoice' : 'New Invoice'}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>{id ? 'Edit Invoice' : 'New Invoice'}</Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Invoice Number"
              value={invoice.invoiceNumber}
              onChange={(e) => setInvoice((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.name}
              value={invoice.customer}
              onChange={handleCustomerChange}
              renderInput={(params) => <TextField {...params} label="Customer" />}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Status</InputLabel>
              <Select
                value={invoice.paymentStatus}
                onChange={(e) => setInvoice((prev) => ({ ...prev, paymentStatus: e.target.value }))}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Products</Typography>
        <Autocomplete
          options={products}
          getOptionLabel={(option) => option.name}
          onChange={handleProductAdd}
          renderInput={(params) => <TextField {...params} label="Add Product" />}
          sx={{ mb: 2 }}
        />
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Rate</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoice.products.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product.name}</TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.rate}
                      onChange={(e) => handleProductChange(index, 'rate', e.target.value)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.amount}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleProductRemove(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h5" align="right" sx={{ mt: 3 }}>Total: {invoice.totalAmount}</Typography>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button variant="outlined" startIcon={<CancelIcon />} onClick={() => navigate('/invoices')}>Cancel</Button>
          <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>Save Invoice</Button>
        </Stack>
      </Paper>
    </PageLayout>
  );
};

export default InvoiceForm;