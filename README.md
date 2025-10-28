# 🎄 Secret Santa

Application web pour organiser des échanges de cadeaux de Noël. Créez vos listes, réservez anonymement et découvrez votre attribution secrète !

![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=flat-square&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Fonctionnalités principales

- 📝 Listes de souhaits avec drag & drop
- 🤖 **Assistant IA** (Google Gemini) pour suggestions de cadeaux
- 🎁 Réservations anonymes
- 🎲 Système d'attribution Secret Santa
- 👤 Participants "hors-tirage" (liste seulement, pas de pige)
- 📧 Notifications email automatiques
- 📱 Responsive mobile/desktop
- 🎨 Interface dark mode festive

## 🚀 Installation rapide

```bash
# Cloner et installer
git clone https://github.com/votre-username/secret-santa.git
cd secret-santa
npm install

# Créer .env avec vos clés
cp .env.example .env
# Éditer .env avec vos credentials Supabase, EmailJS et Gemini

# Lancer
npm start

## 🛠️ Stack

- **React 18** + Tailwind CSS
- **Supabase** (PostgreSQL)
- **EmailJS** (notifications)
- **Google Gemini 2.0** (assistant IA)
- **@dnd-kit** (drag & drop)
- **bcrypt.js** (sécurité)

---

Made with ❄️ by Buck