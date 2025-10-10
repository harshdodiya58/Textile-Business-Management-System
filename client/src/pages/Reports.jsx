import React from 'react';
import { Tabs, Tab, Box, Typography, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import SalesReport from '../components/reports/SalesReport';
import InventoryReport from '../components/reports/InventoryReport';
import PartyReport from '../components/reports/PartyReport';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Reports = () => {
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            📊 Reports & Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Comprehensive insights and detailed reports for your textile business
          </Typography>
        </Box>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              p: 2,
            }}
          >
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="report tabs"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minHeight: 64,
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white',
                  height: 3,
                },
              }}
            >
              <Tab icon={<AssessmentIcon />} label="Sales Report" iconPosition="start" />
              <Tab icon={<InventoryIcon />} label="Inventory Report" iconPosition="start" />
              <Tab icon={<PeopleIcon />} label="Party Report" iconPosition="start" />
            </Tabs>
          </Box>
          <TabPanel value={value} index={0}>
            <SalesReport />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <InventoryReport />
          </TabPanel>
          <TabPanel value={value} index={2}>
            <PartyReport />
          </TabPanel>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Reports;
