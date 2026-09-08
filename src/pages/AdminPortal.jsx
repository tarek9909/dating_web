import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, CreditCard, Sparkles, LogOut, CheckCircle2,
  AlertCircle, DollarSign, UserCheck, Key, Eye, RefreshCw, Send, Copy, Check, UserPlus
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function AdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Payment Modal State
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    requestId: null,
    customerName: '',
    amount: '25.00',
    currency: 'USD',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: ''
  });

  // Direct Customer Creation Modal State
  const [createModal, setCreateModal] = useState({
    open: false,
    fullName: '',
    email: '',
    phone: '',
    recipientName: '',
    customPassword: '',
    submitting: false,
  });

  // Activation Result Modal State
  const [activationResult, setActivationResult] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'requests') {
        const res = await api.admin.getRequests();
        setRequests(Array.isArray(res.data) ? res.data : (res.data?.requests || []));
      } else {
        const res = await api.admin.getCustomers();
        setCustomers(Array.isArray(res.data) ? res.data : (res.data?.customers || []));
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load admin data' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (req) => {
    setPaymentModal({
      open: true,
      requestId: req.id,
      customerName: req.customer_name || req.name,
      amount: '25.00',
      currency: 'USD',
      paymentMethod: 'cash',
      referenceNumber: `REC-${Date.now().toString().slice(-6)}`,
      notes: 'Manual payment verified by admin'

    });
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      await api.admin.recordPayment(paymentModal.requestId, {
        amount: parseFloat(paymentModal.amount),
        currency: paymentModal.currency,
        paymentMethod: paymentModal.paymentMethod,
        referenceNumber: paymentModal.referenceNumber,
        notes: paymentModal.notes
      });
      setPaymentModal({ ...paymentModal, open: false });
      setFeedback({ type: 'success', message: 'Payment recorded successfully! Request is now marked as Paid.' });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to record payment' });
    }
  };

  const [copiedMsg, setCopiedMsg] = useState(false);

  const handleActivate = async (req) => {
    const name = req.customer_name || req.name;
    if (!window.confirm(`Activate customer account for "${name}"? This will create login credentials and instantiate their invitation.`)) {
      return;
    }
    try {
      const res = await api.admin.activateCustomer(req.id);
      setActivationResult({
        ...res.data,
        customerName: name,
        customerPhone: req.customer_phone || req.phone,
        customerEmail: req.customer_email || req.email
      });
      setFeedback({ type: 'success', message: `Customer ${name} activated successfully!` });
      loadData();
    } catch (err) {

      setFeedback({ type: 'error', message: err.message || 'Failed to activate customer' });
    }
  };

  const handleOpenCreateModal = () => {
    setCreateModal({
      open: true,
      fullName: '',
      email: '',
      phone: '',
      recipientName: '',
      customPassword: '',
      submitting: false,
    });
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      setCreateModal((prev) => ({ ...prev, submitting: true }));
      const payload = {
        fullName: createModal.fullName.trim(),
        email: createModal.email.trim(),
        phone: createModal.phone.trim(),
        recipientName: createModal.recipientName.trim() || 'My Love',
      };
      if (createModal.customPassword && createModal.customPassword.trim()) {
        payload.customPassword = createModal.customPassword.trim();
      }

      const res = await api.admin.createCustomer(payload);
      setCreateModal((prev) => ({ ...prev, open: false, submitting: false }));

      setActivationResult({
        ...res.data,
        customerName: payload.fullName,
        customerPhone: payload.phone,
        customerEmail: payload.email,
      });

      setFeedback({ type: 'success', message: `Customer "${payload.fullName}" added and activated successfully!` });
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create customer' });
      setCreateModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  const getWelcomeText = (act) => {

    const loginUrl = `${window.location.origin}/login`;
    const email = act.customerEmail || act.email || act.credentials?.email;
    const tempPass = act.temporaryPassword || act.credentials?.temporaryPassword;
    const name = act.customerName || 'there';
    return `Hey ${name}! ❤️ Your romantic date invitation builder account is ready! 🥂✨\n\nHere are your login credentials:\n🔗 Portal: ${loginUrl}\n📧 Email: ${email}\n🔑 Temporary Password: ${tempPass}\n\nLog in now to customize your proposal question, choose locations & cuisine, and publish your live link!`;
  };

  const handleSendWhatsApp = (act) => {
    const text = getWelcomeText(act);
    const cleanPhone = String(act.customerPhone || '').replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone.startsWith('+') ? cleanPhone : '+' + cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = (act) => {
    const text = getWelcomeText(act);
    navigator.clipboard.writeText(text);
    setCopiedMsg(true);
    setTimeout(() => setCopiedMsg(false), 2500);
  };



  const handleResetAndSendCredentials = async (customer) => {
    if (!customer.user_id) {
      setFeedback({ type: 'error', message: 'No user account linked to this customer yet.' });
      return;
    }
    const name = customer.full_name || customer.name;
    if (!window.confirm(`Generate a new temporary password for "${name}" and prepare WhatsApp dispatch message?`)) {
      return;
    }
    try {
      const res = await api.admin.resetPassword(customer.user_id);
      setActivationResult({
        email: customer.email,
        temporaryPassword: res.data?.temporaryPassword || res.temporaryPassword,
        customerName: name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
      });
      setFeedback({ type: 'success', message: `New temporary password generated for ${name}!` });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reset password' });
    }
  };

  const handleToggleSuspend = async (customerId, currentStatus) => {
    try {
      if (currentStatus === 'suspended') {
        await api.admin.reactivateCustomer(customerId);
        setFeedback({ type: 'success', message: 'Customer reactivated.' });
      } else {
        await api.admin.suspendCustomer(customerId);
        setFeedback({ type: 'success', message: 'Customer suspended.' });
      }
      loadData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Action failed' });
    }
  };

  return (
    <div className="app-viewport" style={{ overflowY: 'auto', minHeight: '100vh', paddingBottom: '60px' }}>
      {/* Header */}
      <header className="app-top-bar" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="brand-tag">
          <ShieldCheck size={16} className="sparkle-icon" color="#ff758f" />
          <span>Platform Admin Portal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#ffb3c1' }}>{user?.email}</span>
          <button
            onClick={() => logout().then(() => navigate('/login'))}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffc2d1',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div style={{ maxWidth: '1000px', margin: '24px auto', padding: '0 20px' }}>
        {/* Feedback Alert */}
        {feedback.message && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: feedback.type === 'success' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${feedback.type === 'success' ? 'rgba(74, 222, 128, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
            borderRadius: '10px',
            color: feedback.type === 'success' ? '#86efac' : '#fca5a5',
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Tab Controls & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setActiveTab('requests')}
              className={activeTab === 'requests' ? 'btn btn-primary' : 'btn btn-secondary-outline'}
              style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CreditCard size={16} />
              <span>Customer Requests & Activation</span>
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={activeTab === 'customers' ? 'btn btn-primary' : 'btn btn-secondary-outline'}
              style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Users size={16} />
              <span>Active Customers</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="btn btn-primary pulse-glow"
            style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <UserPlus size={16} />
            <span>+ Add Customer Directly</span>
          </button>
        </div>

        {/* Tab 1: Requests Table */}
        {activeTab === 'requests' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                Customer Requests
              </h2>
              <button
                onClick={loadData}
                style={{ background: 'transparent', border: 'none', color: '#ff758f', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>

            {loading ? (
              <p style={{ color: '#ffb3c1', textAlign: 'center', padding: '20px' }}>Loading requests...</p>
            ) : requests.length === 0 ? (
              <p style={{ color: '#ffb3c1', textAlign: 'center', padding: '20px' }}>No requests submitted yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 77, 109, 0.2)', color: '#ffc2d1' }}>
                      <th style={{ padding: '10px 8px' }}>Customer</th>
                      <th style={{ padding: '10px 8px' }}>Recipient</th>
                      <th style={{ padding: '10px 8px' }}>Phone / Email</th>
                      <th style={{ padding: '10px 8px' }}>Status</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255, 77, 109, 0.1)', color: '#fff' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{r.customer_name || r.name}</td>
                        <td style={{ padding: '12px 8px', color: '#ffd166' }}>{r.recipient_name}</td>
                        <td style={{ padding: '12px 8px', color: '#ffc2d1' }}>
                          <div>{r.customer_phone || r.phone}</div>
                          <div style={{ fontSize: '11px', opacity: 0.8 }}>{r.customer_email || r.email}</div>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: r.status === 'account_created'
                              ? 'rgba(74, 222, 128, 0.2)'
                              : r.status === 'paid'
                              ? 'rgba(56, 189, 248, 0.2)'
                              : 'rgba(234, 179, 8, 0.2)',
                            color: r.status === 'account_created'
                              ? '#4ade80'
                              : r.status === 'paid'
                              ? '#38bdf8'
                              : '#fde047'
                          }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          {r.status !== 'paid' && r.status !== 'account_created' && (
                            <button
                              onClick={() => handleOpenPayment(r)}
                              className="btn btn-secondary-outline"
                              style={{ padding: '4px 10px', fontSize: '11px', marginRight: '6px' }}
                            >
                              Record Payment
                            </button>
                          )}
                          {r.status === 'paid' && (
                            <button
                              onClick={() => handleActivate(r)}
                              className="btn btn-primary pulse-glow"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              Activate Account
                            </button>
                          )}

                          {r.status === 'account_created' && (
                            <span style={{ color: '#4ade80', fontSize: '11px', fontWeight: 600 }}>
                              ✓ Active
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Customers Table */}
        {activeTab === 'customers' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#fff', marginBottom: '18px' }}>
              Activated Customer Accounts
            </h2>

            {loading ? (
              <p style={{ color: '#ffb3c1', textAlign: 'center', padding: '20px' }}>Loading accounts...</p>
            ) : customers.length === 0 ? (
              <p style={{ color: '#ffb3c1', textAlign: 'center', padding: '20px' }}>No active customers found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255, 77, 109, 0.2)', color: '#ffc2d1' }}>
                      <th style={{ padding: '10px 8px' }}>Customer Name</th>
                      <th style={{ padding: '10px 8px' }}>Login Email</th>
                      <th style={{ padding: '10px 8px' }}>Phone</th>
                      <th style={{ padding: '10px 8px' }}>Account Status</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid rgba(255, 77, 109, 0.1)', color: '#fff' }}>
                        <td style={{ padding: '12px 8px', fontWeight: 600 }}>{c.full_name || c.name}</td>
                        <td style={{ padding: '12px 8px', color: '#ffd166' }}>{c.email}</td>
                        <td style={{ padding: '12px 8px', color: '#ffc2d1' }}>{c.phone}</td>

                        <td style={{ padding: '12px 8px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: c.status === 'active' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: c.status === 'active' ? '#4ade80' : '#f87171'
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                            {c.user_id && (
                              <button
                                onClick={() => handleResetAndSendCredentials(c)}
                                className="btn btn-secondary-outline"
                                style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                title="Generate new temporary credentials & send via WhatsApp"
                              >
                                <Key size={12} />
                                <span>Send Credentials</span>
                              </button>
                            )}
                            <button
                              onClick={() => handleToggleSuspend(c.id, c.status)}
                              className="btn btn-secondary-outline"
                              style={{ padding: '4px 10px', fontSize: '11px' }}
                            >
                              {c.status === 'suspended' ? 'Reactivate' : 'Suspend'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Payment Record Modal */}
      {paymentModal.open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
              Record Payment
            </h3>
            <p style={{ color: '#ffb3c1', fontSize: '0.85rem', marginBottom: '18px' }}>
              Recording payment for <strong>{paymentModal.customerName}</strong>.
            </p>

            <form onSubmit={handleSavePayment}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Amount (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={paymentModal.amount}
                  onChange={(e) => setPaymentModal({ ...paymentModal, amount: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Payment Method
                </label>
                <select
                  value={paymentModal.paymentMethod}
                  onChange={(e) => setPaymentModal({ ...paymentModal, paymentMethod: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#1c0612', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                >
                  <option value="cash">Cash in Person</option>
                  <option value="whish">Whish Money</option>
                  <option value="omt">OMT / Western Union</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="zelle">Zelle / Venmo</option>
                  <option value="other">Other Manual Method</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Reference Number / Receipt ID
                </label>
                <input
                  type="text"
                  required
                  value={paymentModal.referenceNumber}
                  onChange={(e) => setPaymentModal({ ...paymentModal, referenceNumber: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setPaymentModal({ ...paymentModal, open: false })}
                  className="btn btn-secondary-outline"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 16px' }}
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Customer Creation Modal */}
      {createModal.open && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '480px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(255, 77, 109, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <UserPlus size={20} color="#ff758f" />
              </div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#fff', margin: 0 }}>
                Add New Customer
              </h3>
            </div>
            <p style={{ color: '#ffb3c1', fontSize: '0.85rem', marginBottom: '18px' }}>
              Directly onboard a customer, generate login credentials, and initialize their invitation builder workspace.
            </p>

            <form onSubmit={handleCreateCustomer}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Customer Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karim Mansour"
                  value={createModal.fullName}
                  onChange={(e) => setCreateModal({ ...createModal, fullName: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. karim@dana.love"
                    value={createModal.email}
                    onChange={(e) => setCreateModal({ ...createModal, email: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                    WhatsApp Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +96171999888"
                    value={createModal.phone}
                    onChange={(e) => setCreateModal({ ...createModal, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Partner / Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dana (defaults to 'My Love')"
                  value={createModal.recipientName}
                  onChange={(e) => setCreateModal({ ...createModal, recipientName: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#ffc2d1', marginBottom: '4px' }}>
                  Custom Temporary Password (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave empty to auto-generate secure password"
                  value={createModal.customPassword}
                  onChange={(e) => setCreateModal({ ...createModal, customPassword: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: 'rgba(20,4,12,0.65)', border: '1px solid rgba(255,77,109,0.25)', borderRadius: '8px', color: '#fff', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setCreateModal({ ...createModal, open: false })}
                  className="btn btn-secondary-outline"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createModal.submitting}
                  className="btn btn-primary pulse-glow"
                  style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <UserPlus size={16} />
                  <span>{createModal.submitting ? 'Creating Account...' : 'Create & Generate Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activation Success Modal */}
      {activationResult && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="glass-card" style={{ maxWidth: '440px', width: '100%', padding: '28px', textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              margin: '0 auto 16px',
              borderRadius: '50%',
              background: 'rgba(74, 222, 128, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={32} color="#4ade80" />
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', color: '#fff', marginBottom: '8px' }}>
              Account Activated!
            </h3>
            <p style={{ color: '#ffb3c1', fontSize: '0.85rem', marginBottom: '18px' }}>
              Share these login credentials with the customer:
            </p>

            <div style={{
              padding: '14px',
              background: 'rgba(20,4,12,0.65)',
              border: '1px solid rgba(255,77,109,0.25)',
              borderRadius: '8px',
              textAlign: 'left',
              fontSize: '13px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '6px' }}><strong>Login Email:</strong> <span style={{ color: '#ffd166' }}>{activationResult.email || activationResult.credentials?.email}</span></div>
              <div><strong>Temporary Password:</strong> <code style={{ color: '#ff758f', background: 'rgba(255,77,109,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{activationResult.temporaryPassword || activationResult.credentials?.temporaryPassword}</code></div>
            </div>


            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {activationResult.customerPhone && (
                <button
                  type="button"
                  onClick={() => handleSendWhatsApp(activationResult)}
                  className="btn btn-whatsapp pulse-glow"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <Send size={16} />
                  <span>Send Credentials via WhatsApp</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => handleCopyMessage(activationResult)}
                className="btn btn-secondary-outline"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                {copiedMsg ? (
                  <>
                    <Check size={16} color="#4ade80" />
                    <span>Copied Message to Clipboard! ✨</span>
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    <span>Copy Welcome Message</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setActivationResult(null)}
              className="btn btn-secondary-outline"
              style={{ width: '100%', opacity: 0.8 }}
            >
              Done / Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
}
