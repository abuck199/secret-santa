import React from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const LoginPage = ({ loginForm, setLoginForm, handleLogin, loading, event }) => {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleLoginWithRecaptcha = async () => {
    if (!executeRecaptcha) {
      console.log('Execute recaptcha not yet available');
      return;
    }

    try {
      const token = await executeRecaptcha('login');
      handleLogin();
    } catch (error) {
      console.error('reCAPTCHA error:', error);
      handleLogin();
    }
  };

  return (
    <div className="login-container min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-primary rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-emerald-500 rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-gold rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-primary rounded-full animate-float opacity-60" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-emerald-500 rounded-full animate-float opacity-60" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent opacity-30"></div>

      <div className="login-box bg-dark-800/80 backdrop-blur-xl rounded-xl shadow-2xl p-6 w-full max-w-md border border-white/10 relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary via-emerald-600 to-gold rounded-full mb-3 shadow-glow-red animate-float">
            <span className="text-3xl">🎄</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
            {event?.name}
            <Sparkles className="w-5 h-5 text-gold animate-pulse" />
          </h1>
          <p className="text-dark-400 text-sm">Connectez-vous pour accéder à la magie des fêtes</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={loginForm.username}
              onChange={(e) => setLoginForm(p => ({ ...p, username: e.target.value }))}
              className="w-full px-4 py-3 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary/50 outline-none transition-all text-dark-100 placeholder-dark-500"
              placeholder="Entrez votre nom d'utilisateur"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-dark-300 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={loginForm.showPassword ? 'text' : 'password'}
                value={loginForm.password}
                onChange={(e) => setLoginForm(p => ({ ...p, password: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleLoginWithRecaptcha()}
                className="w-full px-4 py-3 pr-12 bg-dark-900/50 border-2 border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary/50 outline-none transition-all text-dark-100 placeholder-dark-500"
                placeholder="Entrez votre mot de passe"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setLoginForm(p => ({ ...p, showPassword: !p.showPassword }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-200 transition-colors"
              >
                {loginForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            onClick={handleLoginWithRecaptcha}
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary via-primary-600 to-primary-dark text-white py-3.5 rounded-xl hover:from-primary-dark hover:to-primary transition-all shadow-lg hover:shadow-glow-red font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  Se connecter
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>

          <div className="text-center pt-2">
            <p className="text-xs text-dark-500 leading-relaxed">
              Ce site est protégé par reCAPTCHA et soumis à la{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary transition-colors underline"
              >
                Politique de confidentialité
              </a>
              {' '}et aux{' '}
              <a
                href="https://policies.google.com/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-dark-400 hover:text-primary transition-colors underline"
              >
                Conditions d'utilisation
              </a>
              {' '}de Google.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center justify-center gap-2 text-xs text-dark-500">
            <span className="inline-block w-8 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></span>
            <span>Organisez vos cadeaux avec style</span>
            <span className="inline-block w-8 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;