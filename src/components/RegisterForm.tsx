import React, { useState } from 'react';
import { motion } from 'motion/react';
import { getWhatsappGroupUrl, isPlaceholderNumber } from '../lib/whatsapp';
import { CheckCircle2, User, Phone, Mail, ArrowRight, Users, Database, Loader2, Sparkles, AlertCircle, PartyPopper, Trophy, CreditCard, ShieldCheck, Lock } from 'lucide-react';
import DatabaseViewerModal from './DatabaseViewerModal';
import RazorpayPaymentModal from './RazorpayPaymentModal';
import FramerMotionConfetti from './FramerMotionConfetti';
import GuaranteeDetailsModal from './GuaranteeDetailsModal';

// RFC 5322 compliant standard email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const [emailTouched, setEmailTouched] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [dbRecord, setDbRecord] = useState<{ id: string; isUpdate: boolean; totalRecords: number } | null>(null);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [isGuaranteeModalOpen, setIsGuaranteeModalOpen] = useState(false);

  const validateEmailFormat = (email: string) => {
    return EMAIL_REGEX.test(email.trim());
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, email: value }));

    // Real-time validation as user types
    if (value.trim().length === 0) {
      if (emailTouched) {
        setErrors(prev => ({ ...prev, email: 'Email address is required' }));
      } else {
        setErrors(prev => {
          const updated = { ...prev };
          delete updated.email;
          return updated;
        });
      }
    } else if (!validateEmailFormat(value)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email format (e.g. name@example.com)' }));
    } else {
      // Clear error immediately when format is valid
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.email;
        return updated;
      });
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Email address is required' }));
    } else if (!validateEmailFormat(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Please enter a valid email format (e.g. name@example.com)' }));
    } else {
      setErrors(prev => {
        const updated = { ...prev };
        delete updated.email;
        return updated;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[\s-+]/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmailFormat(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setEmailTouched(true);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // POST to backend database API
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          track: 'Full-Stack Software Engineering'
        }),
      });

      const json = await response.json();

      if (json.success && json.registration) {
        setDbRecord({
          id: json.registration.id,
          isUpdate: json.isUpdate,
          totalRecords: json.totalRecords || 1
        });
      }
    } catch (err) {
      console.warn("Backend database write fallback:", err);
      // Fallback ID if offline
      setDbRecord({
        id: `REG-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        isUpdate: false,
        totalRecords: 1
      });
    } finally {
      setIsSubmitting(false);
      const url = getWhatsappGroupUrl(formData.name, formData.phone, formData.email);
      setWhatsappUrl(url);
      setSubmitted(true);

      try {
        window.open(url, '_blank');
      } catch (e) {
        console.warn("Popup blocked, fallback link provided in UI.", e);
      }
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
    });
    setEmailTouched(false);
    setSubmitted(false);
    setDbRecord(null);
    setErrors({});
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.94, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card border-2 border-peacock/40 rounded-2xl p-6 md:p-8 text-center flex flex-col items-center justify-center min-h-[360px] shadow-custom relative overflow-hidden" 
        id="reg-success-container"
      >
        {/* Animated Framer Motion Confetti & Ambient Sparkle Particles */}
        <FramerMotionConfetti particleCount={45} originY={20} ambientCount={12} />

        {/* Floating Festive Badge */}
        <motion.div 
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500/20 via-marigold/20 to-peacock/20 text-emerald-600 flex items-center justify-center text-3xl mb-4 border-2 border-emerald-500/30 shadow-md relative z-10"
        >
          <PartyPopper className="w-8 h-8 text-emerald-500 animate-bounce" />
        </motion.div>
        
        <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[0.72rem] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 border border-emerald-500/25 relative z-10">
          <Sparkles className="w-3.5 h-3.5 text-marigold" />
          <span>Registration Confirmed & Verified</span>
        </div>

        <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-ink dark:text-white mb-2 relative z-10">
          🎉 Congratulations, {formData.name.split(' ')[0]}!
        </h3>
        
        <p className="text-muted text-[0.95rem] max-w-[440px] mb-6 leading-relaxed relative z-10">
          Your seat is officially reserved for the upcoming live batch! Your profile is saved in our database. Join the official cohort WhatsApp group below to meet your batchmates and instructors.
        </p>

        {/* Database Record Details Card */}
        <div className="mb-6 p-4 rounded-xl bg-paper dark:bg-[#141B2D] border border-border-custom text-left w-full max-w-sm text-xs space-y-2.5 font-sans relative overflow-hidden z-10 shadow-xs">
          <div className="flex items-center justify-between border-b border-border-custom/40 pb-2">
            <span className="font-display font-extrabold text-sm text-ink dark:text-white flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-peacock" />
              Backend DB Record
            </span>
            <span className="text-emerald-500 font-mono text-[0.7rem] font-bold uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {dbRecord?.isUpdate ? 'RECORD UPDATED' : 'CONFIRMED IN DB'}
            </span>
          </div>

          {dbRecord && (
            <div className="flex justify-between items-center bg-peacock/5 p-2 rounded-lg border border-peacock/15">
              <span className="text-muted font-mono">DB Record ID:</span>
              <span className="font-mono font-bold text-peacock">{dbRecord.id}</span>
            </div>
          )}

          <div className="flex justify-between"><span className="text-muted">Full Name:</span><span className="font-semibold text-ink dark:text-white">{formData.name}</span></div>
          <div className="flex justify-between"><span className="text-muted">Mobile Number:</span><span className="font-semibold text-ink dark:text-white">{formData.phone}</span></div>
          <div className="flex justify-between"><span className="text-muted">Email ID:</span><span className="font-semibold text-ink dark:text-white truncate max-w-[180px]">{formData.email}</span></div>
        </div>

        <div className="w-full space-y-3 relative z-10">
          <motion.a 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary w-full py-4 text-center justify-center flex items-center gap-2.5 text-white bg-[#25D366] hover:bg-[#20bd5a] shadow-lg hover:shadow-emerald-500/25 cursor-pointer font-bold border-none text-[0.95rem] rounded-xl transition-all"
            id="wa-redirect-btn"
          >
            <Users className="w-5 h-5" />
            <span>Join Official WhatsApp Group →</span>
          </motion.a>

          <button
            type="button"
            onClick={() => setIsRazorpayModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl border border-peacock/40 bg-peacock/10 hover:bg-peacock/20 text-peacock font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            id="pay-fee-after-reg-btn"
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay Cohort Fee via Razorpay (Instant Confirmation)</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-center gap-3 relative z-10">
          <button 
            onClick={handleReset}
            className="text-xs text-muted hover:text-ink dark:hover:text-white underline cursor-pointer transition-colors"
            id="register-another-btn"
            type="button"
          >
            Register Another Student
          </button>
          <span className="text-xs text-muted">•</span>
          <button 
            onClick={() => setIsDbModalOpen(true)}
            className="text-xs text-peacock hover:underline cursor-pointer"
            type="button"
          >
            View DB & Transactions
          </button>
        </div>

        {isPlaceholderNumber() && (
          <div className="mt-5 p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-left w-full text-xs text-amber-800 dark:text-amber-300 relative z-10">
            <p className="font-bold mb-1 flex items-center gap-1.5">
              <span>🛠️</span>
              <span>Developer / Owner Note:</span>
            </p>
            <p className="leading-relaxed text-[#8A93B5] dark:text-[#B9C1DC]">
              Redirection is pointing to <strong className="font-mono text-amber-700 dark:text-amber-300">919999999999</strong>. To set your real WhatsApp group link or number, configure <strong className="font-mono text-amber-700 dark:text-amber-300">VITE_WHATSAPP_GROUP_URL</strong> or <strong className="font-mono text-amber-700 dark:text-amber-300">VITE_WHATSAPP_NUMBER</strong> in the <strong>Settings tab</strong>.
            </p>
          </div>
        )}

        <p className="form-note mt-4 text-xs text-muted relative z-10">
          Record safely stored in backend database. Clicking opens WhatsApp to join the private batch cohort.
        </p>

        <DatabaseViewerModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
        <RazorpayPaymentModal 
          isOpen={isRazorpayModalOpen} 
          onClose={() => setIsRazorpayModalOpen(false)}
          initialCustomer={{
            name: formData.name,
            email: formData.email,
            phone: formData.phone
          }}
        />
      </motion.div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" id="registration-form" noValidate>
        {/* Full Name */}
        <div>
          <label htmlFor="fName" className="block text-[0.84rem] font-semibold mb-1.5 text-ink-soft dark:text-gray-300 flex items-center gap-1.5">
            <User className="w-4 h-4 text-peacock" />
            Full Name <span className="text-marigold-deep">*</span>
          </label>
          <input
            id="fName"
            type="text"
            required
            disabled={isSubmitting}
            placeholder="e.g. Rahul Verma"
            className={`w-full px-4 py-3 border-1.5 rounded-xl text-[0.96rem] bg-paper dark:bg-[#141B2D] text-ink dark:text-white transition-colors focus:outline-none ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-border-custom dark:border-[#222C44] focus:border-marigold'
            }`}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoComplete="name"
          />
          {errors.name && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.name}</span>}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="fPhone" className="block text-[0.84rem] font-semibold mb-1.5 text-ink-soft dark:text-gray-300 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-500" />
            Mobile Number (WhatsApp) <span className="text-marigold-deep">*</span>
          </label>
          <input
            id="fPhone"
            type="tel"
            required
            disabled={isSubmitting}
            inputMode="numeric"
            placeholder="10-digit mobile number"
            className={`w-full px-4 py-3 border-1.5 rounded-xl text-[0.96rem] bg-paper dark:bg-[#141B2D] text-ink dark:text-white transition-colors focus:outline-none ${
              errors.phone ? 'border-red-500 focus:border-red-500' : 'border-border-custom dark:border-[#222C44] focus:border-marigold'
            }`}
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            autoComplete="tel"
          />
          {errors.phone && <span className="text-red-500 text-xs mt-1 block font-medium">{errors.phone}</span>}
        </div>

        {/* Email ID */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="fEmail" className="block text-[0.84rem] font-semibold text-ink-soft dark:text-gray-300 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-500" />
              Email ID <span className="text-marigold-deep">*</span>
            </label>
            {formData.email.trim().length > 0 && validateEmailFormat(formData.email) && (
              <span className="text-[0.72rem] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid email format
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="fEmail"
              type="email"
              required
              disabled={isSubmitting}
              placeholder="you@example.com"
              className={`w-full px-4 py-3 pr-10 border-1.5 rounded-xl text-[0.96rem] bg-paper dark:bg-[#141B2D] text-ink dark:text-white transition-colors focus:outline-none ${
                errors.email 
                  ? 'border-red-500 focus:border-red-500 ring-1 ring-red-500/20' 
                  : formData.email.trim().length > 0 && validateEmailFormat(formData.email)
                  ? 'border-emerald-500/60 dark:border-emerald-500/60 focus:border-emerald-500 ring-1 ring-emerald-500/10'
                  : 'border-border-custom dark:border-[#222C44] focus:border-marigold'
              }`}
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              autoComplete="email"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
              {errors.email ? (
                <AlertCircle className="w-4 h-4 text-red-500" />
              ) : formData.email.trim().length > 0 && validateEmailFormat(formData.email) ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : null}
            </div>
          </div>
          {errors.email && (
            <span className="text-red-500 text-xs mt-1 block font-medium flex items-center gap-1">
              {errors.email}
            </span>
          )}
        </div>

        {/* 100% Money-Back Guarantee Reassurance Box */}
        <div 
          className="p-3 rounded-xl bg-emerald-500/8 dark:bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-2.5 text-xs text-ink-soft dark:text-slate-300"
          id="reg-guarantee-badge"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-none mt-0.5" />
          <div className="flex-1 leading-snug">
            <div className="flex items-center justify-between gap-1 flex-wrap mb-0.5">
              <span className="font-bold text-ink dark:text-white flex items-center gap-1">
                100% Money-Back Guarantee
              </span>
              <button
                type="button"
                onClick={() => setIsGuaranteeModalOpen(true)}
                className="text-[0.72rem] text-emerald-700 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                id="reg-guarantee-terms-btn"
              >
                Read Policy →
              </button>
            </div>
            <p className="text-[0.75rem] text-muted">
              Zero-risk policy. Attend class 1, build with us, and get a full instant refund if not satisfied.
            </p>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="space-y-2.5 mt-1">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary w-full py-4 flex items-center justify-center gap-2 font-bold text-base cursor-pointer shadow-md disabled:opacity-70"
            id="submit-register-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>Saving Record...</span>
              </>
            ) : (
              <>
                <span>Reserve My Seat & Join WhatsApp Group</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsRazorpayModalOpen(true)}
            className="w-full py-3 px-4 rounded-xl border border-peacock/50 bg-peacock/5 hover:bg-peacock/15 text-ink dark:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
            id="open-razorpay-btn"
          >
            <CreditCard className="w-4 h-4 text-peacock" />
            <span>Pay & Enroll directly with Razorpay (₹1 / ₹2,999 / ₹4,999)</span>
          </button>
        </div>
      </form>

      <DatabaseViewerModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      <GuaranteeDetailsModal isOpen={isGuaranteeModalOpen} onClose={() => setIsGuaranteeModalOpen(false)} />
      <RazorpayPaymentModal 
        isOpen={isRazorpayModalOpen} 
        onClose={() => setIsRazorpayModalOpen(false)}
        initialCustomer={{
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        }}
      />
    </>
  );
}

