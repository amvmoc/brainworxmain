# BrainWorx Neural Imprint Assessment Platform

## Current Version: v1.0.3

[![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](VERSION.md)
[![Status](https://img.shields.io/badge/status-production-green.svg)]()
[![Last Updated](https://img.shields.io/badge/updated-2025--11--27-orange.svg)]()

---

## 🚀 Quick Links

- **Live Application**: [View Deployment]
- **Version History**: [VERSION.md](VERSION.md)
- **Latest Release**: v1.0.3 (2025-11-27)

---

## 📋 About

BrainWorx is a comprehensive Neural Imprint Pattern (NIP™) assessment platform designed to evaluate cognitive and emotional profiles through advanced questionnaires and analysis tools.

### Key Features

- **344-Question Neural Imprint Assessment** - Complete cognitive and emotional profiling
- **Self-Assessment Tools** - Teen and Parent ADHD screeners
- **Franchise Management System** - Multi-franchise support with unique coach links
- **Invoice Generation** - Automated billing and tracking
- **Real-time Analysis** - Instant results with detailed NIP™ scoring
- **Email Notifications** - Automated report delivery
- **Progress Tracking** - Save and resume assessments

---

## 🎯 Current Version: v1.0.3

### What's New in v1.0.3

- **Added exit button to Franchise Login page** - Users can now return to main page
- **Created comprehensive README.md** - Clear version visibility in GitHub
- **Exit button signs out user** - Clicking X logs out and returns to homepage

### Recent Updates

**v1.0.2** - Renamed all "hardwire/hardwires" terminology to "Neural Imprint Patterns"
**v1.0.1** - Enhanced UX with prominent exit buttons on all modal screens
**v1.0.0** - Initial production release with full assessment system

[View Complete Version History →](VERSION.md)

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions
- **Icons**: Lucide React
- **Deployment**: Vercel

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Supabase credentials to .env

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🗂️ Project Structure

```
src/
├── components/          # React components
│   ├── AnalysisReport.tsx
│   ├── FranchiseDashboard.tsx
│   ├── NeuralImprintPatternsHistogram.tsx
│   ├── Questionnaire.tsx
│   └── ...
├── data/               # Assessment questions and configurations
├── lib/                # Utilities and Supabase client
└── utils/              # Helper functions

supabase/
├── functions/          # Edge Functions
└── migrations/         # Database migrations
```

---

## 🔧 Configuration

### Environment Variables

Required environment variables (see `.env` file):

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Database Setup

Database migrations are located in `supabase/migrations/`. The system includes:

- User authentication
- Franchise management
- Assessment responses
- Invoice tracking
- Self-assessment responses

---

## 👥 User Roles

1. **Public Users** - Can take assessments via direct or coach links
2. **Franchise Owners** - Access to prospect dashboard and invoicing
3. **Super Admins** - Full system management and franchise creation

---

## 📊 Assessment Types

### Main Assessment (344 Questions)
- 16 Neural Imprint Patterns
- Comprehensive cognitive profiling
- Detailed analysis reports
- Optional Round 2 for deeper insights

### Self-Assessments
- Teen Career & Future Assessment (48 questions)
- Teen ADHD Neural Imprint Screener (48 questions)
- Parent ADHD Neural Imprint Screener (48 questions)

---

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Authenticated-only access to sensitive data
- Secure email verification system
- Protected Edge Functions with JWT validation
- Proper CORS configuration

---

## 📝 License

Proprietary - All rights reserved by BrainWorx

---

## 📧 Support

For support or questions, contact the BrainWorx team.

---

## 🔄 Version Check

**Always check the version number** displayed in:
- Footer of main website: `v1.0.3`
- Franchise dashboard header
- Super admin dashboard header
- This README.md file (top of page)

**Current Version: v1.0.3** | **Last Updated: 2025-11-27**

---

*Transform. Evolve. Thrive.* ✨
