# The Leaders - Sher Bahadur Deuba Digital Platform

A modern, bilingual web platform dedicated to showcasing the life, achievements, and political legacy of Rt. Hon. Sher Bahadur Deuba, former Prime Minister of Nepal and President of Nepali Congress.

## 🌟 Overview

**The Leaders** is a comprehensive digital platform that provides an immersive experience into the political journey of one of Nepal's most prominent democratic leaders. Built with cutting-edge web technologies, this platform offers a rich multimedia experience in both English and Nepali languages.

## ✨ Key Features

### 🎯 Currently Live & Working

- **Bilingual Support** - Seamless switching between English (English) and Nepali (नेपाली) with smooth animations
- **Interactive Homepage** - Dynamic hero section with particle effects and election countdown
- **Leader Profiles** - Detailed biographical information with timeline and achievements
- **News & Articles** - Bilingual article system with rich text editor support
- **About Section** - Comprehensive overview of leadership philosophy and vision
- **History Timeline** - Interactive journey through political milestones
- **Responsive Design** - Optimized for all devices from mobile to desktop
- **Dark/Light Theme** - User-preference theme system with smooth transitions
- **Election 2026 Hub** - Interactive election map and candidate information
- **Manifesto Section** - Structured policy positions and campaign promises

### 🚧 In Development

- **Parties Section** - Political party ecosystem and coalition partners
- **Contact System** - Multi-step contact form with validation
- **Accessibility Features** - WCAG compliance and screen reader optimization
- **Cookie Policy** - GDPR-compliant cookie management
- **Privacy Policy** - Comprehensive privacy documentation
- **Advanced Search** - Full-text search across articles and content
- **User Comments** - Community engagement on articles
- **Social Sharing** - Enhanced social media integration

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16.1 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19.2
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion, GSAP
- **3D Graphics**: Three.js, React Three Fiber
- **Icons**: Lucide React
- **State Management**: Zustand
- **Data Fetching**: TanStack Query

### Backend & Database
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (jsonwebtoken, bcryptjs)
- **Media**: Cloudinary integration
- **Forms**: React Hook Form + Zod validation

### UI Components
- **Component Library**: Radix UI primitives
- **Rich Text**: Tiptap editor
- **Charts**: Recharts
- **Tables**: TanStack Table
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB instance running
- Cloudinary account (for media uploads)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/DevendraShahi/The-Leaders.git
cd The-Leaders
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_API_URL=http://localhost:3000
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
the-leaders/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── about/             # About page
│   │   ├── articles/          # Article listing and detail pages
│   │   ├── election-2026/     # Election hub
│   │   ├── history/           # Historical timeline
│   │   ├── leaders/           # Leader profile pages
│   │   └── ...
│   ├── components/            # React components
│   │   ├── common/           # Shared components (navbar, footer)
│   │   ├── election/         # Election-specific components
│   │   ├── home/             # Homepage components
│   │   └── ui/               # Reusable UI primitives
│   ├── lib/                  # Utilities and helpers
│   ├── models/               # MongoDB models
│   └── styles/               # Global styles
├── public/                   # Static assets
│   ├── fonts/               # Custom fonts
│   ├── images/              # Images and media
│   └── map/                 # Election map data
└── ...
```

## 🌐 Key Pages

| Page | Route | Status |
|------|-------|--------|
| Homepage | `/` | ✅ Live |
| About | `/about` | ✅ Live |
| History | `/history` | ✅ Live |
| Leaders | `/leaders/[slug]` | ✅ Live |
| Articles | `/articles` | ✅ Live |
| Article Detail | `/articles/[slug]` | ✅ Live |
| Election 2026 | `/election-2026` | ✅ Live |
| PR Candidates | `/election-2026/pr-candidates` | ✅ Live |
| Parties | `/parties` | 🚧 Development |
| Contact | `/contact` | 🚧 Development |
| Accessibility | `/accessibility` | 🚧 Development |

## 🎨 Design Philosophy

- **Premium Aesthetics** - Modern, clean, and visually appealing
- **Cultural Sensitivity** - Respectful representation of Nepali culture and politics
- **Accessibility First** - Inclusive design for all users
- **Performance** - Optimized for fast loading and smooth interactions
- **Mobile-First** - Responsive design that works beautifully on all devices

## 🔐 Security

- JWT-based authentication
- Bcrypt password hashing
- Environment variable protection
- Input validation with Zod schemas
- CSRF protection

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome)

## 🤝 Contributing

This is a private project. For inquiries about contributing, please contact the project maintainers.

## 📄 License

All rights reserved. This project is proprietary and confidential.

## 👨‍💻 Development Team

Developed with dedication to showcase Nepal's democratic leadership.

## 🐛 Known Issues

- Some pages still under development (marked with 🚧)
- Full-text search implementation pending
- Social sharing optimization in progress

## 📞 Support

For questions or support, please reach out through the official channels.

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: First Public Release 🎉
