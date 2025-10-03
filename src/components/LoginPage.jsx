import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ loginForm, setLoginForm, handleLogin, error, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-beige-light via-cream to-beige flex items-center justify-center p-4">
    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-beige-dark">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-stone-800">Noël 2025</h1>
      </div>

      {error && <div className="bg-red-50 border-l-4 border-red-600 text-red-900 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Nom d'utilisateur</label>
          <input 
            type="text" 
            value={loginForm.username}
            onChange={(e) => setLoginForm(p => ({ ...p, username: e.target.value }))}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-2 border-2 border-beige-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
            disabled={loading} 
            autoComplete="username" 
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1">Mot de passe</label>
          <div className="relative">
            <input 
              type={loginForm.showPassword ? 'text' : 'password'} 
              value={loginForm.password}
              onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-2 border-2 border-beige-dark rounded-lg focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
              disabled={loading}
              autoComplete="current-password" 
            />
            <button 
              type="button" 
              onClick={() => setLoginForm(p => ({ ...p, showPassword: !p.showPassword }))}
              className="absolute right-3 top-2.5 text-stone-500 hover:text-stone-700"
            >
              {loginForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          onClick={handleLogin} 
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark shadow-lg font-semibold disabled:opacity-50 transition"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>

      <div className="mt-6 text-center">
        <p className="text-stone-500 text-sm">Pas de compte? Contactez l'administrateur</p>
      </div>
    </div>
  </div>
);

export default LoginPage;