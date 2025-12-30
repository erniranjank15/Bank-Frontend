import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const { logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Account management states
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [newAccountData, setNewAccountData] = useState({
    acc_holder_name: '',
    acc_holder_address: '',
    dob: '',
    gender: '',
    acc_type: 'savings'
  });
  const [editAccountData, setEditAccountData] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "https://bank-4-yt2f.onrender.com";

  // Get user profile when page loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    getUserProfile();
  }, []);

  const getUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        window.location.href = "/login";
        return;
      }
      
      const res = await axios.get(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUserInfo(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
      } else {
        toast.error("Failed to load profile data");
      }
    }
  };

  const handleDeposit = async (accountId) => {
    if (!accountId) {
      toast.warning('Please select an account');
      return;
    }
    if (!depositAmount) {
      toast.warning('Please enter deposit amount');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      await axios.post(`${API_URL}/accounts/${accountId}/deposit?amount=${depositAmount}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Deposit successful!');
      setDepositAmount('');
      setSelectedAccountId('');
      getUserProfile(); // Refresh data
    } catch (error) {
      toast.error('Deposit failed! Please try again.');
    }
  };

  const handleWithdraw = async (accountId) => {
    if (!accountId) {
      toast.warning('Please select an account');
      return;
    }
    if (!withdrawAmount) {
      toast.warning('Please enter withdrawal amount');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      
      await axios.post(`${API_URL}/accounts/${accountId}/withdraw?amount=${withdrawAmount}`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Withdrawal successful!');
      setWithdrawAmount('');
      setSelectedAccountId('');
      getUserProfile(); // Refresh data
    } catch (error) {
      toast.error('Withdrawal failed! Please try again.');
    }
  };

  // Create new account
  const handleCreateAccount = async () => {
    if (!newAccountData.acc_holder_name || !newAccountData.acc_holder_address || !newAccountData.dob || !newAccountData.gender) {
      toast.warning('Please fill all required fields');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      await axios.post(`${API_URL}/accounts/`, newAccountData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Account created successfully!');
      setShowCreateAccount(false);
      setNewAccountData({
        acc_holder_name: '',
        acc_holder_address: '',
        dob: '',
        gender: '',
        acc_type: 'savings'
      });
      getUserProfile(); // Refresh data
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  // Edit account
  const handleEditAccount = (account) => {
    setEditingAccount(account.acc_no);
    setEditAccountData({
      acc_holder_name: account.acc_holder_name,
      acc_holder_address: account.acc_holder_address,
      acc_type: account.acc_type
    });
  };

  // Save account changes
  const handleSaveAccount = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.patch(`${API_URL}/accounts/${accountId}`, editAccountData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      toast.success('Account updated successfully!');
      setEditingAccount(null);
      setEditAccountData({});
      getUserProfile(); // Refresh data
    } catch (error) {
      toast.error('Failed to update account');
    }
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingAccount(null);
    setEditAccountData({});
  };

  if (!userInfo) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - User Info with Actions */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4">User Information</h2>
            <p>User ID: <b>{userInfo.user_id}</b></p>
            <p>Username: <b>{userInfo.username}</b></p>
            <p>Email: <b>{userInfo.email}</b></p>
            <p>Mobile: <b>{userInfo.mob_no}</b></p>
            <p>Role: <b>{userInfo.role}</b></p>
            <p>Total Balance: <b>₹{userInfo.total_balance || 0}</b></p>
            <p>Total Accounts: <b>{userInfo.accounts?.length || 0}</b></p>

            {/* Deposit/Withdraw Actions */}
            <div className="mt-6 pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Banking Actions</h3>
              
              {/* Account Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Account: *</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full border p-2 rounded"
                  required
                >
                  <option value="">Choose Account</option>
                  {userInfo.accounts && userInfo.accounts.map(account => (
                    <option key={account.acc_no} value={account.acc_no}>
                      {account.acc_no} - ₹{account.balance}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deposit */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Deposit Amount: *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="flex-1 border p-2 rounded"
                    min="1"
                    required
                  />
                  <button
                    onClick={() => handleDeposit(selectedAccountId)}
                    disabled={!selectedAccountId}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
                  >
                    Deposit
                  </button>
                </div>
              </div>

              {/* Withdraw */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Withdraw Amount: *</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="flex-1 border p-2 rounded"
                    min="1"
                    required
                  />
                  <button
                    onClick={() => handleWithdraw(selectedAccountId)}
                    disabled={!selectedAccountId}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Individual Account Cards */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">My Accounts</h2>
            <button
              onClick={() => setShowCreateAccount(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              + Create Account
            </button>
          </div>

          {/* Create Account Form */}
          {showCreateAccount && (
            <div className="bg-white p-6 rounded shadow mb-4 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold mb-4">Create New Account</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    value={newAccountData.acc_holder_name}
                    onChange={(e) => setNewAccountData({...newAccountData, acc_holder_name: e.target.value})}
                    className="w-full border p-2 rounded"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Account Type *</label>
                  <select
                    value={newAccountData.acc_type}
                    onChange={(e) => setNewAccountData({...newAccountData, acc_type: e.target.value})}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select Account Type</option>
                    <option value="savings">Savings</option>
                    <option value="current">Current</option>
                    <option value="fixed">Fixed Deposit</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Address *</label>
                  <textarea
                    value={newAccountData.acc_holder_address}
                    onChange={(e) => setNewAccountData({...newAccountData, acc_holder_address: e.target.value})}
                    className="w-full border p-2 rounded"
                    rows="2"
                    placeholder="Enter complete address"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    value={newAccountData.dob}
                    onChange={(e) => setNewAccountData({...newAccountData, dob: e.target.value})}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gender *</label>
                  <select
                    value={newAccountData.gender}
                    onChange={(e) => setNewAccountData({...newAccountData, gender: e.target.value})}
                    className="w-full border p-2 rounded"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateAccount}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Create Account
                </button>
                <button
                  onClick={() => setShowCreateAccount(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Account Cards */}
          {userInfo.accounts && userInfo.accounts.length > 0 ? (
            <div className="space-y-4">
              {userInfo.accounts.map((account) => (
                <div key={account.acc_no} className="bg-white p-6 rounded shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-blue-600">Account #{account.acc_no}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-600">₹{account.balance}</span>
                      {editingAccount !== account.acc_no && (
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {editingAccount === account.acc_no ? (
                    // Edit Mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Account Holder Name *</label>
                        <input
                          type="text"
                          value={editAccountData.acc_holder_name || ''}
                          onChange={(e) => setEditAccountData({...editAccountData, acc_holder_name: e.target.value})}
                          className="w-full border p-2 rounded"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Account Type *</label>
                        <select
                          value={editAccountData.acc_type || ''}
                          onChange={(e) => setEditAccountData({...editAccountData, acc_type: e.target.value})}
                          className="w-full border p-2 rounded"
                          required
                        >
                          <option value="">Select Account Type</option>
                          <option value="savings">Savings</option>
                          <option value="current">Current</option>
                          <option value="fixed">Fixed Deposit</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Address *</label>
                        <textarea
                          value={editAccountData.acc_holder_address || ''}
                          onChange={(e) => setEditAccountData({...editAccountData, acc_holder_address: e.target.value})}
                          className="w-full border p-2 rounded"
                          rows="2"
                          required
                        />
                      </div>
                      <div className="md:col-span-2 flex gap-2">
                        <button
                          onClick={() => handleSaveAccount(account.acc_no)}
                          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><span className="font-medium">Account Holder:</span> {account.acc_holder_name}</p>
                        <p><span className="font-medium">Account Type:</span> <span className="capitalize">{account.acc_type}</span></p>
                        <p><span className="font-medium">IFSC Code:</span> {account.ifsc_code}</p>
                        <p><span className="font-medium">Branch:</span> {account.branch}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Address:</span> {account.acc_holder_address}</p>
                        <p><span className="font-medium">Date of Birth:</span> {account.dob}</p>
                        <p><span className="font-medium">Gender:</span> <span className="capitalize">{account.gender}</span></p>
                        <p><span className="font-medium">Created:</span> {new Date(account.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded shadow text-center">
              <p className="text-gray-500 mb-4">No accounts found.</p>
              <button
                onClick={() => setShowCreateAccount(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                Create Your First Account
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
