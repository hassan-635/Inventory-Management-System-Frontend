import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, LayoutDashboard } from 'lucide-react';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        if (email && password) {
            // Dummy authentication
            navigate('/products');
        }
    };

    return (
        <div className="login-container">
            {/* Background Glow Effects */}
            <div className="glow-orb top-left"></div>
            <div className="glow-orb bottom-right"></div>

            <div className="login-box glass-panel animate-fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <LayoutDashboard size={36} color="var(--accent-primary)" />
                    </div>
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to your salesman account</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail className="input-icon" size={20} />
                            <input
                                type="email"
                                className="input-field with-icon"
                                placeholder="sales@inventorypro.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                            <Lock className="input-icon" size={20} />
                            <input
                                type="password"
                                className="input-field with-icon"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-actions">
                        <label className="checkbox-wrapper">
                            <input type="checkbox" />
                            <span className="checkbox-custom"></span>
                            Remember me
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>

                    <button type="submit" className="btn-primary login-btn">
                        <span>Sign In</span>
                        <LogIn size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
