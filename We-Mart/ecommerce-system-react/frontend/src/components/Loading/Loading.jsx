import React from 'react';
import { motion } from 'framer-motion';
import './Loading.css';

const Loading = ({ message = "Loading..." }) => {
  return (
    <motion.div
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      {message && <p className="loading-message">{message}</p>}
    </motion.div>
  );
};

export default Loading;
