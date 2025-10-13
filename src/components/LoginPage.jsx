import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = ({ loginForm, setLoginForm, handleLogin, loading }) => (
  <div className="min-h-screen bg-gradient-to-br from-beige-light via-cream to-beige flex items-center justify-center px-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-t-4 border-primary">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-stone-800 mb-2">🎄 Secret Santa</h1>
        <p className="text-stone-600">Connectez-vous pour accéder à votre liste</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            value={loginForm.username}
            onChange={(e) => setLoginForm(p => ({ ...p, username: e.target.value }))}
            className="w-full px-4 py-3 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
            placeholder="Entrez votre nom d'utilisateur"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={loginForm.showPassword ? 'text' : 'password'}
              value={loginForm.password}
              onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full px-4 py-3 pr-12 border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
              placeholder="Entrez votre mot de passe"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setLoginForm(p => ({ ...p, showPassword: !p.showPassword }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {loginForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 rounded-lg hover:from-primary-dark hover:to-primary-dark transition shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </div>
  </div>
);

export default LoginPage;