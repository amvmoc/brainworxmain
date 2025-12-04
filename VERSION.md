# Version History

## v1.0.3 (2025-11-27)
- **Fixed:** Added exit button to Franchise Owner Login page
- Users can now click X button to sign out and return to main page
- Exit button logs out user and redirects to homepage
- **New:** Created comprehensive README.md file
- Version number now prominently displayed at top of README
- Clear documentation structure for GitHub visibility
- Badge showing current version (v1.0.3)
- Quick links section for easy navigation

## v1.0.2 (2025-11-27)
- Renamed all "hardwire/hardwires" terminology to "Neural Imprint Patterns" throughout the codebase
- Updated component names:
  - HardwiresHistogram → NeuralImprintPatternsHistogram
  - HardwiresInfo → NeuralImprintPatternsInfo
- Updated interface names:
  - HardwireScore → NeuralImprintPatternScore
  - HardwiresInfoProps → NeuralImprintPatternsInfoProps
  - HardwiresHistogramProps → NeuralImprintPatternsHistogramProps
- Updated constant names:
  - HARDWIRE_DEFINITIONS → NEURAL_IMPRINT_PATTERN_DEFINITIONS
- Updated variable names throughout:
  - hardwireScores → neuralImprintPatternScores
  - topHardwires → topPatterns
  - lowestHardwires → lowestPatterns
  - calculateHardwireScores → calculatePatternScores
- Updated all references in:
  - AnalysisReport.tsx
  - SampleAnalysisDemo.tsx
  - QuestionComparison.tsx
  - GetStartedOptions.tsx
  - All histogram and info components
- Improved terminology consistency across the application

## v1.0.1 (2025-11-27)
- Added prominent exit buttons (X) to all modal screens
- Improved button visibility with:
  - White rounded backgrounds
  - Shadow effects
  - Border styling
  - Hover animations
  - Tooltip text "Exit and return to main page"
- Updated exit buttons in:
  - Main questionnaire screens
  - Self-assessment questionnaires
  - Round 2 questionnaires
  - Analysis report screens
  - Hardwires info screen
  - All customer forms
- Enhanced user experience with clearer navigation options

## v1.0.0 (2025-11-27)
- Initial production release
- Added version tracking system
- Version number displayed in:
  - Main site footer
  - Franchise dashboard header
  - Super admin dashboard header
- Fixed cache issues by implementing version display
- Complete assessment system
- Franchise management system
- Invoice generation and tracking
- Self-assessment questionnaires
- Email verification system
- Super admin capabilities

---

## How to Update Version

When making updates:
1. Update version in `package.json`
2. Update version in `src/App.tsx` (footer)
3. Update version in `src/components/FranchiseDashboard.tsx` (header)
4. Update version in `src/components/SuperAdminDashboard.tsx` (header)
5. Add entry to this VERSION.md file with date and changes
6. Run `npm run build` before deploying
7. Commit and push to GitHub
8. Deploy to Vercel

Version Format: MAJOR.MINOR.PATCH
- MAJOR: Breaking changes
- MINOR: New features
- PATCH: Bug fixes
