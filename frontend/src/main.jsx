import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from "react-hot-toast";
import { BrowserRouter, HashRouter } from 'react-router-dom';
import { useHashRouter } from './library/baseUrl.js';

const Router = useHashRouter ? HashRouter : BrowserRouter;

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <Toaster/>
    <Router>
    <App  className="bg-base-100"/> 
    </Router>
  </AuthProvider>
)
