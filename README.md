# D-CARS - Cameroon's Premier Vehicle Marketplace

D-CARS is a modern vehicle marketplace platform initially targeting the Cameroon market, with plans to expand across Africa. The platform enables users to buy, sell, and manage vehicle listings with a rich set of features.

## Features

- 🚗 Vehicle listing management
- 👤 User authentication (Google, Phone Number via Twilio)
- 💬 Real-time messaging system
- 🌍 Multi-language support (English & French)
- 🎨 Dark/Light theme
- 📱 Fully responsive design
- 💳 Subscription system for sellers
- 🤖 hCaptcha integration
- 📧 Email notifications via Resend
- 🔒 Secure data management with Supabase and MongoDB

## Tech Stack

### Frontend
- React
- TailwindCSS with DaisyUI
- i18next for internationalization
- React Query
- Zustand for state management

### Backend
- Node.js
- Express.js
- Supabase (PostgreSQL)
- MongoDB
- Twilio
- Resend

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account
- MongoDB Atlas account
- Twilio account
- Resend account
- hCaptcha account

## Environment Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/d-cars.git
cd d-cars
```

2. Install dependencies
```bash
# Install frontend dependencies
cd client
npm install

# Install backend dependencies
cd ../server
npm install
```

3. Configure environment variables
Create `.env` files in both client and server directories using the provided `.env.example` templates.

## Development

```bash
# Start frontend development server
cd client
npm run dev

# Start backend development server
cd server
npm run dev
```

## Deployment

Detailed deployment instructions can be found in `DEPLOYMENT.md`

## Database Setup

Refer to `DATABASE_SETUP.md` for detailed instructions on setting up Supabase and MongoDB databases.

## Contributing

Please read `CONTRIBUTING.md` for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@d-cars.com or join our Slack channel.