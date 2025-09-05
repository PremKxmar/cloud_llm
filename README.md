# 🩺 Full Stack Doctors Appointment Platform

<p align="center">
  <img src="/images/hero.png" alt="project-image">
</p>

<p align="center">
  <strong>A modern, responsive doctors appointment booking platform built with Next.js, Prisma, and Clerk authentication</strong>
</p>

## 🌟 Features

- **🔐 Secure Authentication** - Powered by Clerk with multiple sign-in options
- **📅 Appointment Booking** - Easy-to-use appointment scheduling system
- **👨‍⚕️ Doctor Management** - Complete doctor profile and availability management
- **🎥 Video Consultations** - Integrated video calling with Vonage/OpenTok
- **📱 Responsive Design** - Works seamlessly on desktop and mobile devices
- **🌙 Dark Mode Support** - Toggle between light and dark themes
- **📊 Dashboard** - Comprehensive admin and user dashboards
- **🔔 Notifications** - Real-time notifications with Sonner

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL/MySQL (via Prisma)
- **Authentication**: Clerk
- **Video Calling**: Vonage/OpenTok
- **UI Components**: Radix UI, Lucide React
- **Form Handling**: React Hook Form, Zod validation
- **Styling**: Tailwind CSS with custom animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Database (PostgreSQL/MySQL)
- Clerk account
- Vonage account (for video features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/PremKxmar/cloud.git
cd cloud
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
# Database
DATABASE_URL="your_database_url"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Vonage/OpenTok (for video calls)
VONAGE_API_KEY=your_vonage_api_key
VONAGE_API_SECRET=your_vonage_api_secret
VONAGE_APPLICATION_ID=your_vonage_application_id
```

4. **Set up the database**
```bash
npx prisma generate
npx prisma db push
```

5. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/       # Dashboard pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components (Radix UI)
│   └── forms/            # Form components
├── lib/                  # Utility functions
├── prisma/               # Database schema
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🎯 Core Features

### Authentication & Authorization
- Secure user registration and login
- Role-based access control (Patients, Doctors, Admin)
- Social login options

### Appointment Management
- Browse available doctors
- Schedule appointments with real-time availability
- Appointment confirmation and reminders
- Cancellation and rescheduling

### Video Consultations
- High-quality video calls powered by Vonage
- Screen sharing capabilities
- Chat during consultations
- Recording options

### User Dashboard
- Personal appointment history
- Profile management
- Notification preferences
- Medical records access

### Doctor Dashboard
- Schedule management
- Patient information
- Earnings tracking
- Availability settings

## 📱 Screenshots

![Dashboard](/images/hero.png)

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

### Other Platforms
The app can be deployed on any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.com/) for authentication
- [Prisma](https://prisma.io/) for database management
- [Vonage](https://vonage.com/) for video calling capabilities
- [Radix UI](https://radix-ui.com/) for accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

## 📞 Support

If you have any questions or need help, please open an issue or contact [PremKxmar](https://github.com/PremKxmar).

---

<p align="center">Made with ❤️ by <a href="https://github.com/PremKxmar">PremKxmar</a></p>
