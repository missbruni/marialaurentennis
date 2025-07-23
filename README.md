# Tennis Booking Application

A modern, full-stack tennis lesson booking system built with Next.js, React, and TypeScript. This application allows tennis coaches to manage their availability and clients to book lessons seamlessly.

## Features

- 🎾 **Lesson Booking System** - Easy date and time selection for tennis lessons
- 📅 **Availability Management** - Coaches can set and manage their available time slots
- 💳 **Payment Integration** - Stripe payment processing for secure transactions
- 🔐 **Authentication** - Firebase authentication for user management
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 🎨 **Modern UI** - Beautiful, accessible interface built with Tailwind CSS
- ⚡ **Real-time Updates** - Live availability updates and booking confirmations

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Authentication**: Firebase Auth
- **Payments**: Stripe
- **Database**: Firebase Firestore
- **Testing**: Vitest, Playwright (E2E)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Firebase project setup
- Stripe account

### Installation

1. Clone the repository:

```bash
git clone <your-repo-url>
cd tennis-booking
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Configure your environment variables:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run test:all` - Run all tests
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Testing

This project includes comprehensive testing:

- **Unit Tests**: Using Vitest and React Testing Library
- **E2E Tests**: Using Playwright for critical user journeys
- **Type Safety**: Full TypeScript coverage

Run tests with:

```bash
npm run test:all
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your project to Vercel
3. Configure environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Bruna Lima** - [GitHub](https://github.com/brunalima)

---

Built with ❤️ for the tennis community
