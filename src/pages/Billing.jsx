import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../utils/api'
import './Billing.css'

export default function Billing() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [invoices, setInvoices] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [showPayModal, setShowPayModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('phonepe')
  const [message, setMessage] = useState(null)
  const [processingPayment, setProcessingPayment] = useState(false)
  const [checkingPayment, setCheckingPayment] = useState(false)

  const checkPaymentStatus = useCallback(async (txnId) => {
    setCheckingPayment(true)
    try {
      const result = await api.get(`/payments/phonepe/status/${txnId}`)
      if (result.status === 'completed') {
        setMessage({ type: 'success', text: 'Payment successful!' })
        loadData()
      } else if (result.status === 'pending') {
        setMessage({ type: 'info', text: 'Payment is being processed...' })
        setTimeout(() => checkPaymentStatus(txnId), 3000)
        return
      } else {
        setMessage({ type: 'error', text: result.message || 'Payment failed' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to check payment status' })
    } finally {
      setCheckingPayment(false)
      setTimeout(() => setMessage(null), 5000)
    }
  }, [])

  useEffect(() => {
    loadData()
    
    const txnId = searchParams.get('txn')
    if (txnId) {
      setSearchParams({})
      checkPaymentStatus(txnId)
    }
  }, [searchParams, setSearchParams, checkPaymentStatus])

  const loadData = async () => {
    try {
      const [invoicesData, summaryData] = await Promise.all([
        api.get('/billing/invoices'),
        api.get('/billing/summary')
      ])
      setInvoices(invoicesData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Failed to load billing:', error)
    } finally {
      setLoading(false)
    }
  }

  const openPayModal = (invoice) => {
    setSelectedInvoice(invoice)
    setPaymentMethod('phonepe')
    setShowPayModal(true)
  }

  const handlePayInvoice = async () => {
    if (!selectedInvoice) return
    setProcessingPayment(true)

    try {
      if (paymentMethod === 'phonepe') {
        const response = await api.post('/payments/phonepe/initiate', { 
          invoice_id: selectedInvoice.id 
        })
        
        if (response.success && response.redirect_url) {
          window.location.href = response.redirect_url
        } else {
          setMessage({ type: 'error', text: response.message || 'Failed to initiate payment' })
        }
      } else {
        await api.post(`/billing/pay/${selectedInvoice.id}`, { payment_method: paymentMethod })
        setShowPayModal(false)
        setSelectedInvoice(null)
        setMessage({ type: 'success', text: 'Payment successful!' })
        setTimeout(() => setMessage(null), 3000)
        loadData()
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setProcessingPayment(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`

  const getFilteredInvoices = () => {
    if (activeTab === 'all') return invoices
    return invoices.filter(inv => inv.status === activeTab)
  }

  const pendingCount = invoices.filter(inv => inv.status === 'pending').length
  const paidCount = invoices.filter(inv => inv.status === 'paid').length

  if (loading) {
    return (
      <div className="billing-page">
        <div className="loading-skeleton">
          <div className="skeleton-summary"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton-card"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="billing-page">
      {message && (
        <div className={`message-toast ${message.type}`}>
          {message.type === 'success' ? '✓' : '!'} {message.text}
        </div>
      )}

      <div className="billing-header">
        <h1 className="page-title">Billing</h1>
        {pendingCount > 0 && (
          <span className="pending-badge">{pendingCount} pending</span>
        )}
      </div>

      {summary && (
        <div className="summary-grid">
          <div className="summary-card main">
            <div className="summary-icon">💵</div>
            <div className="summary-content">
              <span className="summary-value">{formatCurrency(summary.total_spent)}</span>
              <span className="summary-label">Total Spent</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">🔋</div>
            <div className="summary-content">
              <span className="summary-value">{summary.total_sessions}</span>
              <span className="summary-label">Sessions</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon">⚡</div>
            <div className="summary-content">
              <span className="summary-value">{parseFloat(summary.total_energy || 0).toFixed(0)}</span>
              <span className="summary-label">kWh Used</span>
            </div>
          </div>
          <div className={`summary-card ${parseFloat(summary.pending_amount) > 0 ? 'pending' : ''}`}>
            <div className="summary-icon">⏳</div>
            <div className="summary-content">
              <span className="summary-value">{formatCurrency(summary.pending_amount)}</span>
              <span className="summary-label">Pending</span>
            </div>
          </div>
        </div>
      )}

      <div className="invoices-section">
        <div className="tabs-row">
          <button 
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({invoices.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'paid' ? 'active' : ''}`}
            onClick={() => setActiveTab('paid')}
          >
            Paid ({paidCount})
          </button>
        </div>

        {getFilteredInvoices().length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No invoices</h3>
            <p>{activeTab === 'all' ? 'Your invoices will appear here' : `No ${activeTab} invoices`}</p>
          </div>
        ) : (
          <div className="invoices-list">
            {getFilteredInvoices().map(invoice => (
              <div key={invoice.id} className={`invoice-card ${invoice.status}`}>
                <div className="invoice-card-header">
                  <div className="invoice-icon-wrapper">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="16" y1="13" x2="8" y2="13"/>
                      <line x1="16" y1="17" x2="8" y2="17"/>
                    </svg>
                  </div>
                  <div className="invoice-main">
                    <span className="invoice-id">INV-{String(invoice.id).padStart(4, '0')}</span>
                    <h3>{invoice.station_name || 'Charging Session'}</h3>
                  </div>
                  <span className={`status-badge ${invoice.status}`}>
                    {invoice.status === 'paid' ? 'Paid' : 'Pending'}
                  </span>
                </div>

                <div className="invoice-meta">
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {formatDate(invoice.created_at)}
                  </span>
                  <span className="meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                    </svg>
                    {invoice.energy_kwh || 0} kWh
                  </span>
                </div>

                <div className="invoice-breakdown">
                  <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span>{formatCurrency(invoice.amount)}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Tax</span>
                    <span>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                  <div className="breakdown-row total">
                    <span>Total</span>
                    <span>{formatCurrency(invoice.total_amount)}</span>
                  </div>
                </div>

                {invoice.status === 'pending' && (
                  <button onClick={() => openPayModal(invoice)} className="pay-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Pay {formatCurrency(invoice.total_amount)}
                  </button>
                )}

                {invoice.status === 'paid' && (
                  <div className="paid-indicator">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Paid
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showPayModal && (
        <div className="modal-overlay" onClick={() => setShowPayModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Pay Invoice</h2>
              <button className="modal-close" onClick={() => setShowPayModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            
            <div className="pay-amount">
              <span className="pay-label">Amount Due</span>
              <span className="pay-value">{formatCurrency(selectedInvoice?.total_amount)}</span>
            </div>

            <div className="payment-methods">
              <label className="payment-method recommended">
                <input 
                  type="radio" 
                  name="payment" 
                  value="phonepe"
                  checked={paymentMethod === 'phonepe'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <div className="phonepe-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect width="24" height="24" rx="4" fill="#5f259f"/>
                      <path d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" fill="white"/>
                      <path d="M14 9h-3v6h2v-2h1c1.1 0 2-.9 2-2s-.9-2-2-2zm0 3h-1v-1h1c.28 0 .5.22.5.5s-.22.5-.5.5z" fill="white"/>
                    </svg>
                  </div>
                  <div className="method-text">
                    <span className="method-name">PhonePe / UPI</span>
                    <span className="method-desc">Pay with any UPI app</span>
                  </div>
                  <span className="recommended-badge">Recommended</span>
                </div>
              </label>
              <label className="payment-method">
                <input 
                  type="radio" 
                  name="payment" 
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                  <div className="method-text">
                    <span className="method-name">Credit/Debit Card</span>
                  </div>
                </div>
              </label>
              <label className="payment-method">
                <input 
                  type="radio" 
                  name="payment" 
                  value="wallet"
                  checked={paymentMethod === 'wallet'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="method-content">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                    <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
                  </svg>
                  <div className="method-text">
                    <span className="method-name">Wallet Balance</span>
                  </div>
                </div>
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowPayModal(false)} disabled={processingPayment}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handlePayInvoice} disabled={processingPayment}>
                {processingPayment ? 'Processing...' : paymentMethod === 'phonepe' ? 'Pay with PhonePe' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
