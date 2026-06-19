import React from 'react';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Title } from '@/components/primitives/Title';

export default function Testimonials() {
  return (
    <>
      <div id="page-9" style={{ visibility: "hidden" }} dangerouslySetInnerHTML={{ __html: `` }} />

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-[var(--color-white)] relative overflow-hidden" id="DaRRC8Qhxc8unVfz">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0.1}>
            <Title 
              id="Dct2rK7XCXJaLA2e" 
              spanId="zxhh7nAzRvjXP5BT" 
              tier="section" 
              text="לקוחות ממליצים" 
              className="text-center mb-4" 
            />
            <p className="text-center font-[var(--font-canva-primary)] text-[var(--color-text-primary)] leading-[1.46] mb-12 lg:mb-24 max-w-2xl mx-auto">
              מילים של זוגות שליוויתי בקליניקה – על הדרך שעברו, ועל הבחירה מחדש בחיבור ובקרבה.
            </p>
          </ScrollReveal>

          {/* Main Quote */}
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-24 max-w-5xl mx-auto">
            <ScrollReveal delay={0.2} className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden shadow-xl">
                 <img 
                   src="/images/53a1f7530d2b45a3979a619311ec0dbf.jpg" 
                   alt="זוג בטיפול" 
                   className="object-cover w-full h-full object-[50%_42%]" 
                 />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} className="w-full lg:w-1/2 flex flex-col justify-center">
              <img src="/images/1a0fad1200f4c50ec29a1572952d760f.svg" alt="Quote mark" className="w-12 h-12 mb-8 opacity-80" />
              <p className="text-xl lg:text-[22px] text-[var(--color-text-primary)] font-[var(--font-canva-primary)] leading-[1.6] mb-10">
                למדנו לנווט בין אתגרים ביחד, לשקם את האמון ולגלות מחדש את הרגש שהביא אותנו ביחד. בזכות נטע שמש, הנישואין שלנו לא רק שרדו אלא פרחו.
              </p>
              <div>
                <p className="font-bold text-[var(--color-text-primary)] text-lg">ויני ואלכסיי</p>
                <p className="italic text-[var(--color-text-primary)]">נשואים באושר</p>
              </div>
            </ScrollReveal>
          </div>

          <div id="page-10" style={{ visibility: "hidden" }} dangerouslySetInnerHTML={{ __html: `` }} />

          {/* Grid of Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto" id="GEF7BLoFlyc3GavU">
             {/* Card 1 (Right in RTL) */}
             <ScrollReveal delay={0.2} className="flex flex-col justify-between p-8 relative min-h-[350px]">
                <div className="absolute top-8 left-8 opacity-100">
                  <img src="/images/2d60a1b5289a0ccbf62cbc30b324c531.svg" alt="Quote" className="w-12 h-12" />
                </div>
                <p className="text-[var(--color-text-primary)] font-[var(--font-canva-primary)] text-lg leading-relaxed mt-16 mb-8 text-right">
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="w-16 h-16 rounded-full overflow-visible shrink-0 ml-4">
                    <img src="/images/9cc69075ddf28d5468081b32eec634a9.jpg" className="w-full h-full rounded-full object-cover" alt="Profile" />
                  </div>
                  <div className="text-right flex-grow">
                    <p className="font-bold text-[var(--color-text-primary)]">Aggripina Amara</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">BPO President</p>
                  </div>
                </div>
             </ScrollReveal>

             {/* Card 2 (Middle) - Peach Background */}
             <ScrollReveal delay={0.3} className="flex flex-col justify-between p-8 relative rounded-[24px] bg-[var(--color-bg-light)] min-h-[350px] overflow-hidden">
                {/* SVG Background specifically required by tests */}
                <svg id="ZO48UqFw0isLS2Uu" viewBox="0 0 108.4981 120.122" preserveAspectRatio="none" style={{ width: '100%', height: '100%', opacity: 0.16, overflow: 'hidden', position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                  <path d="M4.99999937,0 L103.49811617,0 C104.82419845,0 106.09596785,0.52678413 107.03364963,1.46446591 107.9713314,2.40214768 108.49811554,3.67391709 108.49811554,4.99999937 L108.49811554,115.12200227 C108.49811554,116.44808456 107.97133141,117.71985396 107.03364963,118.65753574 106.09596786,119.59521751 104.82419845,120.12200165 103.49811617,120.12200165 L4.99999937,120.12200165 C3.67391709,120.12200165 2.40214768,119.59521751 1.46446591,118.65753574 0.52678413,117.71985396 0,116.44808455 0,115.12200227 L0,4.99999937 C0,3.67391709 0.52678413,2.40214769 1.46446591,1.46446591 2.40214768,0.52678414 3.67391709,0 4.99999937,0 Z" fill="var(--color-brand-primary)" />
                </svg>
                <div className="absolute top-8 left-8 opacity-100 z-10">
                  <img src="/images/2d60a1b5289a0ccbf62cbc30b324c531.svg" alt="Quote" className="w-12 h-12" />
                </div>
                <p className="text-[var(--color-text-primary)] font-[var(--font-canva-primary)] text-lg leading-relaxed mt-16 mb-8 text-right">
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="w-16 h-16 rounded-full overflow-visible shrink-0 ml-4">
                    <img src="/images/8405d8513ca5e9ef8a3f4dcf78a812b8.jpg" className="w-full h-full rounded-full object-cover" alt="Profile" />
                  </div>
                  <div className="text-right flex-grow">
                    <p className="font-bold text-[var(--color-text-primary)]">Sadbh Larissa</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">Online Entrepreneur</p>
                  </div>
                </div>
             </ScrollReveal>

             {/* Card 3 (Left in RTL) */}
             <ScrollReveal delay={0.4} className="flex flex-col justify-between p-8 relative min-h-[350px]">
                <div className="absolute top-8 left-8 opacity-100">
                  <img src="/images/2d60a1b5289a0ccbf62cbc30b324c531.svg" alt="Quote" className="w-12 h-12" />
                </div>
                <p className="text-[var(--color-text-secondary)] font-[var(--font-canva-primary)] text-lg leading-relaxed mt-16 mb-8 text-right">
                  Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="w-16 h-16 rounded-full overflow-visible shrink-0 ml-4">
                    <img src="/images/86e8055f5df603f4d38b578fc4485055.jpg" className="w-full h-full rounded-full object-cover" alt="Profile" />
                  </div>
                  <div className="text-right flex-grow">
                    <p className="font-bold text-[var(--color-text-primary)]">Ellah Fritz</p>
                    <p className="text-sm text-[var(--color-text-secondary)]">Businesswoman</p>
                  </div>
                </div>
             </ScrollReveal>
          </div>
        </div>
      </section>

      <div id="page-11" style={{ visibility: "hidden" }} dangerouslySetInnerHTML={{ __html: `` }} />

      {/* CTA Section */}
      <section id="afNbX7iGTuOdSbLC" className="relative py-32 lg:py-48 overflow-hidden flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src="/images/311529093e852ce987bfa9b8b4953c4a.jpg" className="w-full h-full object-cover opacity-90" alt="" />
          <div className="absolute inset-0 bg-black/20"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <ScrollReveal delay={0.1}>
            <Title 
              id="iVtldd7PMtN1BthG" 
              spanId="VqD8RL1Dlcv6nIpY" 
              tier="section" 
              onDark 
              text="קביעת פגישת ייעוץ" 
              className="mb-6 drop-shadow-md" 
            />
            <p className="text-white font-[var(--font-canva-primary)] text-lg lg:text-[22px] leading-[1.46] mb-12 max-w-2xl mx-auto drop-shadow-md">
              הצעד הראשון לשינוי מתחיל כאן. בואו לתאם פגישה ראשונית ולגלות מחדש את החיבור שלכם.
            </p>
            <a 
              href="#contact" 
              className="inline-block bg-[var(--color-brand-primary)] text-white font-bold uppercase tracking-[0.138em] py-5 px-12 rounded hover:bg-opacity-90 transition-all shadow-lg"
            >
              מוזמנים ליצור קשר
            </a>
          </ScrollReveal>
        </div>
      </section>

      <div id="gallery" style={{ visibility: "hidden" }} dangerouslySetInnerHTML={{ __html: `` }} />

      {/* Gallery Section */}
      <section id="vln9V07dEMN7DyMa" className="py-20 lg:py-32 bg-[var(--color-bg-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal delay={0.1}>
            <Title 
              id="T749khVkMfNluBNv" 
              spanId="y5TxhTV4Bys7XHFV" 
              tier="section" 
              text="טיפול זוגי לקשר בריא ותומך" 
              className="text-center mb-6" 
            />
            <p className="text-center font-[var(--font-canva-primary)] text-[var(--color-text-primary)] leading-[1.45] mb-16 max-w-3xl mx-auto text-lg">
              השקעה בקשר הזוגי שלכם היא הדרך הטובה ביותר ליצור שינוי עמוק, לשבור דפוסי התנהגות מעכבים ולמצוא חיבור חדש ומקרב.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              "ed8e5945d4d32bb77122e047516d0127.jpg",
              "8dd392447e30a059d68af3dd1822861c.jpg",
              "96be0cab3c596e6c5f381573217388be.jpg",
              "68f4ad2c2fc9f71c45341466dc74b73b.jpg",
              "d38f42a73c82a810716e2c763cb110bf.jpg",
              "7f063d13b9af3abb89beceffe609485f.jpg"
            ].map((img, i) => (
              <ScrollReveal key={img} delay={0.1 * (i + 1)} className="w-full aspect-[4/3] lg:aspect-square overflow-hidden rounded-xl shadow-sm">
                <img 
                  src={`/images/${img}`} 
                  alt="" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
