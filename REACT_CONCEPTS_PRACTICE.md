# React Concepts Practice Tasks - Banking System Interview Prep

Based on your banking project, here are mini practice tasks for each React concept you've implemented. These will help you confidently explain your code to interviewers.

## 1. useState Hook - State Management

### **Used in Your Project:**
- Form data management (login, register, account creation)
- UI state (mobile menu, editing modes, loading states)
- Local component state (deposit/withdraw amounts)

### **Practice Task:**
Create a simple counter with multiple state variables:

```javascript
const CounterPractice = () => {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const [isActive, setIsActive] = useState(false);

  const increment = () => setCount(prev => prev + step);
  const decrement = () => setCount(prev => prev - step);
  const reset = () => setCount(0);

  return (
    <div>
      <h2>Count: {count}</h2>
      <input 
        type="number" 
        value={step} 
        onChange={(e) => setStep(Number(e.target.value))}
        placeholder="Step size"
      />
      <button onClick={increment}>+{step}</button>
      <button onClick={decrement}>-{step}</button>
      <button onClick={reset}>Reset</button>
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Deactivate' : 'Activate'}
      </button>
    </div>
  );
};
```

### **Interview Explanation:**
"In my banking system, I use useState extensively. For example, in the Dashboard component, I manage multiple state variables like `userInfo` for user data, `depositAmount` for transaction inputs, and `editingAccount` for tracking which account is being edited. This demonstrates state isolation and proper state updates."

---

## 2. useEffect Hook - Side Effects

### **Used in Your Project:**
- Data fetching on component mount
- Token validation and user loading
- Cleanup and dependency management

### **Practice Task:**
Create a user profile fetcher with cleanup:

