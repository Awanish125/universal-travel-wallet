# Dependency Research & Technology Stack Discipline Rules

> **CLASSIFICATION:** User-Defined Mandatory Rules & Baseline Protocol

---

### [USER-DEFINED RULE] Rule 24: Search the Internet for Existing Solutions
Whenever new functionality is requested, determine whether a suitable existing package/library already exists (e.g. count-up number animation). Search Google/web and npm.  
Evaluate: Maintenance, Adoption, React compatibility, TypeScript support, Bundle size, Performance, Accessibility, API quality, License, Offline compatibility, Long-term suitability. Choose the best appropriate solution; do not reinvent functionality unnecessarily.

---

### [USER-DEFINED RULE] Rule 25: Do Not Blindly Add Dependencies
Finding a package does not automatically mean installing it. Before adding a dependency:
1. Check existing project capabilities.
2. Search current official documentation.
3. Compare alternatives.
4. Check whether the feature can reasonably be implemented using existing dependencies.
5. Evaluate long-term cost.

Avoid dependency bloat.

---

### [USER-DEFINED RULE] Rule 26: Prefer Official Documentation
When researching a package/library, prefer Official documentation, Official npm package, Official GitHub repository, Reliable technical sources. Do not select a dependency solely because of a random tutorial or blog.

---

### [USER-DEFINED RULE] Rule 27: Dependency Discipline
Every dependency should have a clear purpose. Do not introduce multiple libraries that solve the same problem. Existing preferred stack should be reused whenever appropriate.

---

### [USER-DEFINED RULE] Rule 67: Preserve the Existing Technology Strategy
Prefer the established project stack:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Base UI
- Motion
- Lucide React
- Dexie
- IndexedDB
- React Hook Form
- Zod
- Recharts
- PWA/service worker architecture

Do not replace major technology choices without a strong reason and appropriate architectural review.

---

### [USER-DEFINED RULE] Rule 68: No Generic UI Framework Mixing
Do not introduce competing primary UI systems such as MUI, Ant Design, Chakra, or Mantine unless explicitly justified and approved. Use the existing design system.
