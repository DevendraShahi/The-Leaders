# The Leaders - Nepal's Political Archive

**The Leaders** is a premium digital archive and political information platform dedicated to Nepal's democratic history and the 2026 General Election. It serves as a comprehensive repository for political discourse, historical timelines, and well-reasoned debate.

![The Leaders Banner](/public/images/banner-placeholder.jpg)

---

## 🏛️ Purpose & Mission

**The Leaders** stands as the **Grand Central Station for political information**—a central hub where depth meets history. It provides architectural blueprints for citizens to build their own informed perspective on Nepali politics.

### Core Values
- **Truth is Our North Star**: Unwavering commitment to facts and absolute integrity.
- **Expression Without Imposition**: Bold expression without demanding agreement.
- **The Archive of Interest**: A curated repository for historical significance.
- **Forged in Debate**: Believing that the best ideas emerge from rigorous dialogue and friction.

---

## 🎨 Design System

Designed with a "Soft Paper Archive" aesthetic in light mode and "Deep Charcoal" in dark mode, the platform combines historical gravity with modern digital storytelling.

### 1. Typography
We use a distinct pairing to separate editorial content from historical data.

| Type | Font Family | Usage |
|------|-------------|-------|
| **Headings** | `Bebas Neue` | Section titles, Hero text, Impact statements. Always uppercase, wide tracking. |
| **Body** | `Manrope` | Article text, UI elements, descriptions. Clean and legible. |
| **Accents** | `Anton`, `Cinzel`, `Oswald` | Specialized use in specific historical contexts or hero banners. |

**Scale:**
- **Headline (H1)**: `text-4xl` to `text-6xl`. Uppercase.
- **Section Title (H2)**: `text-3xl`. Tracking-wide.
- **Body**: `text-base` or `text-sm` for UI details.

### 2. Color Palette
A strictly defined palette ensuring high contrast and premium feel.

| Variable | Light Mode (Hex) | Dark Mode (Hex) | Purpose |
|----------|------------------|-----------------|---------|
| `--primary` | `#B71C1C` | `#B71C1C` | Brand Red. Used for CTAs, active states, and emphasis. |
| `--background` | `#FFFFFF` | `#121212` | Main page background. |
| `--card` | `#FFFFFF` | `#1E1E1E` | Card surfaces. |
| `--foreground` | `#121212` | `#FFFFFF` | Primary text color. |
| `--muted` | `#FAFAFA` | `#2A2A2A` | Secondary backgrounds. |
| `--border` | `#E0E0E0` | `#333333` | Subtle dividers. |

### 3. Surface & Components
- **Buttons**:
  - **Shape**: Slightly rounded (`0.25rem` / 4px radius).
  - **Interaction**: Scale down (`0.98`) on click, Scale up (`1.02`) on hover.
  - **Style**: Solid Primary or Outline with `border-border`.
- **Cards**:
  - **Shape**: Rounded corners (`rounded-xl` / 12px).
  - **Style**: Bordered, minimal shadow (`shadow-sm`), opaque background.
- **Micro-Interactions**:
  - **Links**: Underline offset animations.
  - **Page**: Smooth transitions between routes.

### 4. Theme Preferences
The application supports a user-preference based theme system.
- **Engine**: `next-themes`.
- **Storage**: Persisted in `localStorage` key `theme`.
- **Default**: System preference (falls back to Dark).
- **Toggle**: Available in the navigation bar (Highlights user choice).

---

## ✨ Key Features

### ✅ Live & Operational
- **Election 2026 Hub**: Real-time countdown to March 5, 2026, live analytics dashboard, and interactive district maps.
- **The Archives**: Searchable repository of articles ("News & Perspectives") and historical documents.
- **History Timeline**: "Timeline of Chaos" - a comprehensive journey through Nepal's political milestones.
- **Leader Profiles**: "The Roster" - searchable directory of historical and contemporary figures.
- **Bilingual Support**: Instant toggle between English and Nepali content.

### 🚧 Roadmap
- **Coalition Tracker**: Visualizing party alliances and the ecosystem.
- **Advanced Search**: Full-text indexing of the historical archive.
- **Public Forum**: Comment sections and social sharing integration.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.1 (App Router)
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP, Framer Motion
- **State**: Zustand
- **Icons**: Lucide React

### Backend & Infrastructure
- **Database**: MongoDB (Mongoose ODM)
- **Auth**: JWT (Secure, stateless)
- **Media**: Cloudinary Integration
- **Validation**: Zod + React Hook Form

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/DevendraShahi/The-Leaders.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment**
   Create `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=...
   CLOUDINARY_CLOUD_NAME=...
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build Official 2082 Candidate Dataset (FPTP)**
   ```bash
   npm run data:candidates:fptp2082
   ```
   This generates:
   - `public/election/candidates/FPTP-2082.json` (normalized)
   - `public/election/candidates/FPTP-2082-raw.json` (raw ECN payload)

---

**Version**: 1.1.0  
**License**: Proprietary  
**Author**: Devendra Shahi  
**Designed with ♥ in Nepal**

*Truth. Transparency. Democracy.*
