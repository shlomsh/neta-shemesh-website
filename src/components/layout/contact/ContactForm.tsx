'use client';

import { useState } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    // Placeholder — wire up real submission as needed
    setTimeout(() => setStatus('sent'), 800);
  }

  const fieldClass =
    'w-full rounded-[6px] px-[16px] py-[12px] text-right ' +
    'bg-[var(--color-cream)] text-[var(--color-plum)] placeholder:text-[var(--color-mauve)] ' +
    'border border-[var(--color-mauve)] focus:outline-none focus:border-[var(--color-plum)] ' +
    'transition-colors';

  const labelClass =
    'block text-right mb-[6px] text-[var(--color-plum)] tracking-[0.012em]';

  return (
    <form
      onSubmit={handleSubmit}
      dir="rtl"
      noValidate
      className="flex flex-col gap-[24px] font-[family-name:var(--font-stanga)]"
    >
      {/* Name */}
      <div>
        <label htmlFor="contact-name" className={labelClass}>
          שם מלא
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="השם שלך"
          className={fieldClass}
        />
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="contact-phone" className={labelClass}>
          טלפון
        </label>
        <input
          id="contact-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="מספר הטלפון שלך"
          className={fieldClass}
        />
      </div>

      {/* Email */}
      <div>
        <label htmlFor="contact-email" className={labelClass}>
          אימייל
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="כתובת האימייל שלך"
          className={fieldClass}
        />
      </div>

      {/* Message */}
      <div>
        <label htmlFor="contact-message" className={labelClass}>
          הודעה
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          required
          placeholder="כתבו לי..."
          className={`${fieldClass} resize-none`}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status !== 'idle'}
        className={[
          'w-full rounded-[6px] py-[14px] px-[24px] font-bold tracking-[0.05em]',
          'transition-opacity',
          status === 'idle'
            ? 'bg-[var(--color-blush)] text-[var(--color-dark)] hover:opacity-90'
            : 'bg-[var(--color-blush)] text-[var(--color-dark)] opacity-60 cursor-not-allowed',
        ].join(' ')}
      >
        {status === 'sent' ? 'ההודעה נשלחה!' : status === 'sending' ? 'שולח...' : 'שלחו הודעה'}
      </button>
    </form>
  );
}
