'use client';

const PHONE_URL = 'tel:+972545711060';

export function PhoneFAB() {
  return (
    <a
      href={PHONE_URL}
      aria-label="התקשרו אליי"
      className="
        fixed bottom-6 right-6 z-50 md:hidden
        flex items-center justify-center
        w-[56px] h-[56px]
        rounded-full
        shadow-lg hover:shadow-xl
        transition-transform duration-200 hover:scale-110
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#2563eb]/50
      "
      style={{ backgroundColor: '#2563eb' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        width="28"
        height="28"
        aria-hidden="true"
      >
        <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
      </svg>
    </a>
  );
}
