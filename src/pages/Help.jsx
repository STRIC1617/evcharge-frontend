import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Settings.css'

export default function Help() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [expandedFaq, setExpandedFaq] = useState(null)

  const faqs = [
    {
      id: 1,
      question: 'How do I start a charging session?',
      answer: 'Navigate to a charging station, select an available connector, and tap "Start Charging". Make sure your vehicle is properly connected before starting.'
    },
    {
      id: 2,
      question: 'How do I book a charging slot?',
      answer: 'Go to any station page and select your preferred connector and time slot. Bookings can be made up to 24 hours in advance.'
    },
    {
      id: 3,
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit/debit cards, UPI, and wallet payments. You can manage your payment methods in the Billing section.'
    },
    {
      id: 4,
      question: 'How is the charging cost calculated?',
      answer: 'Charging costs are based on energy consumed (per kWh) plus any applicable time-based charges. Rates vary by station and time of day.'
    },
    {
      id: 5,
      question: 'What if the charger is not working?',
      answer: 'If you encounter a faulty charger, please report it through the app. You can also contact our support team for immediate assistance.'
    },
    {
      id: 6,
      question: 'Can I cancel a booking?',
      answer: 'Yes, bookings can be cancelled up to 30 minutes before the scheduled time without any charges. Late cancellations may incur a fee.'
    }
  ]

  if (!user) {
    navigate('/login')
    return null
  }

  return (
    <div className="settings-page">
      <div className="settings-container">
        <button className="back-button" onClick={() => navigate('/profile')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>

        <h1 className="page-title">Help & Support</h1>
        <p className="page-subtitle">Find answers or reach out to us</p>

        <section className="settings-section">
          <h2 className="section-title">Frequently Asked Questions</h2>
          
          <div className="faq-list">
            {faqs.map(faq => (
              <div key={faq.id} className="faq-item">
                <button 
                  className={`faq-question ${expandedFaq === faq.id ? 'expanded' : ''}`}
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                >
                  <span>{faq.question}</span>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="faq-icon"
                  >
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {expandedFaq === faq.id && (
                  <div className="faq-answer">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">Contact Us</h2>
          
          <a href="mailto:support@chargeconnect.com" className="contact-item">
            <div className="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Email Support</span>
              <span className="contact-value">support@chargeconnect.com</span>
            </div>
          </a>

          <a href="tel:+911800123456" className="contact-item">
            <div className="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Phone Support</span>
              <span className="contact-value">1800-123-456 (Toll Free)</span>
            </div>
          </a>

          <div className="contact-item">
            <div className="contact-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="contact-info">
              <span className="contact-label">Support Hours</span>
              <span className="contact-value">24/7 Available</span>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="section-title">Resources</h2>
          
          <button className="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            User Guide
          </button>

          <button className="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
            </svg>
            Live Chat
          </button>

          <button className="action-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Report an Issue
          </button>
        </section>
      </div>
    </div>
  )
}
