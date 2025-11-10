import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, Plus, X, ExternalLink, TrendingUp, DollarSign } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import toast from 'react-hot-toast';

const AIGiftSuggestions = ({ onAddToList, currentUser }) => {
  const [prompt, setPrompt] = useState('');
  const [budget, setBudget] = useState('40');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(cooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const generateSuggestions = async () => {
    if (!prompt.trim()) {
      toast.error('Veuillez décrire vos intérêts');
      return;
    }

    if (!budget || parseFloat(budget) <= 0) {
      toast.error('Veuillez entrer un budget valide');
      return;
    }

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

    if (!apiKey) {
      toast.error('Clé API manquante.');
      return;
    }

    setLoading(true);
    setShowSuggestions(true);

    try {
      // Initialiser le client avec la clé API
      const ai = new GoogleGenAI({ apiKey });

      const enhancedPrompt = `Tu es un assistant expert en suggestions de cadeaux pour les fêtes au Canada.

CONTEXTE:
Description des intérêts: "${prompt}"
Budget par article: ${budget}$ CAD (flexible ±10$)

MISSION:
Génère EXACTEMENT 4 suggestions de cadeaux créatives, variées et ACHETABLES au Canada.

RÈGLES CRITIQUES:
1. Prix réalistes entre ${Math.max(1, parseFloat(budget) - 10)}$ et ${parseFloat(budget) + 10}$ CAD
2. Produits RÉELS disponibles au Canada/Québec
3. Variété: 1 tech/gadget, 1 loisir/hobby, 1 pratique/utile, 1 surprise/original
4. Descriptions concises mais évocatrices (max 80 caractères)
5. Noms de produits PRÉCIS avec marques si possible (ex: "Kindle Paperwhite" plutôt que "liseuse électronique")

FORMAT JSON (rien d'autre):
[
  {
    "name": "Nom précis du produit avec marque si pertinent (max 60 char)",
    "description": "Description courte et attrayante (max 80 char)",
    "estimatedPrice": "${Math.max(1, parseFloat(budget) - 5)}-${parseFloat(budget) + 5}$",
    "category": "Tech|Loisir|Pratique|Surprise"
  }
]

EXEMPLES DE BONNES SUGGESTIONS:
- "Anker PowerCore 10000mAh" plutôt que "batterie portable"
- "Moleskine Classic Notebook" plutôt que "carnet"
- "Chemex 6-Cup Coffee Maker" plutôt que "cafetière"

IMPORTANT: Réponds UNIQUEMENT avec le JSON, aucun texte`;

      let response;
      const models = [
        "gemini-2.5-flash-lite",      // Gemini 2.5 lite (le plus récent et léger)
        "gemini-2.0-flash-lite",      // Gemini 2.0 lite
        "gemini-2.0-flash-exp",       // Gemini 2.0 expérimental
        "gemini-1.5-flash"            // Fallback 1.5 (stable)
      ];

      for (const modelName of models) {
        try {
          console.log(`Tentative avec le modèle: ${modelName}`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: enhancedPrompt,
          });
          console.log(`✅ Succès avec ${modelName}`);
          break;
        } catch (modelError) {
          console.warn(`❌ Échec avec ${modelName}:`, modelError.message);
          if (modelName === models[models.length - 1]) {
            throw modelError;
          }
          continue;
        }
      }

      const text = response.text;

      let cleanedText = text.trim();

      cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');

      const firstBracket = cleanedText.indexOf('[');
      const lastBracket = cleanedText.lastIndexOf(']');

      if (firstBracket !== -1 && lastBracket !== -1) {
        cleanedText = cleanedText.substring(firstBracket, lastBracket + 1);
      }

      const parsedSuggestions = JSON.parse(cleanedText);

      if (!Array.isArray(parsedSuggestions) || parsedSuggestions.length === 0) {
        throw new Error('Format de réponse invalide');
      }

      const suggestionsWithLinks = parsedSuggestions.map(suggestion => {
        const searchQuery = encodeURIComponent(suggestion.name);
        const amazonLink = `https://www.amazon.ca/s?k=${searchQuery}`;
        
        return {
          ...suggestion,
          link: amazonLink
        };
      });

      setSuggestions(suggestionsWithLinks);
      toast.success(`${suggestionsWithLinks.length} suggestions générées ! 🎁`);

      setCooldown(60);

    } catch (error) {
      console.error('Erreur:', error);

      // Gérer spécifiquement l'erreur 429 (quota exceeded)
      if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Quota exceeded')) {
        toast.error('Quota API Gemini dépassé. Attendez quelques minutes ou régénérez votre clé API sur https://aistudio.google.com/app/apikey', { duration: 6000 });
      } else if (error.message?.includes('API key') || error.message?.includes('401')) {
        toast.error('Clé API invalide. Vérifiez votre clé sur https://aistudio.google.com/app/apikey');
      } else if (error.message?.includes('model')) {
        toast.error('Modèle non disponible. Essayez de régénérer votre clé API.');
      } else {
        toast.error('Erreur lors de la génération. Réessayez dans quelques instants.');
      }

      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = (suggestion) => {
    if (onAddToList) {
      const productLink = suggestion.link || suggestion.searchUrl || '';
      onAddToList(suggestion.name, productLink, true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateSuggestions();
    }
  };

  return (
    <div className="mb-6 p-6 bg-gradient-to-br from-purple-900/20 via-dark-800/50 to-dark-900/50 backdrop-blur-sm border border-purple-500/30 rounded-2xl shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-purple-600/30 to-purple-700/20 rounded-xl">
          <Wand2 className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-dark-100 flex items-center gap-2">
            Assistant IA - Suggestions de cadeaux
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
          </h3>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/20 to-blue-800/20 border border-blue-500/30 rounded-xl">
        <p className="text-sm text-blue-400 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <span>Décrivez vos intérêts et votre budget, l'IA vous suggérera 4 idées de cadeaux autour de ce prix</span>
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex: J'aime la technologie, le gaming, la lecture de science-fiction et le café..."
            className="w-full px-4 py-3 pr-12 bg-dark-900/50 border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all text-dark-100 placeholder-dark-500 resize-none"
            rows="3"
            disabled={loading}
          />
          <div className="absolute bottom-3 right-3 text-xs text-dark-500">
            {prompt.length}/500
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Budget ciblé par article
          </label>
          <div className="relative">
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="1"
              step="1"
              className="w-full px-4 py-3 pr-12 bg-dark-900/50 border-2 border-purple-500/30 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500/50 outline-none transition-all text-dark-100 placeholder-dark-500"
              placeholder="40"
              disabled={loading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 font-semibold">
              $
            </div>
          </div>
        </div>

        <button
          onClick={generateSuggestions}
          disabled={loading || !prompt.trim() || !budget || parseFloat(budget) <= 0}
          className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 text-white py-3 rounded-xl hover:from-purple-500 hover:to-purple-600 transition-all shadow-lg hover:shadow-purple-500/50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Générer des suggestions
            </>
          )}
        </button>
      </div>

      {showSuggestions && (
        <div className="mt-6 space-y-4 animate-slide-down">
          {loading && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 text-purple-500 mx-auto mb-4 animate-spin" />
              <p className="text-dark-300 font-medium">L'IA réfléchit à vos suggestions...</p>
              <p className="text-dark-500 text-sm mt-2">Cela peut prendre quelques secondes</p>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-dark-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Suggestions générées ({suggestions.length})
                </h4>
                <button
                  onClick={() => {
                    setShowSuggestions(false);
                    setSuggestions([]);
                    setPrompt('');
                  }}
                  className="text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-dark-800/60 to-dark-900/60 backdrop-blur-sm p-4 rounded-xl border border-purple-500/20 hover:border-purple-500/50 transition-all group animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h5 className="font-bold text-dark-100 group-hover:text-purple-400 transition-colors">
                            {suggestion.name}
                          </h5>
                          {suggestion.category && (
                            <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-semibold border border-purple-500/30">
                              {suggestion.category}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-dark-400 mb-2 line-clamp-2">
                          {suggestion.description}
                        </p>
                        <div className="flex items-center gap-3 flex-wrap">
                          {suggestion.estimatedPrice && (
                            <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-semibold border border-emerald-500/30">
                              💰 {suggestion.estimatedPrice}
                            </span>
                          )}
                          {(suggestion.link || suggestion.searchUrl) && (
                            <a
                              href={suggestion.link || suggestion.searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Voir le produit
                            </a>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAddClick(suggestion)}
                        className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/50 group/btn"
                      >
                        <Plus className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={generateSuggestions}
                  disabled={loading || cooldown > 0}
                  className="flex-1 bg-dark-700/50 hover:bg-dark-600/50 backdrop-blur-sm text-dark-200 py-2 rounded-lg font-semibold text-sm border border-white/10 hover:border-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `🔄 Régénérer (${cooldown}s)` : '🔄 Régénérer'}
                </button>
              </div>
            </>
          )}

          {!loading && suggestions.length === 0 && showSuggestions && (
            <div className="text-center py-8 bg-red-900/20 border border-red-500/30 rounded-xl">
              <p className="text-red-400 font-medium">Aucune suggestion générée</p>
              <p className="text-red-300 text-sm mt-2">Essayez de reformuler votre demande</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIGiftSuggestions;