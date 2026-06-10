# Journal de session

## 2026-06-10 — Démarrage projet « Aperçu PJ »

### Contexte
PME charpente/couverture/zinguerie, ~ dizaines de mails/jour avec PDF (CR de chantier, devis, factures, BC). Objectif : supprimer le clic d'ouverture de PDF dans TB.

### Environnement détecté
- Thunderbird 151.0.1 (`C:\Program Files\Mozilla Thunderbird\thunderbird.exe`)
- Windows 11, 2 postes (PC fixe + Surface Pro)
- Comptes IMAP Jimdo + Orange

### Phase de validation d'architecture
8 questions posées, 8 réponses validées (cf. CLAUDE.md tableau de décisions).

### Itérations prévues
1. ✅ Squelette + manifest MV3 + docs d'architecture
2. ⏳ Téléchargement PDF.js legacy bundle
3. ⏳ background.js : détection + endpoint getPdf
4. ⏳ content/inject.js : injection iframe viewer
5. ⏳ viewer/* : UI + PDF.js + toolbar + registre actions
6. ⏳ options/* : taille max, comportement par défaut
7. ⏳ locales FR + icônes
8. ⏳ README + procédure de test + git init

### Points à revérifier en cours d'implémentation
- Sérialisation `getAttachmentFile()` → ArrayBuffer côté background, transfert via `runtime.sendMessage`
- CSP de la page extension viewer suffisamment permissive pour PDF.js (workers, blob URLs)
- Compatibilité `message_display_scripts` MV3 dans TB 151 (à confirmer au premier test in-app)
