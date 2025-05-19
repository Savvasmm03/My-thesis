import React from 'react';
import ReactMarkdown from 'react-markdown';

const AIResponseViewer = ({ aiResponse }) => {
  return (
    <div style={styles.container}>
      <h2>Απάντηση AI</h2>
      <ReactMarkdown children={aiResponse} />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '40px auto',
    padding: '20px',
    backgroundColor: '#ffffff',
    color: '#000000',
    fontFamily: 'Arial, sans-serif',
    lineHeight: 1.6,
    fontSize: '16px',
    borderRadius: '8px',
    boxShadow: '0 0 8px rgba(0,0,0,0.05)'
  }
};

export default AIResponseViewer;