```javascript
const UserProfilePractice = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call
        const response = await fetch(`/api/users/${userId}`);
        const userData = await response.json();
        
        if (!cancelled) {
          setUser(userData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    if (userId) {
      fetchUser();
    }

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [userId]); // Dependency array

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>No user found</div>;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

### **Interview Explanation:**
"In my AuthContext, I use useEffect to automatically load user data when the app starts. I check for existing tokens in localStorage and validate them with the backend. The cleanup function prevents memory leaks if the component unmounts during an API call."

---

## 3. useContext Hook - Global State

### **Used in Your Project:**
- Authentication state management
- User data sharing across components
- API configuration

### **Practice Task:**
Create a theme context system:

```javascript
// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const changeFontSize = (size) => {
    setFontSize(size);
  };

  const value = {
    theme,
    fontSize,
    toggleTheme,
    changeFontSize
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`theme-${theme} font-${fontSize}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Custom hook
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Usage in component
const ThemedComponent = () => {
  const { theme, toggleTheme, fontSize, changeFontSize } = useTheme();

  return (
    <div>
      <h1>Current theme: {theme}</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <select onChange={(e) => changeFontSize(e.target.value)} value={fontSize}>
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </div>
  );
};
```

### **Interview Explanation:**
"I implemented a custom AuthContext that manages user authentication state globally. Any component can access user data, login/logout functions, and token information without prop drilling. This pattern is essential for authentication in React applications."

---

## 4. Custom Hooks - Reusable Logic

### **Used in Your Project:**
- `useAuth()` for authentication logic
- API call patterns

### **Practice Task:**
Create a custom hook for API calls:

```javascript
const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiCall = async (url, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading, error };
};

// Usage
const UserList = () => {
  const [users, setUsers] = useState([]);
  const { apiCall, loading, error } = useApi();

  const fetchUsers = async () => {
    try {
      const data = await apiCall('/api/users');
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
};
```

### **Interview Explanation:**
"I created a custom `useAuth` hook that encapsulates all authentication logic. This makes the code more reusable and testable. Components just call `useAuth()` to get login, logout, and user state without knowing the implementation details."

---

## 5. Form Handling & Controlled Components

### **Used in Your Project:**
- Login/Register forms
- Account creation forms
- Transaction input forms

### **Practice Task:**
Create a comprehensive form with validation:

```javascript
const BankAccountForm = () => {
  const [formData, setFormData] = useState({
    accountHolder: '',
    accountType: '',
    initialDeposit: '',
    email: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Account holder name is required';
    }
    
    if (!formData.accountType) {
      newErrors.accountType = 'Please select account type';
    }
    
    if (!formData.initialDeposit || formData.initialDeposit < 1000) {
      newErrors.initialDeposit = 'Minimum deposit is $1000';
    }
    
    if (!formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Account created successfully!');
      
      // Reset form
      setFormData({
        accountHolder: '',
        accountType: '',
        initialDeposit: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      alert('Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Account Holder Name:</label>
        <input
          type="text"
          name="accountHolder"
          value={formData.accountHolder}
          onChange={handleChange}
          required
        />
        {errors.accountHolder && <span className="error">{errors.accountHolder}</span>}
      </div>

      <div>
        <label>Account Type:</label>
        <select
          name="accountType"
          value={formData.accountType}
          onChange={handleChange}
          required
        >
          <option value="">Select Type</option>
          <option value="savings">Savings</option>
          <option value="checking">Checking</option>
          <option value="business">Business</option>
        </select>
        {errors.accountType && <span className="error">{errors.accountType}</span>}
      </div>

      <div>
        <label>Initial Deposit:</label>
        <input
          type="number"
          name="initialDeposit"
          value={formData.initialDeposit}
          onChange={handleChange}
          min="1000"
          required
        />
        {errors.initialDeposit && <span className="error">{errors.initialDeposit}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};
```

### **Interview Explanation:**
"In my banking system, I use controlled components for all forms. The form state is managed by React, and I implement real-time validation. For example, in the account creation form, I validate required fields, minimum deposit amounts, and email formats before submission."

---

## 6. Conditional Rendering

### **Used in Your Project:**
- Role-based UI (user vs admin)
- Edit mode toggles
- Loading states
- Error states

### **Practice Task:**
Create a dashboard with multiple conditional renders:

```javascript
const BankDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUser({
        name: 'John Doe',
        role: 'admin',
        balance: 5000,
        accounts: ['123456', '789012']
      });
      setLoading(false);
    }, 2000);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="loading">
        <h2>Loading your dashboard...</h2>
        <div className="spinner"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error">
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="no-user">
        <h2>Please log in to view your dashboard</h2>
        <button onClick={() => window.location.href = '/login'}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}!</h1>
      
      {/* Role-based rendering */}
      {user.role === 'admin' ? (
        <div className="admin-panel">
          <h2>Admin Panel</h2>
          <button>Manage Users</button>
          <button>View Reports</button>
          <button>System Settings</button>
        </div>
      ) : (
        <div className="user-panel">
          <h2>Your Account</h2>
          <p>Balance: ${user.balance}</p>
          <button>Transfer Money</button>
          <button>Pay Bills</button>
        </div>
      )}

      {/* Conditional content based on state */}
      <div className="transactions-section">
        <button onClick={() => setShowTransactions(!showTransactions)}>
          {showTransactions ? 'Hide' : 'Show'} Transactions
        </button>
        
        {showTransactions && (
          <div className="transactions">
            <h3>Recent Transactions</h3>
            {user.accounts.length > 0 ? (
              <ul>
                {user.accounts.map(account => (
                  <li key={account}>Account: {account}</li>
                ))}
              </ul>
            ) : (
              <p>No accounts found</p>
            )}
          </div>
        )}
      </div>

      {/* Multiple conditions */}
      {user.balance > 10000 && user.role === 'user' && (
        <div className="premium-offer">
          <h3>Upgrade to Premium!</h3>
          <p>You're eligible for premium banking features</p>
        </div>
      )}
    </div>
  );
};
```

### **Interview Explanation:**
"My banking system uses extensive conditional rendering. The navbar shows different links based on authentication status and user role. In the dashboard, I show different interfaces for users vs admins. I also handle loading states, error states, and empty states throughout the application."

---

## 7. List Rendering & Keys

### **Used in Your Project:**
- Account cards display
- User tables in admin panel
- Transaction history

### **Practice Task:**
Create a transaction list with filtering and sorting:

```javascript
const TransactionList = () => {
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'deposit', amount: 1000, date: '2025-01-01', description: 'Salary' },
    { id: 2, type: 'withdrawal', amount: 200, date: '2025-01-02', description: 'ATM' },
    { id: 3, type: 'deposit', amount: 500, date: '2025-01-03', description: 'Transfer' },
    { id: 4, type: 'withdrawal', amount: 50, date: '2025-01-04', description: 'Coffee' }
  ]);

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    }
    if (sortBy === 'amount') {
      return b.amount - a.amount;
    }
    return 0;
  });

  const deleteTransaction = (id) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div>
      <div className="controls">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Transactions</option>
          <option value="deposit">Deposits Only</option>
          <option value="withdrawal">Withdrawals Only</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>
      </div>

      <div className="transaction-list">
        {sortedTransactions.length === 0 ? (
          <p>No transactions found</p>
        ) : (
          sortedTransactions.map(transaction => (
            <div 
              key={transaction.id} 
              className={`transaction ${transaction.type}`}
            >
              <div className="transaction-info">
                <h3>{transaction.description}</h3>
                <p>{transaction.date}</p>
              </div>
              <div className="transaction-amount">
                <span className={transaction.type}>
                  {transaction.type === 'deposit' ? '+' : '-'}
                  ${transaction.amount}
                </span>
                <button 
                  onClick={() => deleteTransaction(transaction.id)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="summary">
        <p>Total Transactions: {sortedTransactions.length}</p>
        <p>Total Amount: ${sortedTransactions.reduce((sum, t) => 
          t.type === 'deposit' ? sum + t.amount : sum - t.amount, 0
        )}</p>
      </div>
    </div>
  );
};
```

### **Interview Explanation:**
"In my admin panel, I render lists of users and accounts using map(). Each item has a unique key (user_id or acc_no) for React's reconciliation. I also implement filtering and sorting functionality, which demonstrates how to work with derived state from arrays."

---

## 8. Event Handling

### **Used in Your Project:**
- Form submissions
- Button clicks
- Mobile menu toggles
- Transaction operations

### **Practice Task:**
Create an interactive banking calculator:

```javascript
const BankingCalculator = () => {
  const [principal, setPrincipal] = useState(1000);
  const [rate, setRate] = useState(5);
  const [time, setTime] = useState(1);
  const [compoundFrequency, setCompoundFrequency] = useState(12);
  const [result, setResult] = useState(0);

  const calculateCompoundInterest = (e) => {
    e.preventDefault();
    
    const amount = principal * Math.pow(
      (1 + (rate / 100) / compoundFrequency), 
      compoundFrequency * time
    );
    
    setResult(amount.toFixed(2));
  };

  const handleInputChange = (setter) => (e) => {
    const value = parseFloat(e.target.value) || 0;
    setter(value);
  };

  const handleReset = () => {
    setPrincipal(1000);
    setRate(5);
    setTime(1);
    setCompoundFrequency(12);
    setResult(0);
  };

  const handlePresetAmount = (amount) => {
    setPrincipal(amount);
  };

  return (
    <div className="calculator">
      <h2>Compound Interest Calculator</h2>
      
      <form onSubmit={calculateCompoundInterest}>
        <div className="input-group">
          <label>Principal Amount ($):</label>
          <input
            type="number"
            value={principal}
            onChange={handleInputChange(setPrincipal)}
            min="1"
            required
          />
          <div className="preset-buttons">
            {[1000, 5000, 10000, 25000].map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => handlePresetAmount(amount)}
                className={principal === amount ? 'active' : ''}
              >
                ${amount}
              </button>
            ))}
          </div>
        </div>

        <div className="input-group">
          <label>Annual Interest Rate (%):</label>
          <input
            type="number"
            value={rate}
            onChange={handleInputChange(setRate)}
            min="0.1"
            max="50"
            step="0.1"
            required
          />
        </div>

        <div className="input-group">
          <label>Time Period (years):</label>
          <input
            type="number"
            value={time}
            onChange={handleInputChange(setTime)}
            min="0.1"
            step="0.1"
            required
          />
        </div>

        <div className="input-group">
          <label>Compound Frequency:</label>
          <select
            value={compoundFrequency}
            onChange={(e) => setCompoundFrequency(parseInt(e.target.value))}
          >
            <option value={1}>Annually</option>
            <option value={4}>Quarterly</option>
            <option value={12}>Monthly</option>
            <option value={365}>Daily</option>
          </select>
        </div>

        <div className="button-group">
          <button type="submit">Calculate</button>
          <button type="button" onClick={handleReset}>Reset</button>
        </div>
      </form>

      {result > 0 && (
        <div className="result">
          <h3>Results:</h3>
          <p>Final Amount: ${result}</p>
          <p>Interest Earned: ${(result - principal).toFixed(2)}</p>
          <p>Total Return: {(((result - principal) / principal) * 100).toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
};
```

### **Interview Explanation:**
"I handle various events in my banking system. Form submissions prevent default behavior and validate data before API calls. I use event delegation for dynamic lists and implement proper event handling for mobile menu toggles and transaction operations."

---

## 9. Component Composition & Props

### **Used in Your Project:**
- Reusable Button and Input components
- Layout components (Navbar)
- Page components with shared logic

### **Practice Task:**
Create a reusable card system:

```javascript
// Base Card Component
const Card = ({ 
  children, 
  className = '', 
  onClick, 
  hoverable = false,
  ...props 
}) => {
  const cardClasses = `
    card 
    ${className} 
    ${hoverable ? 'hoverable' : ''} 
    ${onClick ? 'clickable' : ''}
  `.trim();

  return (
    <div 
      className={cardClasses} 
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
const CardHeader = ({ title, subtitle, actions, children }) => (
  <div className="card-header">
    <div className="card-title-section">
      {title && <h3 className="card-title">{title}</h3>}
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {children}
    </div>
    {actions && <div className="card-actions">{actions}</div>}
  </div>
);

// Card Body Component
const CardBody = ({ children, padding = 'normal' }) => (
  <div className={`card-body padding-${padding}`}>
    {children}
  </div>
);

// Card Footer Component
const CardFooter = ({ children, align = 'right' }) => (
  <div className={`card-footer align-${align}`}>
    {children}
  </div>
);

// Account Card - Composed Component
const AccountCard = ({ account, onEdit, onDelete, onViewTransactions }) => {
  const formatCurrency = (amount) => `$${amount.toLocaleString()}`;
  
  const actions = (
    <>
      <button onClick={() => onEdit(account.id)} className="btn-secondary">
        Edit
      </button>
      <button onClick={() => onDelete(account.id)} className="btn-danger">
        Delete
      </button>
    </>
  );

  return (
    <Card className="account-card" hoverable>
      <CardHeader
        title={`Account ${account.number}`}
        subtitle={account.type.toUpperCase()}
        actions={actions}
      />
      
      <CardBody>
        <div className="account-details">
          <div className="balance">
            <span className="label">Current Balance:</span>
            <span className="amount">{formatCurrency(account.balance)}</span>
          </div>
          
          <div className="account-info">
            <p><strong>Holder:</strong> {account.holderName}</p>
            <p><strong>Opened:</strong> {account.openDate}</p>
            <p><strong>Status:</strong> 
              <span className={`status ${account.status}`}>
                {account.status}
              </span>
            </p>
          </div>
        </div>
      </CardBody>
      
      <CardFooter>
        <button 
          onClick={() => onViewTransactions(account.id)}
          className="btn-primary"
        >
          View Transactions
        </button>
      </CardFooter>
    </Card>
  );
};

// Usage Example
const AccountDashboard = () => {
  const [accounts, setAccounts] = useState([
    {
      id: 1,
      number: '****1234',
      type: 'savings',
      balance: 15000,
      holderName: 'John Doe',
      openDate: '2023-01-15',
      status: 'active'
    },
    {
      id: 2,
      number: '****5678',
      type: 'checking',
      balance: 3500,
      holderName: 'John Doe',
      openDate: '2023-03-20',
      status: 'active'
    }
  ]);

  const handleEdit = (accountId) => {
    console.log('Edit account:', accountId);
  };

  const handleDelete = (accountId) => {
    if (window.confirm('Are you sure?')) {
      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
    }
  };

  const handleViewTransactions = (accountId) => {
    console.log('View transactions for:', accountId);
  };

  return (
    <div className="account-dashboard">
      <h1>Your Accounts</h1>
      
      <div className="accounts-grid">
        {accounts.map(account => (
          <AccountCard
            key={account.id}
            account={account}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewTransactions={handleViewTransactions}
          />
        ))}
      </div>
      
      {accounts.length === 0 && (
        <Card className="empty-state">
          <CardBody padding="large">
            <h3>No accounts found</h3>
            <p>Create your first account to get started</p>
            <button className="btn-primary">Create Account</button>
          </CardBody>
        </Card>
      )}
    </div>
  );
};
```

### **Interview Explanation:**
"I use component composition extensively in my banking system. My Button and Input components accept props for customization while maintaining consistency. The AccountCard component demonstrates composition - it receives account data and callback functions as props, making it reusable and testable."

---

## 10. Error Boundaries & Error Handling

### **Used in Your Project:**
- API error handling
- Form validation errors
- Authentication errors

### **Practice Task:**
Create an error boundary with fallback UI:

```javascript
// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Component that might throw errors
const BankingWidget = ({ accountId }) => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call that might fail
        if (accountId === 'error') {
          throw new Error('Account not found');
        }
        
        if (accountId === 'crash') {
          // This will trigger the error boundary
          throw new Error('Critical system error');
        }
        
        // Simulate successful response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAccount({
          id: accountId,
          balance: Math.random() * 10000,
          name: 'Sample Account'
        });
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccount();
  }, [accountId]);

  // Handle loading state
  if (loading) {
    return <div className="loading">Loading account...</div>;
  }

  // Handle error state
  if (error) {
    return (
      <div className="error-state">
        <h3>Failed to load account</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  // Render account data
  return (
    <div className="banking-widget">
      <h3>{account.name}</h3>
      <p>Balance: ${account.balance.toFixed(2)}</p>
      <button onClick={() => {
        // This might cause an error
        if (Math.random() > 0.7) {
          throw new Error('Random error occurred');
        }
        alert('Transaction successful');
      }}>
        Make Transaction
      </button>
    </div>
  );
};

// App with Error Boundary
const BankingApp = () => {
  const [selectedAccount, setSelectedAccount] = useState('123');

  return (
    <div className="banking-app">
      <h1>Banking Dashboard</h1>
      
      <div className="account-selector">
        <button onClick={() => setSelectedAccount('123')}>
          Normal Account
        </button>
        <button onClick={() => setSelectedAccount('error')}>
          Error Account
        </button>
        <button onClick={() => setSelectedAccount('crash')}>
          Crash Account
        </button>
      </div>

      <ErrorBoundary>
        <BankingWidget accountId={selectedAccount} />
      </ErrorBoundary>
    </div>
  );
};
```

### **Interview Explanation:**
"In my banking system, I implement comprehensive error handling. I use try-catch blocks for API calls and display user-friendly error messages. For critical errors, I would implement Error Boundaries to prevent the entire app from crashing and provide fallback UI."

---

## Interview Practice Questions

### **1. State Management:**
**Q:** "How do you decide between useState, useContext, and external state management?"

**A:** "In my banking system, I use useState for local component state like form inputs and UI toggles. useContext for global state like authentication that needs to be shared across components. For complex state logic, I'd consider useReducer or external libraries like Redux."

### **2. Performance:**
**Q:** "How do you optimize React performance in your banking app?"

**A:** "I use React.memo for expensive components, useMemo for expensive calculations, and useCallback for event handlers passed to child components. I also implement code splitting with React.lazy for route-based splitting."

### **3. Security:**
**Q:** "How do you handle sensitive data in React?"

**A:** "I never store sensitive data like passwords in component state. JWT tokens are stored in localStorage with proper expiration handling. I validate all inputs and use HTTPS for all API communications."

### **4. Testing:**
**Q:** "How would you test these React components?"

**A:** "I'd use React Testing Library to test user interactions, Jest for unit tests, and Cypress for E2E testing. I'd test form submissions, API integrations, and user flows like login and transactions."

This comprehensive practice guide covers all the React concepts used in your banking system and provides hands-on examples you can discuss confidently in interviews! 🚀