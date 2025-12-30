# SecureBank - Modern Banking System

A full-stack banking application built with React and FastAPI, featuring role-based authentication, account management, and secure transactions.

## 🚀 Live Demo

**Frontend**: [Deploy on Netlify](https://netlify.com)  
**Backend API**: https://bank-4-yt2f.onrender.com

## ✨ Features

- **🔐 Secure Authentication**: JWT-based login/registration
- **👥 Role-Based Access**: User and Admin dashboards
- **💳 Account Management**: Create, edit, and manage multiple accounts
- **💰 Transactions**: Deposit and withdrawal operations
- **📱 Responsive Design**: Mobile-first with Tailwind CSS
- **🔔 Real-time Notifications**: Toast notifications for user feedback
- **🛡️ Security**: Input validation, HTTPS, and secure token handling

## 🛠️ Tech Stack

### Frontend
- **React 19.2.0** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **React Toastify** - Toast notifications

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **JWT** - Authentication tokens
- **Pydantic** - Data validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   VITE_API_URL=https://bank-4-yt2f.onrender.com
   VITE_APP_NAME=SecureBank
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5174
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Custom button component
│   ├── Input.jsx       # Form input component
│   └── Navbar.jsx      # Navigation component
├── context/            # React Context providers
│   ├── AuthContext.jsx # Authentication state
│   └── ApiContext.jsx  # API configuration
├── pages/              # Page components
│   ├── Home.jsx        # Landing page with login
│   ├── Register.jsx    # User registration
│   ├── Dashboard.jsx   # User dashboard
│   └── Admin.jsx       # Admin panel
├── App.jsx             # Main app component
└── main.jsx           # App entry point
```

## 🔑 User Roles

### Regular User
- Create and manage personal accounts
- Perform deposits and withdrawals
- View account details and balances
- Update account information

### Admin
- Manage all users and accounts
- Perform transactions on any account
- Edit user and account details
- Delete users and accounts
- View system-wide statistics

## 🔐 Authentication Flow

1. **Registration**: Create account with username, email, mobile, password
2. **Login**: Authenticate with username/password
3. **JWT Token**: Secure token stored in localStorage
4. **Role-based Routing**: Redirect based on user role
5. **Protected Routes**: Authentication required for dashboard access

## 💳 Account Management

- **Multiple Accounts**: Users can create multiple bank accounts
- **Account Types**: Savings, Current, Fixed Deposit
- **Account Details**: Holder name, address, DOB, gender
- **Unique Identifiers**: Auto-generated account numbers and IFSC codes
- **Balance Tracking**: Real-time balance updates

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Server-side password encryption
- **Input Validation**: Client and server-side validation
- **HTTPS**: Secure data transmission
- **Role-based Access**: Principle of least privilege
- **XSS Protection**: React's built-in sanitization

## 📱 Responsive Design

- **Mobile-First**: Optimized for mobile devices
- **Breakpoints**: Tailwind CSS responsive utilities
- **Touch-Friendly**: Large buttons and touch targets
- **Hamburger Menu**: Mobile navigation
- **Flexible Layouts**: CSS Grid and Flexbox

## 🚀 Deployment

### Netlify Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to Netlify**
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Add environment variables

3. **Environment Variables**
   ```
   VITE_API_URL=https://bank-4-yt2f.onrender.com
   VITE_APP_NAME=SecureBank
   VITE_NODE_ENV=production
   ```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## 🧪 Testing

```bash
# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📊 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Code Splitting**: Vendor and route-based chunks
- **Asset Optimization**: Minification and compression
- **Caching**: Optimized cache headers
- **Bundle Size**: Optimized with tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Niranjan Kasote**
- GitHub: [@your-github-username]
- Email: your-email@example.com

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first approach
- FastAPI for the robust backend framework
- Netlify for seamless deployment

---

⭐ Star this repository if you found it helpful!