import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { ANCHOR, ID } from '@/content/ids';
import { CREDENTIALS, CREDENTIAL_ICONS, CREDENTIALS_ART } from '@/content/home/about';
import { CredentialsList } from './CredentialsList';

export function Credentials() {
  return (
    <>
      {/* ── Section 3: Credentials list ── */}
      <Section id={ID.aboutCredentials} anchor={ANCHOR.credentials} tone="dark" fit="free" pad="section" seam>
        {/* Subtle couple line-art background at low opacity */}
        <img
          src={CREDENTIALS_ART}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute bottom-0 left-0 w-[65%] h-[65%] object-contain object-bottom-left pointer-events-none select-none opacity-[0.18] z-0"
        />

        <Container maxWidth="2xl" gutter="wide" className="relative z-[1]">
          <div className="flex flex-col items-center gap-[clamp(56px,8vw,100px)]">

            <ScrollReveal>
              <SectionTitle id={ID.aboutCredentialsTitle} className="text-center">ליווי להתגברות על מכשולים וחיזוק הקשר בין בני הזוג
              </SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <CredentialsList items={CREDENTIALS} checkIconSrc={CREDENTIAL_ICONS} onDark />
            </ScrollReveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
