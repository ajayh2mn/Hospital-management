import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * index.js — the entry point of the React application.
 * React 18 uses createRoot() instead of the old ReactDOM.render().
 * This mounts the App component into the <div id="root"> in public/index.html.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
