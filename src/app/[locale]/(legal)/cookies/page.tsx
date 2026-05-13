import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalToc } from '@/components/legal/legal-toc';
import type { TocItem } from '@/components/legal/legal-toc';

interface CookiesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CookiesPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale === 'ar') {
    return {
      title: 'سياسة ملفات تعريف الارتباط — زاكرا',
      description:
        'كيفية استخدام زاكرا لملفات تعريف الارتباط للحفاظ على أمان الجلسات وتفضيلات سياق الشركة وتقديم تحليلات مجهولة.',
    };
  }
  return {
    title: 'Cookie Policy — Zakra',
    description:
      'How Zakra uses cookies to keep sessions secure, maintain Company Context preferences, and provide anonymous analytics.',
  };
}

// ─── Shared layout primitives ──────────────────────────────────────────────

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 mt-10 font-sans text-xl font-semibold tracking-tight text-foreground first:mt-0"
    >
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-sans text-sm leading-relaxed text-muted">{children}</p>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full font-sans text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-300">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-medium text-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-surface-300/50">
              {row.map((cell, j) => (
                <td key={j} className={`px-4 py-3 ${j === 0 ? 'font-mono text-xs text-foreground' : 'text-muted'}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── English TOC ───────────────────────────────────────────────────────────

const tocEn: TocItem[] = [
  { id: 'what-are-cookies', label: 'What Are Cookies' },
  { id: 'how-we-use', label: 'How We Use Cookies' },
  { id: 'cookie-table', label: 'Cookie Reference Table' },
  { id: 'what-we-dont', label: "What We Don't Do" },
  { id: 'your-choices', label: 'Your Choices' },
  { id: 'contact', label: 'Contact' },
];

// ─── Arabic TOC ────────────────────────────────────────────────────────────

const tocAr: TocItem[] = [
  { id: 'what-are-cookies', label: 'ما هي ملفات تعريف الارتباط' },
  { id: 'how-we-use', label: 'كيفية استخدامنا لها' },
  { id: 'cookie-table', label: 'جدول مرجعي لملفات تعريف الارتباط' },
  { id: 'what-we-dont', label: 'ما لا نفعله' },
  { id: 'your-choices', label: 'خياراتك' },
  { id: 'contact', label: 'التواصل' },
];

// ─── English content ───────────────────────────────────────────────────────

function EnglishContent({ locale }: { locale: string }) {
  return (
    <article className="min-w-0 flex-1">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="mb-2 font-sans text-xs font-medium uppercase tracking-widest text-accent">
          Legal Document
        </div>
        <h1 className="mb-2 font-sans text-3xl font-semibold tracking-tight text-foreground">
          Cookie Policy
        </h1>
        <p className="font-sans text-sm text-muted">
          <strong className="text-foreground">Product:</strong> Zakra — AI-Powered Enterprise Knowledge Base &amp; Reporting Platform
          <br />
          <strong className="text-foreground">Operated by:</strong> Empowering Energy (trading as ESAP AI)
        </p>
      </div>

      {/* Consent banner preview */}
      <div className="mb-8 rounded-xl border border-accent-border bg-accent-soft p-5">
        <p className="mb-1 font-sans text-sm font-semibold text-foreground">Cookies on Zakra</p>
        <p className="mb-3 font-sans text-sm text-muted">
          This platform uses cookies to keep your session secure, maintain your Company Context preference, and
          provide your organisation with anonymous usage analytics.
        </p>
        <div className="mb-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-accent">✓</span>
            <p className="font-sans text-sm text-muted">
              <strong className="text-foreground">Essential Cookies</strong> — Required for login, session security,
              Company Context, and platform functionality. Cannot be disabled.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-muted">○</span>
            <p className="font-sans text-sm text-muted">
              <strong className="text-foreground">Analytics Cookies</strong> — Anonymous, aggregated platform usage
              data. No personal data included.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-warning-border bg-warning-bg px-3 py-2 font-sans text-xs text-warning">
          ⚠️ Database queries, reports, chat content, and connection credentials are NOT stored in cookies. They are
          handled through encrypted data pipelines under your organisation&apos;s signed DPA.
        </div>
        <div className="mt-4 flex gap-3">
          <div className="rounded-md bg-accent px-4 py-2 font-sans text-sm font-medium text-accent-fg">
            Accept All
          </div>
          <div className="rounded-md border border-border px-4 py-2 font-sans text-sm text-muted">
            Essential Only
          </div>
        </div>
      </div>

      <SectionHeading id="what-are-cookies">What Are Cookies</SectionHeading>
      <P>
        Cookies are small text files placed on your device by a website when you visit. Zakra uses a minimal set of
        cookies strictly necessary for platform operation and anonymous usage analytics. We do not use cookies for
        advertising, behavioural tracking, or profiling.
      </P>

      <SectionHeading id="how-we-use">How We Use Cookies</SectionHeading>
      <P>
        <strong className="text-foreground">Essential cookies</strong> are required for the platform to function.
        They maintain your authenticated session, protect against CSRF attacks, remember your selected Company
        Context, and store your display preferences. These cannot be disabled without breaking core functionality.
      </P>
      <P>
        <strong className="text-foreground">Analytics cookies</strong> collect anonymous, aggregated data about how
        the platform is used. This data contains no personally identifiable information and is used only to improve
        the Zakra platform. These can be declined via the &quot;Essential Only&quot; option in the consent banner.
      </P>

      <SectionHeading id="cookie-table">Cookie Reference Table</SectionHeading>
      <Table
        headers={['Cookie Name', 'Type', 'Purpose', 'Duration']}
        rows={[
          ['session_token', 'Essential', 'Authenticated user session', 'Session end'],
          ['csrf_token', 'Essential', 'Cross-site request forgery protection', 'Session end'],
          ['company_context', 'Essential', 'Active Company Context selection', '1 year'],
          ['user_prefs', 'Essential', 'Display preferences and settings', '1 year'],
          ['_analytics_id', 'Analytics', 'Anonymous platform usage tracking (no PII)', '6 months'],
          ['cookie_consent', 'Essential', 'Records cookie consent choice', '1 year'],
        ]}
      />

      <SectionHeading id="what-we-dont">What We Don&apos;t Do</SectionHeading>
      <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>No advertising, retargeting, or behavioural tracking cookies</li>
        <li>No cookie data shared with marketing platforms or data brokers</li>
        <li>No third-party social media tracking pixels</li>
        <li>No cross-site tracking or fingerprinting</li>
        <li>Database queries, reports, chat content, and credentials are never stored in cookies</li>
      </ul>

      <SectionHeading id="your-choices">Your Choices</SectionHeading>
      <P>
        When you first access Zakra you will be presented with the consent banner above. Selecting{' '}
        <strong className="text-foreground">Accept All</strong> enables both essential and analytics cookies.
        Selecting <strong className="text-foreground">Essential Only</strong> disables the analytics cookie only —
        the platform remains fully functional.
      </P>
      <P>
        Your choice is stored in the <span className="font-mono text-xs text-foreground">cookie_consent</span> cookie
        for 1 year. You can change your preference at any time by clearing your browser cookies and revisiting the
        platform, which will re-display the consent banner.
      </P>
      <P>
        Browser-level cookie controls are also available. Blocking all cookies may affect essential session and
        Company Context functionality.
      </P>

      <SectionHeading id="contact">Contact</SectionHeading>
      <P>
        Questions about cookies or consent can be directed to the Empowering Energy Data Privacy Team:
      </P>
      <div className="rounded-lg border border-border bg-surface-200 p-4">
        <p className="mb-1 font-sans text-sm font-medium text-foreground">Empowering Energy — Data Privacy Team</p>
        <p className="font-sans text-sm text-muted">
          📧{' '}
          <a href="mailto:privacy@esap.ai" className="text-accent hover:underline">
            privacy@esap.ai
          </a>
          {'  '}·{'  '}
          🌐{' '}
          <Link href={`/${locale}/cookies`} className="text-accent hover:underline">
            zakra.esap.ai/cookies
          </Link>
        </p>
      </div>

      {/* Also see */}
      <div className="mt-6 flex gap-4">
        <Link
          href={`/${locale}/privacy`}
          className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          Privacy Policy →
        </Link>
        <Link
          href={`/${locale}/terms`}
          className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          Terms of Service →
        </Link>
      </div>
    </article>
  );
}

// ─── Arabic content ────────────────────────────────────────────────────────

function ArabicContent({ locale }: { locale: string }) {
  return (
    <article className="min-w-0 flex-1">
      {/* Header */}
      <div className="mb-8 border-b border-border pb-6">
        <div className="mb-2 font-sans text-xs font-medium uppercase tracking-widest text-accent">
          وثيقة قانونية
        </div>
        <h1 className="mb-2 font-sans text-3xl font-semibold tracking-tight text-foreground">
          سياسة ملفات تعريف الارتباط
        </h1>
        <p className="font-sans text-sm text-muted">
          <strong className="text-foreground">المنتج:</strong> زاكرا — منصة قاعدة المعرفة والتقارير المؤسسية المدعومة بالذكاء الاصطناعي
          <br />
          <strong className="text-foreground">تشغيل:</strong> Empowering Energy (المعروفة باسم ESAP AI)
        </p>
      </div>

      {/* Consent banner preview — Arabic */}
      <div className="mb-8 rounded-xl border border-accent-border bg-accent-soft p-5">
        <p className="mb-1 font-sans text-sm font-semibold text-foreground">ملفات تعريف الارتباط على زاكرا</p>
        <p className="mb-3 font-sans text-sm text-muted">
          تستخدم هذه المنصة ملفات تعريف الارتباط للحفاظ على أمان جلستك وتذكّر تفضيلات سياق الشركة وتزويد مؤسستك بتحليلات استخدام مجهولة.
        </p>
        <div className="mb-3 space-y-2">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-accent">✓</span>
            <p className="font-sans text-sm text-muted">
              <strong className="text-foreground">ملفات تعريف الارتباط الأساسية</strong> — مطلوبة لتسجيل الدخول وأمان الجلسة وسياق الشركة ووظائف المنصة. لا يمكن تعطيلها.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <span className="mt-0.5 shrink-0 text-muted">○</span>
            <p className="font-sans text-sm text-muted">
              <strong className="text-foreground">ملفات تعريف الارتباط التحليلية</strong> — بيانات استخدام المنصة المجمّعة المجهولة. لا تتضمّن بيانات شخصية.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-warning-border bg-warning-bg px-3 py-2 font-sans text-xs text-warning">
          ⚠️ استعلامات قاعدة البيانات والتقارير ومحتوى الدردشة وبيانات اعتماد الاتصال لا تُخزَّن في ملفات تعريف الارتباط قط. تُعالَج عبر قنوات بيانات مشفّرة بموجب اتفاقية معالجة البيانات الموقّعة مع مؤسستك.
        </div>
        <div className="mt-4 flex gap-3">
          <div className="rounded-md bg-accent px-4 py-2 font-sans text-sm font-medium text-accent-fg">
            قبول الكل
          </div>
          <div className="rounded-md border border-border px-4 py-2 font-sans text-sm text-muted">
            الأساسية فقط
          </div>
        </div>
      </div>

      <SectionHeading id="what-are-cookies">ما هي ملفات تعريف الارتباط</SectionHeading>
      <P>
        ملفات تعريف الارتباط هي ملفات نصية صغيرة تضعها المواقع الإلكترونية على جهازك عند زيارتها. تستخدم زاكرا حدًّا أدنى من ملفات تعريف الارتباط الضرورية تمامًا لتشغيل المنصة وتحليلات الاستخدام المجهولة. لا نستخدم ملفات تعريف الارتباط للإعلانات أو تتبّع السلوك أو التنميط.
      </P>

      <SectionHeading id="how-we-use">كيفية استخدامنا لها</SectionHeading>
      <P>
        <strong className="text-foreground">ملفات تعريف الارتباط الأساسية</strong> مطلوبة لعمل المنصة.
        تحافظ على جلستك المصادَق عليها وتحميك من هجمات CSRF وتتذكّر سياق الشركة المحدد وتخزّن تفضيلات العرض. لا يمكن تعطيلها دون تعطيل الوظائف الأساسية.
      </P>
      <P>
        <strong className="text-foreground">ملفات تعريف الارتباط التحليلية</strong> تجمع بيانات مجهولة ومجمّعة عن كيفية استخدام المنصة. لا تحتوي هذه البيانات على أي معلومات تعريفية شخصية وتُستخدَم فقط لتحسين منصة زاكرا. يمكن رفضها عبر خيار &quot;الأساسية فقط&quot; في لافتة الموافقة.
      </P>

      <SectionHeading id="cookie-table">جدول مرجعي لملفات تعريف الارتباط</SectionHeading>
      <Table
        headers={['اسم ملف تعريف الارتباط', 'النوع', 'الغرض', 'المدة']}
        rows={[
          ['session_token', 'أساسي', 'جلسة المستخدم المصادَق عليها', 'نهاية الجلسة'],
          ['csrf_token', 'أساسي', 'الحماية من هجمات التزوير عبر المواقع', 'نهاية الجلسة'],
          ['company_context', 'أساسي', 'تحديد سياق الشركة النشط', 'سنة واحدة'],
          ['user_prefs', 'أساسي', 'تفضيلات العرض والإعدادات', 'سنة واحدة'],
          ['_analytics_id', 'تحليلي', 'تتبّع استخدام المنصة المجهول (بدون بيانات شخصية)', '6 أشهر'],
          ['cookie_consent', 'أساسي', 'تسجيل خيار الموافقة على ملفات تعريف الارتباط', 'سنة واحدة'],
        ]}
      />

      <SectionHeading id="what-we-dont">ما لا نفعله</SectionHeading>
      <ul className="mb-4 mr-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>لا توجد ملفات تعريف ارتباط للإعلانات أو إعادة الاستهداف أو تتبّع السلوك</li>
        <li>لا تُشارَك بيانات ملفات تعريف الارتباط مع منصات التسويق أو وسطاء البيانات</li>
        <li>لا توجد بكسلات تتبّع من وسائل التواصل الاجتماعي التابعة لجهات خارجية</li>
        <li>لا يوجد تتبّع عبر المواقع أو بصمة رقمية</li>
        <li>استعلامات قاعدة البيانات والتقارير ومحتوى الدردشة وبيانات الاعتماد لا تُخزَّن في ملفات تعريف الارتباط قط</li>
      </ul>

      <SectionHeading id="your-choices">خياراتك</SectionHeading>
      <P>
        عند أول وصول لزاكرا ستظهر لك لافتة الموافقة أعلاه. يتيح اختيار{' '}
        <strong className="text-foreground">قبول الكل</strong> ملفات تعريف الارتباط الأساسية والتحليلية معًا.
        يُعطّل اختيار <strong className="text-foreground">الأساسية فقط</strong> ملف تعريف الارتباط التحليلي فقط —
        وتبقى المنصة تعمل بكامل وظائفها.
      </P>
      <P>
        يُحفظ اختيارك في ملف تعريف الارتباط <span className="font-mono text-xs text-foreground">cookie_consent</span> لمدة سنة واحدة. يمكنك تغيير تفضيلاتك في أي وقت بمسح ملفات تعريف الارتباط في المتصفح وإعادة زيارة المنصة، مما سيُعيد عرض لافتة الموافقة.
      </P>
      <P>
        تتوفّر أيضًا ضوابط ملفات تعريف الارتباط على مستوى المتصفح. قد يؤثّر حجب جميع ملفات تعريف الارتباط على وظائف الجلسة الأساسية وسياق الشركة.
      </P>

      <SectionHeading id="contact">التواصل</SectionHeading>
      <P>
        يمكن توجيه أسئلتك حول ملفات تعريف الارتباط أو الموافقة إلى فريق خصوصية البيانات في Empowering Energy:
      </P>
      <div className="rounded-lg border border-border bg-surface-200 p-4">
        <p className="mb-1 font-sans text-sm font-medium text-foreground">Empowering Energy — فريق خصوصية البيانات</p>
        <p className="font-sans text-sm text-muted">
          📧{' '}
          <a href="mailto:privacy@esap.ai" className="text-accent hover:underline">
            privacy@esap.ai
          </a>
          {'  '}·{'  '}
          🌐{' '}
          <Link href={`/${locale}/cookies`} className="text-accent hover:underline">
            zakra.esap.ai/cookies
          </Link>
        </p>
      </div>

      {/* Also see */}
      <div className="mt-6 flex gap-4">
        <Link
          href={`/${locale}/privacy`}
          className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          ← سياسة الخصوصية
        </Link>
        <Link
          href={`/${locale}/terms`}
          className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          ← شروط الخدمة
        </Link>
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function CookiesPage({ params }: CookiesPageProps) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const toc = isAr ? tocAr : tocEn;

  return (
    <div className="flex gap-10">
      {/* Sticky TOC — desktop only */}
      <aside className="hidden shrink-0 xl:block">
        <LegalToc items={toc} />
      </aside>

      {isAr ? <ArabicContent locale={locale} /> : <EnglishContent locale={locale} />}
    </div>
  );
}
