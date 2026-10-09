import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { ANCHOR, ID } from '@/content/ids';
import { CREDENTIALS, CREDENTIAL_ICONS } from '@/content/home/about';
import { LineArt } from '@/components/site/LineArt';
import { CredentialsList } from './CredentialsList';

export function Credentials() {
  return (
    <>
      {/* ── Section 3: Credentials list ── */}
      <Section id={ID.aboutCredentials} anchor={ANCHOR.credentials} tone="dark" fit="free" phone="screen" pad="section" seam>
        {/* Faint family line-art, drawn in with the pen when the card reveals (NS-54). Cream on plum at 18%. */}
        <div aria-hidden="true" className="absolute bottom-0 left-0 w-[min(88%,380px)] md:w-[min(32%,460px)] md:-left-[2%] aspect-square pointer-events-none select-none opacity-[0.18] z-0">
          <LineArt name="family" className="w-full h-full" />
        </div>

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
