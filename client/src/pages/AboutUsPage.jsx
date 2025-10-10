import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import SpeedIcon from '@mui/icons-material/Speed';
import InsightsIcon from '@mui/icons-material/Insights';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import PeopleIcon from '@mui/icons-material/People';

const Feature = ({ icon, title, body, color = 'primary.main' }) => (
  <Card
    component={motion.div}
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.98 }}
    sx={{ borderRadius: 2 }}
  >
    <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
      <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>{icon}</Avatar>
      <Box>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>{body}</Typography>
      </Box>
    </CardContent>
  </Card>
);

const AboutUsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45 }}
    >
      <Paper sx={{ p: 4, overflow: 'hidden' }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }} gutterBottom>
                Textile Management, reimagined
              </Typography>
              <Typography variant="h6" color="text.secondary" paragraph>
                A lightweight, focused system to manage inventory, parties and invoices with beautiful insights — built for textile businesses.
              </Typography>
            </Box>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Feature
                  icon={<SpeedIcon />}
                  title="Fast & Reliable"
                  body="Optimized flows for quick invoicing and stock updates."
                  color="primary.main"
                />
              </Grid>
              <Grid item xs={6}>
                <Feature
                  icon={<InsightsIcon />}
                  title="Actionable Insights"
                  body="Visualize sales, inventory and party metrics to make better decisions."
                  color="secondary.main"
                />
              </Grid>
              <Grid item xs={6} sx={{ mt: 2 }}>
                <Feature
                  icon={<Inventory2Icon />}
                  title="Inventory Control"
                  body="Track stock, set reorder points and avoid stockouts."
                  color="info.main"
                />
              </Grid>
              <Grid item xs={6} sx={{ mt: 2 }}>
                <Feature
                  icon={<PeopleIcon />}
                  title="Customer & Supplier Management"
                  body="Keep party records, credit balances and contact history in one place."
                  color="success.main"
                />
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: 380, height: 320, borderRadius: 4, background: 'linear-gradient(135deg, rgba(129,199,132,0.12), rgba(100,181,246,0.08))', display: 'flex', flexDirection: 'column', p: 3, gap: 2 }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>Why choose us</Typography>
                <Typography color="text.secondary">We focus on clarity and speed — essential for daily operations. Attractive UI backed by reliable backend services.</Typography>
                <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>99.9%</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 12 }}>Uptime</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>₹</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 12 }}>Indian currency support</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 700 }}>Secure</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: 12 }}>Data protection</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </motion.div>
  );
};

export default AboutUsPage;
