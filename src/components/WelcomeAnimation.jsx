import React, { useEffect, useState } from 'react';
import { Sparkles, Gift } from 'lucide-react';
import confetti from 'canvas-confetti';

const WelcomeAnimation = ({ username, onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#dc2626', '#fbbf24', '#10b981']
    });

    const timer1 = setTimeout(() => setStep(1), 500);
    const timer2 = setTimeout(() => setStep(2), 1500);
    const timer3 = setTimeout(() => {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#dc2626', '#fbbf24', '#10b981'],
        ticks: 200,
        gravity: 1,
        decay: 0.94,
        startVelocity: 30,
      });
    }, 2000);
    const timer4 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950 flex items-center justify-center overflow-hidden">
      {/* Particules décoratives */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-3 h-3 bg-primary rounded-full animate-float opacity-60"></div>
        <div className="absolute top-20 right-20 w-4 h-4 bg-emerald-500 rounded-full animate-float opacity-60" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-gold rounded-full animate-float opacity-60" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/3 right-1/3 w-4 h-4 bg-primary rounded-full animate-float opacity-60" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute bottom-32 right-10 w-3 h-3 bg-emerald-500 rounded-full animate-float opacity-60" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Contenu principal */}
      <div className="relative text-center px-4 max-w-2xl">
        {/* Icône festive */}
        <div
          className={`mb-8 transition-all duration-700 ${step >= 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary via-gold to-emerald-500 rounded-full shadow-2xl shadow-primary/50 animate-float">
            <span className="text-6xl">🎄</span>
          </div>
        </div>

        {/* Message de bienvenue */}
        <div
          className={`mb-8 transition-all duration-700 delay-300 ${step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-gold to-emerald-500 bg-clip-text text-transparent flex items-center justify-center gap-3 flex-wrap">
            <Sparkles className="w-8 h-8 text-gold animate-pulse" />
            Joyeux temps des fêtes!
            <Sparkles className="w-8 h-8 text-gold animate-pulse" />
          </h1>
          <p className="text-2xl md:text-3xl text-dark-200 font-medium">
            Bienvenue <span className="text-primary font-bold">{username}</span>! 🎁
          </p>
        </div>

        {/* Message secondaire */}
        <div
          className={`transition-all duration-900 delay-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 backdrop-blur-sm rounded-full border border-emerald-500/30">
            <Gift className="w-6 h-6 text-emerald-500 animate-float" />
            <span className="text-emerald-400 font-semibold text-lg">
              Prêt pour l'échange de cadeaux?
            </span>
          </div>
        </div>

        {/* Loading dots */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-gold rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>

      {/* Flocons de neige */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white opacity-70 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
              fontSize: `${10 + Math.random() * 10}px`
            }}
          >
            ❄️
          </div>
        ))}
      </div>
    </div>
  );
};

export default WelcomeAnimation;