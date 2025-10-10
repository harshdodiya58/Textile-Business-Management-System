import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const pageVariants = {
  hidden: { opacity: 0, y: 8 },
  enter: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
};

const PageLayout = ({ children, title }) => {
  return (
    <motion.div initial="hidden" animate="enter" exit="exit" variants={pageVariants}>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }} elevation={1}>
        {title && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          </Box>
        )}
        <Box>
          {children}
        </Box>
      </Paper>
    </motion.div>
  );
};

export default PageLayout;
