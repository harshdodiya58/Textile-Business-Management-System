import React from 'react';
import { Typography, Box, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

const HomePage = () => {
  return (
    <PageLayout title="Welcome">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" gutterBottom>
          Welcome to Textile Management System
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Streamline your textile business operations with ease.
        </Typography>
        <Stack direction="row" spacing={2} mt={3}>
          <Button variant="contained" component={Link} to="/products">
            Manage Products
          </Button>
          <Button variant="outlined" component={Link} to="/invoices">
            View Invoices
          </Button>
        </Stack>
      </Box>
    </PageLayout>
  );
};

export default HomePage;
