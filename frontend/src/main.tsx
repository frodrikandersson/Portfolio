import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App';
import "./index.css";
import { GoogleOAuthProvider } from '@react-oauth/google';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById('root')!).render(
    <HelmetProvider>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </HelmetProvider>
);
