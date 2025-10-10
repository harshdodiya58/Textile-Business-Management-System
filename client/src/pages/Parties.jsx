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
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Grid,
  Stack,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import { formatINR } from '../utils/currency';
import PageLayout from '../components/PageLayout';

const Parties = () => {
  const [parties, setParties] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentParty, setCurrentParty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchParties();
  }, []);

  const fetchParties = async () => {
    try {
      const response = await api.get('/parties');
      if (Array.isArray(response.data.data)) {
        setParties(response.data.data);
      } else {
        console.error('API response data is not an array:', response.data);
        setParties([]); // Ensure parties is always an array
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
      setParties([]); // Ensure parties is always an array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredParties = parties.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.contactPerson || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.paymentStatus || '').toLowerCase().includes(q)
    );
  });

  const handleClickOpen = (party) => {
    setCurrentParty(party);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentParty(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate phone
    if (!currentParty?.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,15}$/.test(currentParty.phone)) {
      newErrors.phone = 'Phone number must be between 10-15 digits and can contain +, -, spaces, and parentheses';
    }
    
    // Validate email if provided
    if (currentParty?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentParty.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate name
    if (!currentParty?.name?.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Validate type
    if (!currentParty?.type) {
      newErrors.type = 'Type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      if (currentParty._id) {
        await api.put(`/parties/${currentParty._id}`, currentParty);
      } else {
        await api.post('/parties', currentParty);
      }
      fetchParties();
      handleClose();
    } catch (error) {
      console.error('Error saving party:', error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/parties/${id}`);
      fetchParties();
    } catch (error) {
      console.error('Error deleting party:', error);
    }
  };

  const handleTogglePaymentStatus = async (party) => {
    try {
      const newStatus = party.paymentStatus === 'Paid' ? 'Pending' : 'Paid';
      await api.put(`/parties/${party._id}`, { ...party, paymentStatus: newStatus });
      fetchParties();
    } catch (error) {
      console.error('Error updating payment status:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentParty((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
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
    return <Typography variant="h5">Loading Parties...</Typography>;
  }

  return (
    <PageLayout title="Parties">
      <motion.div initial="hidden" animate="visible" variants={containerVariants}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Stack>
            <Typography variant="h4">Parties</Typography>
            <TextField
              placeholder="Search parties by name, contact, phone, email, or payment status"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mt: 1, width: 400 }}
            />
          </Stack>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleClickOpen({})}>
            Add Party
          </Button>
        </Stack>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                {/* <TableCell>Payment Status</TableCell> */}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredParties.map((party) => (
                <motion.tr key={party._id} variants={itemVariants}>
                  <TableCell>{party.name}</TableCell>
                  <TableCell>{party.type}</TableCell>
                  <TableCell>{party.contactPerson}</TableCell>
                  <TableCell>{party.phone}</TableCell>
                  <TableCell>{party.email}</TableCell>
                  {/* <TableCell>
                    <Chip 
                      label={party.paymentStatus || 'Pending'} 
                      color={party.paymentStatus === 'Paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell> */}
                  <TableCell>
                    {/* <IconButton 
                      onClick={() => handleTogglePaymentStatus(party)}
                      title={`Mark as ${party.paymentStatus === 'Paid' ? 'Pending' : 'Paid'}`}
                      color={party.paymentStatus === 'Paid' ? 'success' : 'warning'}
                    >
                      <PaymentIcon />
                    </IconButton> */}
                    <IconButton onClick={() => handleClickOpen(party)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(party._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </motion.div>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{currentParty?._id ? 'Edit Party' : 'Add Party'}</DialogTitle>
        <DialogContent>
          {errors.general && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errors.general}
            </Typography>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Name"
                fullWidth
                required
                value={currentParty?.name || ''}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={currentParty?.type || ''}
                  onChange={(e) => {
                    handleChange(e);
                    if (errors.type) {
                      setErrors((prev) => ({ ...prev, type: '' }));
                    }
                  }}
                >
                  <MenuItem value="Customer">Customer</MenuItem>
                  <MenuItem value="Supplier">Supplier</MenuItem>
                </Select>
                {errors.type && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                    {errors.type}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="contactPerson"
                label="Contact Person"
                fullWidth
                value={currentParty?.contactPerson || ''}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="phone"
                label="Phone"
                fullWidth
                required
                value={currentParty?.phone || ''}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone || 'Format: +91-1234567890 or 1234567890'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email"
                type="email"
                fullWidth
                value={currentParty?.email || ''}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email || 'Optional: example@domain.com'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={currentParty?.address || ''}
                onChange={handleChange}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Status</InputLabel>
                <Select
                  name="paymentStatus"
                  value={currentParty?.paymentStatus || 'Pending'}
                  onChange={(e) => {
                    handleChange(e);
                  }}
                >
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                </Select>
              </FormControl>
            </Grid> */}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default Parties;
