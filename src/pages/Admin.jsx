import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Admin = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  
  // Edit states
  const [editingUser, setEditingUser] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editUserData, setEditUserData] = useState({});
  const [editAccountData, setEditAccountData] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || "https://bank-4-yt2f.onrender.com";

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // Get user profile to check role
      const userRes = await axios.get(`${API_URL}/users/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (userRes.data.role !== 'admin') {
        toast.error("Access denied! Admin only.");
        window.location.href = "/dashboard";
        return;
      }

      // If admin, load data
      await loadAdminData();
    } catch (error) {
      toast.error("Access denied!");
      window.location.href = "/login";
    }
  };

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Get all users
      const usersRes = await axios.get(`${API_URL}/users/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(usersRes.data);

      // Get all accounts
      const accountsRes = await axios.get(`${API_URL}/accounts/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAccounts(accountsRes.data);
      
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load admin data");
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success("User deleted successfully!");
      loadAdminData(); // Refresh data
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user.user_id);
    setEditUserData({
      username: user.username,
      email: user.email,
      mob_no: user.mob_no,
      role: user.role
    });
  };

  const handleSaveUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const updateData = {
        username: editUserData.username,
        email: editUserData.email,
        mob_no: parseInt(editUserData.mob_no),
        hashed_password: "unchanged", // Keep existing password
        role: editUserData.role
      };

      await axios.put(`${API_URL}/users/${userId}`, updateData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success("User updated successfully!");
      setEditingUser(null);
      setEditUserData({});
      loadAdminData(); // Refresh data
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const handleCancelEditUser = () => {
    setEditingUser(null);
    setEditUserData({});
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/accounts/${accountId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success("Account deleted successfully!");
      loadAdminData(); // Refresh data
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account.acc_no);
    setEditAccountData({
      acc_holder_name: account.acc_holder_name,
      acc_holder_address: account.acc_holder_address,
      dob: account.dob,
      gender: account.gender,
      acc_type: account.acc_type,
      balance: account.balance
    });
  };

  const handleSaveAccount = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      
      await axios.put(`${API_URL}/accounts/${accountId}/admin`, editAccountData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success("Account updated successfully!");
      setEditingAccount(null);
      setEditAccountData({});
      loadAdminData(); // Refresh data
    } catch (error) {
      toast.error("Failed to update account");
    }
  };

  const handleCancelEditAccount = () => {
    setEditingAccount(null);
    setEditAccountData({});
  };

  const handleAdminDeposit = async () => {
    if (!selectedAccountId || !depositAmount) {
      toast.warning('Please select account and enter amount');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/accounts/${selectedAccountId}/deposit?amount=${depositAmount}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Deposit successful!');
      setDepositAmount('');
      setSelectedAccountId('');
      loadAdminData(); // Refresh data
    } catch (error) {
      toast.error('Deposit failed!');
    }
  };

  const handleAdminWithdraw = async () => {
    if (!selectedAccountId || !withdrawAmount) {
      toast.warning('Please select account and enter amount');
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/accounts/${selectedAccountId}/withdraw?amount=${withdrawAmount}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      toast.success('Withdrawal successful!');
      setWithdrawAmount('');
      setSelectedAccountId('');
      loadAdminData(); // Refresh data
    } catch (error) {
      toast.error('Withdrawal failed!');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Welcome Admin</h1>
      </div>

      {/* Admin Actions */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">Admin Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deposit */}
          <div>
            <h3 className="font-semibold mb-2">Deposit to Account</h3>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              required
            >
              <option value="">Select Account</option>
              {accounts.map(account => (
                <option key={account.acc_no} value={account.acc_no}>
                  {account.acc_no} - {account.acc_holder_name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Deposit amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="flex-1 border p-2 rounded"
                min="1"
                required
              />
              <button
                onClick={handleAdminDeposit}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Deposit
              </button>
            </div>
          </div>

          {/* Withdraw */}
          <div>
            <h3 className="font-semibold mb-2">Withdraw from Account</h3>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full border p-2 rounded mb-2"
              required
            >
              <option value="">Select Account</option>
              {accounts.map(account => (
                <option key={account.acc_no} value={account.acc_no}>
                  {account.acc_no} - {account.acc_holder_name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Withdraw amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="flex-1 border p-2 rounded"
                min="1"
                required
              />
              <button
                onClick={handleAdminWithdraw}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-bold mb-4">All Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">User ID</th>
                <th className="border p-2">Username</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Mobile</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Created At</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id}>
                  <td className="border p-2">{user.user_id}</td>
                  <td className="border p-2">
                    {editingUser === user.user_id ? (
                      <input
                        type="text"
                        value={editUserData.username || ''}
                        onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                        className="w-full border p-1 rounded"
                        required
                      />
                    ) : (
                      user.username
                    )}
                  </td>
                  <td className="border p-2">
                    {editingUser === user.user_id ? (
                      <input
                        type="email"
                        value={editUserData.email || ''}
                        onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
                        className="w-full border p-1 rounded"
                        required
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td className="border p-2">
                    {editingUser === user.user_id ? (
                      <input
                        type="number"
                        value={editUserData.mob_no || ''}
                        onChange={(e) => setEditUserData({...editUserData, mob_no: e.target.value})}
                        className="w-full border p-1 rounded"
                        required
                      />
                    ) : (
                      user.mob_no
                    )}
                  </td>
                  <td className="border p-2">
                    {editingUser === user.user_id ? (
                      <select
                        value={editUserData.role || ''}
                        onChange={(e) => setEditUserData({...editUserData, role: e.target.value})}
                        className="w-full border p-1 rounded"
                        required
                      >
                        <option value="">Select Role</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      user.role
                    )}
                  </td>
                  <td className="border p-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="border p-2">
                    {editingUser === user.user_id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSaveUser(user.user_id)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditUser}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">All Accounts</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Account No</th>
                <th className="border p-2">Holder Name</th>
                <th className="border p-2">User ID</th>
                <th className="border p-2">Account Type</th>
                <th className="border p-2">Balance</th>
                <th className="border p-2">IFSC</th>
                <th className="border p-2">Branch</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.acc_no}>
                  <td className="border p-2">{account.acc_no}</td>
                  <td className="border p-2">
                    {editingAccount === account.acc_no ? (
                      <input
                        type="text"
                        value={editAccountData.acc_holder_name || ''}
                        onChange={(e) => setEditAccountData({...editAccountData, acc_holder_name: e.target.value})}
                        className="w-full border p-1 rounded"
                        required
                      />
                    ) : (
                      account.acc_holder_name
                    )}
                  </td>
                  <td className="border p-2">{account.user_id}</td>
                  <td className="border p-2">
                    {editingAccount === account.acc_no ? (
                      <select
                        value={editAccountData.acc_type || ''}
                        onChange={(e) => setEditAccountData({...editAccountData, acc_type: e.target.value})}
                        className="w-full border p-1 rounded"
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="savings">Savings</option>
                        <option value="current">Current</option>
                        <option value="fixed">Fixed</option>
                      </select>
                    ) : (
                      account.acc_type
                    )}
                  </td>
                  <td className="border p-2">
                    {editingAccount === account.acc_no ? (
                      <input
                        type="number"
                        value={editAccountData.balance || ''}
                        onChange={(e) => setEditAccountData({...editAccountData, balance: parseFloat(e.target.value)})}
                        className="w-full border p-1 rounded"
                        min="0"
                        step="0.01"
                        required
                      />
                    ) : (
                      `₹${account.balance}`
                    )}
                  </td>
                  <td className="border p-2">{account.ifsc_code}</td>
                  <td className="border p-2">{account.branch}</td>
                  <td className="border p-2">
                    {editingAccount === account.acc_no ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleSaveAccount(account.acc_no)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEditAccount}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteAccount(account.acc_no)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;