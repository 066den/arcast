# Arcast - Modern Web Application

A beautiful and powerful web application built with modern web technologies including Next.js, React, Tailwind CSS, and shadcn/ui components.

## 🚀 Features

- **Modern Design**: Beautiful UI with gradient backgrounds and smooth animations
- **Responsive Layout**: Fully responsive design that works on all devices
- **Dark Mode Support**: Built-in dark mode with CSS variables
- **Type Safety**: Full TypeScript support for better development experience
- **Component Library**: Rich set of UI components from shadcn/ui
- **Performance**: Optimized with Next.js for fast loading times
- **SEO Ready**: Proper meta tags and Open Graph support

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Font**: [Inter](https://fonts.google.com/specimen/Inter)
- **Icons**: Heroicons (SVG icons)

## 📁 Project Structure

```
arcast-app/
├── src/
│   ├── app/
│   │   ├── globals.css          # Global styles and Tailwind imports
│   │   ├── layout.tsx           # Root layout component
│   │   └── page.tsx             # Home page component
│   ├── components/
│   │   └── ui/                  # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── label.tsx
│   └── lib/
│       └── utils.ts             # Utility functions
├── public/                      # Static assets
├── components.json              # shadcn/ui configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd arcast-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🎨 Customization

### Adding New shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

### Styling

The project uses Tailwind CSS with custom CSS variables for theming. You can customize colors, spacing, and other design tokens in:

- `tailwind.config.ts` - Tailwind configuration
- `src/app/globals.css` - CSS variables and custom styles

### Adding New Pages

Create new pages in the `src/app` directory following Next.js 13+ App Router conventions.

## 🌙 Dark Mode

Dark mode is automatically supported through CSS variables and Tailwind's dark mode utilities. The theme automatically adapts based on system preferences.

## 📱 Responsive Design

The application is fully responsive with mobile-first design principles:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically on every push

### Other Platforms

The project can be deployed to any platform that supports Node.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Vercel](https://vercel.com) for the deployment platform

## 📞 Support

If you have any questions or need help, please open an issue in the GitHub repository.

---

Built with ❤️ using Next.js, React, Tailwind CSS, and shadcn/ui
