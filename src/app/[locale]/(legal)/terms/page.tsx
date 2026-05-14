import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalToc } from '@/components/legal/legal-toc';
import type { TocItem } from '@/components/legal/legal-toc';

interface TermsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale === 'ar') {
    return {
      title: 'شروط الخدمة | زاكرا',
      description:
        'الشروط التي تحكم الوصول إلى زاكرا، منصة قاعدة المعرفة المؤسسية المدعومة بالذكاء الاصطناعي من Empowering Energy (ESAP AI).',
    };
  }
  return {
    title: 'Terms of Service | Zakra',
    description:
      'Terms governing access to Zakra, the AI-powered enterprise knowledge base platform by Empowering Energy (ESAP AI).',
  };
}

// ─── Shared layout primitives ──────────────────────────────────────────────

function SectionHeading({
  id,
  num,
  children,
}: {
  id: string;
  num: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="mb-4 mt-10 flex items-baseline gap-3 font-sans text-xl font-semibold tracking-tight text-foreground first:mt-0"
    >
      <span className="font-mono text-sm font-normal text-accent">{num}</span>
      {children}
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 font-sans text-sm leading-relaxed text-muted">{children}</p>;
}

function Highlight({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 rounded-lg border border-warning-border bg-warning-bg px-4 py-3 font-sans text-sm text-warning">
      {children}
    </div>
  );
}

function ProhibitedList({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function ProhibitedListRtl({ items }: { items: string[] }) {
  return (
    <ul className="mb-4 mr-5 list-disc space-y-2 font-sans text-sm text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

// ─── English TOC ───────────────────────────────────────────────────────────

const tocEn: TocItem[] = [
  { id: 'agreement', label: 'Agreement', sub: '1' },
  { id: 'service', label: 'Description of Service', sub: '2' },
  { id: 'access', label: 'Access and Authorised Users', sub: '3' },
  { id: 'database', label: 'Database Connection Responsibility', sub: '4' },
  { id: 'acceptable-use', label: 'Acceptable Use', sub: '5' },
  { id: 'ai-disclaimer', label: 'AI-Generated Content Disclaimer', sub: '6' },
  { id: 'client-data', label: 'Client Data and Content', sub: '7' },
  { id: 'data-processing', label: 'Data Processing and Privacy', sub: '8' },
  { id: 'pricing', label: 'Pricing and Commercial Terms', sub: '9' },
  { id: 'ip', label: 'Intellectual Property', sub: '10' },
  { id: 'confidentiality', label: 'Confidentiality', sub: '11' },
  { id: 'availability', label: 'Service Availability', sub: '12' },
  { id: 'liability', label: 'Limitation of Liability', sub: '13' },
  { id: 'termination', label: 'Termination', sub: '14' },
  { id: 'governing-law', label: 'Governing Law', sub: '15' },
  { id: 'changes', label: 'Changes to Terms', sub: '16' },
];

// ─── Arabic TOC ────────────────────────────────────────────────────────────

const tocAr: TocItem[] = [
  { id: 'agreement', label: 'الاتفاقية', sub: '1' },
  { id: 'service', label: 'وصف الخدمة', sub: '2' },
  { id: 'access', label: 'الوصول والمستخدمون المصرّح لهم', sub: '3' },
  { id: 'database', label: 'مسؤولية الاتصال بقاعدة البيانات', sub: '4' },
  { id: 'acceptable-use', label: 'الاستخدام المقبول', sub: '5' },
  { id: 'ai-disclaimer', label: 'إخلاء مسؤولية المحتوى المولّد بالذكاء الاصطناعي', sub: '6' },
  { id: 'client-data', label: 'بيانات العميل والمحتوى', sub: '7' },
  { id: 'data-processing', label: 'معالجة البيانات والخصوصية', sub: '8' },
  { id: 'pricing', label: 'الأسعار والشروط التجارية', sub: '9' },
  { id: 'ip', label: 'الملكية الفكرية', sub: '10' },
  { id: 'confidentiality', label: 'السرية', sub: '11' },
  { id: 'availability', label: 'توافر الخدمة', sub: '12' },
  { id: 'liability', label: 'تحديد المسؤولية', sub: '13' },
  { id: 'termination', label: 'الإنهاء', sub: '14' },
  { id: 'governing-law', label: 'القانون الحاكم', sub: '15' },
  { id: 'changes', label: 'التغييرات على الشروط', sub: '16' },
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
          Terms of Service
        </h1>
        <p className="font-sans text-sm text-muted">
          <strong className="text-foreground">Product:</strong> Zakra AI-Powered Enterprise Knowledge Base &amp; Reporting Platform
          <br />
          <strong className="text-foreground">Operated by:</strong> Empowering Energy (trading as ESAP AI) (CR No. [Insert CR Number])
          <br />
          <strong className="text-foreground">Platform:</strong>{' '}
          <span className="font-mono text-xs">zakra.esap.ai</span>
        </p>
      </div>

      <SectionHeading id="agreement" num="1">Agreement</SectionHeading>
      <P>
        These Terms govern access to Zakra at <span className="font-mono text-xs">zakra.esap.ai</span>, operated by{' '}
        <strong className="text-foreground">Empowering Energy (trading as ESAP AI)</strong> (CR No. [Insert CR Number]).
        They apply to the Client organisation and all Authorised Users. These Terms operate alongside any Master
        Services Agreement (MSA), Statement of Work (SOW), and Data Processing Agreement (DPA) the MSA/DPA takes
        precedence in the event of conflicts.
      </P>

      <SectionHeading id="service" num="2">Description of Service</SectionHeading>
      <P>Zakra provides:</P>
      <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>Overview dashboard with real-time stats (Users, Connections, Reports, Chat Sessions, Activity)</li>
        <li>AI-powered chat interface for natural language database querying</li>
        <li>AI report generation with auto-template selection and structured output</li>
        <li>Report history with status tracking (running, completed, failed)</li>
        <li>Configurable report templates (HR, Financial, Custom) with section structures</li>
        <li>Secure database connection management with connection testing</li>
        <li>Column-level Table Access controls (None, Read, Masked, Write) per table</li>
        <li>Multi-company hierarchy management (Parent/Subsidiary) with Company Context switching</li>
        <li>User management with role assignment (Super Admin, Admin, Regular) and status tracking</li>
        <li>Usage analytics and activity monitoring</li>
      </ul>

      <SectionHeading id="access" num="3">Access and Authorised Users</SectionHeading>
      <P>
        Access is granted exclusively to the Client and designated Authorised Users per a signed MSA. Three roles are
        available: <strong className="text-foreground">Super Admin</strong> (full platform control),{' '}
        <strong className="text-foreground">Admin</strong> (company/user management and all features), and{' '}
        <strong className="text-foreground">Regular</strong> (chat and reports within assigned Company Context).
        The Client is responsible for credential security, Table Access configuration, and ensuring all users comply
        with these Terms.
      </P>

      <SectionHeading id="database" num="4">Database Connection Responsibility</SectionHeading>
      <Highlight>
        ⚠️ The Client bears full responsibility for all data connected to Zakra via database credentials.
      </Highlight>
      <P>Client responsibilities include:</P>
      <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>Providing database credentials with minimum necessary access (read-only strongly recommended)</li>
        <li>Configuring Table Access controls to prevent over-exposure of sensitive columns (salary, medical, personal data)</li>
        <li>Ensuring all data in Connected Databases is lawfully held under PDPL</li>
        <li>Rotating credentials periodically and immediately upon suspected compromise</li>
        <li>Ensuring Connected Databases do not contain data that violates Saudi law</li>
      </ul>
      <P>
        Empowering Energy (trading as ESAP AI) is not liable for the Client&apos;s misconfiguration of Table Access
        or connection of databases containing unlawfully held data.
      </P>

      <SectionHeading id="acceptable-use" num="5">Acceptable Use</SectionHeading>
      <P>The following are prohibited:</P>
      <ProhibitedList
        items={[
          'Connecting databases containing data that the Client does not lawfully hold',
          'Granting write access to columns without proper authorisation and change management',
          'Using AI-generated reports as the sole basis for employment, financial, or legal decisions without human review',
          'Reverse engineering the AI query translation engine or report generation system',
          'Using outputs for competing products',
          'Sharing, reselling, or sublicensing access or database credentials',
        ]}
      />

      <SectionHeading id="ai-disclaimer" num="6">AI-Generated Content Disclaimer</SectionHeading>
      <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>AI-generated queries may not always produce the intended results verify against source data</li>
        <li>Reports are AI-generated summaries, <strong className="text-foreground">not audited financial or HR documents</strong></li>
        <li>AI answers depend on the accuracy and completeness of data in Connected Databases</li>
        <li>All outputs are labelled: <em className="text-foreground">&quot;AI-generated verify against source data before formal use.&quot;</em></li>
        <li>Empowering Energy (trading as ESAP AI) is not liable for decisions made based on AI reports without human verification</li>
      </ul>

      <SectionHeading id="client-data" num="7">Client Data and Content</SectionHeading>
      <P>
        The Client retains full ownership of all data in Connected Databases, generated reports, chat content, and
        configurations. Empowering Energy (trading as ESAP AI) commits to:
      </P>
      <ul className="mb-4 ml-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>Never selling, licensing, or sharing Client Data with third parties</li>
        <li>Never using Client Data to train AI models without explicit written consent</li>
        <li>Accessing data only for contracted service delivery, security, or legal compliance</li>
        <li>Never retaining copies of raw database data beyond transient query processing</li>
      </ul>

      <SectionHeading id="data-processing" num="8">Data Processing and Privacy</SectionHeading>
      <P>
        Data processing is governed by the{' '}
        <Link href={`/${locale}/privacy`} className="text-accent hover:underline">
          Privacy Policy
        </Link>{' '}
        and the signed Data Processing Agreement (DPA). Zakra complies with PDPL Royal Decree M/19 of 2021 and its
        Implementing Regulations.
      </P>

      <SectionHeading id="pricing" num="9">Pricing and Commercial Terms</SectionHeading>
      <P>
        Pricing, payment terms, and billing are defined exclusively in a signed MSA or SOW. These Terms do not govern
        billing independently.
      </P>

      <SectionHeading id="ip" num="10">Intellectual Property</SectionHeading>
      <P>
        All intellectual property in the Zakra platform is exclusively owned by Empowering Energy (trading as ESAP AI),
        including but not limited to: platform software, AI query translation engine, report generation system, template
        engine, Table Access framework, Company Context architecture, branding, and documentation. No licence beyond
        contracted access is granted.
      </P>

      <SectionHeading id="confidentiality" num="11">Confidentiality</SectionHeading>
      <P>
        Both parties agree to maintain confidentiality of non-public information for 3 years post-termination.
        Database credentials are treated at the highest confidentiality classification and must be destroyed
        immediately upon termination or credential rotation.
      </P>

      <SectionHeading id="availability" num="12">Service Availability</SectionHeading>
      <P>
        Zakra targets 99.5% platform availability. Database availability and query latency depend on Client
        infrastructure and is outside Empowering Energy&apos;s control. Planned maintenance will be communicated
        with advance notice.
      </P>

      <SectionHeading id="liability" num="13">Limitation of Liability</SectionHeading>
      <P>
        Total liability is capped at fees paid in the 3 months preceding the claim. Empowering Energy (trading as
        ESAP AI) is not liable for indirect, consequential, or incidental damages, including data loss resulting from
        Client misconfiguration of Table Access or database credentials.
      </P>

      <SectionHeading id="termination" num="14">Termination</SectionHeading>
      <P>
        On termination, a 30-day export window is provided for all generated reports, chat histories, and
        configurations. Database credentials are immediately destroyed. Platform access is revoked at termination.
        Permanent deletion of all Client Data is confirmed in writing within 30 days.
      </P>

      <SectionHeading id="governing-law" num="15">Governing Law</SectionHeading>
      <P>
        These Terms are governed by the laws of the Kingdom of Saudi Arabia. Disputes shall be subject to the
        exclusive jurisdiction of the courts of Riyadh.
      </P>

      <SectionHeading id="changes" num="16">Changes to Terms</SectionHeading>
      <P>
        Material changes to these Terms will be communicated with 14 days&apos; advance notice via the platform or
        registered email. Continued use after the notice period constitutes acceptance.
      </P>

      {/* Contact */}
      <div className="mt-8 rounded-lg border border-border bg-surface-200 p-4">
        <p className="mb-1 font-sans text-sm font-medium text-foreground">Empowering Energy Legal Team</p>
        <p className="font-sans text-sm text-muted">
          📧{' '}
          <a href="mailto:legal@esap.ai" className="text-accent hover:underline">
            legal@esap.ai
          </a>
          {'  '}·{'  '}
          🌐{' '}
          <Link href={`/${locale}/terms`} className="text-accent hover:underline">
            zakra.esap.ai/terms
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
          href={`/${locale}/cookies`}
          className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          Cookie Policy →
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
          شروط الخدمة
        </h1>
        <p className="font-sans text-sm text-muted">
          <strong className="text-foreground">المنتج:</strong> زاكرا منصة قاعدة المعرفة والتقارير المؤسسية المدعومة بالذكاء الاصطناعي
          <br />
          <strong className="text-foreground">تشغيل:</strong> Empowering Energy (المعروفة باسم ESAP AI) (رقم السجل التجاري: [يُدرج رقم السجل])
          <br />
          <strong className="text-foreground">المنصة:</strong>{' '}
          <span className="font-mono text-xs">zakra.esap.ai</span>
        </p>
      </div>

      <SectionHeading id="agreement" num="1">الاتفاقية</SectionHeading>
      <P>
        تحكم هذه الشروط الوصول إلى زاكرا على <span className="font-mono text-xs">zakra.esap.ai</span>، التي تشغّلها{' '}
        <strong className="text-foreground">Empowering Energy (المعروفة باسم ESAP AI)</strong> (رقم السجل التجاري: [يُدرج رقم السجل]).
        تنطبق الشروط على مؤسسة العميل وجميع المستخدمين المصرّح لهم. تعمل هذه الشروط جنبًا إلى جنب مع أي اتفاقية خدمات رئيسية (MSA) وبيان عمل (SOW) واتفاقية معالجة بيانات (DPA) وتُقدَّم MSA/DPA على هذه الشروط عند التعارض.
      </P>

      <SectionHeading id="service" num="2">وصف الخدمة</SectionHeading>
      <P>تُوفّر زاكرا:</P>
      <ul className="mb-4 mr-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>لوحة تحكم نظرة عامة مع إحصاءات لحظية (المستخدمون، الاتصالات، التقارير، جلسات الدردشة، النشاط)</li>
        <li>واجهة دردشة مدعومة بالذكاء الاصطناعي للاستعلام عن قواعد البيانات بلغة طبيعية</li>
        <li>توليد تقارير ذكاء اصطناعي مع اختيار تلقائي للقوالب ومخرجات منظّمة</li>
        <li>سجل التقارير مع تتبع الحالة (قيد التشغيل، مكتمل، فاشل)</li>
        <li>قوالب تقارير قابلة للإعداد (موارد بشرية، مالية، مخصّصة) مع هياكل الأقسام</li>
        <li>إدارة آمنة لاتصالات قاعدة البيانات مع اختبار الاتصال</li>
        <li>ضوابط وصول الجداول على مستوى الأعمدة (بلا وصول، قراءة، مُقنَّع، كتابة) لكل جدول</li>
        <li>إدارة التسلسل الهرمي متعدد الشركات (شركة أم/تابعة) مع تبديل سياق الشركة</li>
        <li>إدارة المستخدمين مع تعيين الأدوار (مدير عام، مدير، مستخدم عادي) وتتبع الحالة</li>
        <li>تحليلات الاستخدام ومراقبة النشاط</li>
      </ul>

      <SectionHeading id="access" num="3">الوصول والمستخدمون المصرّح لهم</SectionHeading>
      <P>
        يُمنح الوصول حصرًا للعميل والمستخدمين المصرّح لهم المحدّدين بموجب MSA موقّعة. تتوفّر ثلاثة أدوار:{' '}
        <strong className="text-foreground">مدير عام</strong> (تحكم كامل في المنصة)،{' '}
        <strong className="text-foreground">مدير</strong> (إدارة الشركة/المستخدمين وجميع الميزات)، و{' '}
        <strong className="text-foreground">مستخدم عادي</strong> (دردشة وتقارير ضمن سياق الشركة المعيّن).
        العميل مسؤول عن أمن بيانات الاعتماد وضبط ضوابط وصول الجداول وضمان التزام جميع المستخدمين بهذه الشروط.
      </P>

      <SectionHeading id="database" num="4">مسؤولية الاتصال بقاعدة البيانات</SectionHeading>
      <Highlight>
        ⚠️ يتحمّل العميل المسؤولية الكاملة عن جميع البيانات المربوطة بزاكرا عبر بيانات اعتماد قاعدة البيانات.
      </Highlight>
      <P>مسؤوليات العميل تشمل:</P>
      <ProhibitedListRtl
        items={[
          'توفير بيانات اعتماد قاعدة البيانات بأدنى صلاحيات ضرورية (يُوصى بشدة بالقراءة فقط)',
          'ضبط ضوابط وصول الجداول لمنع الكشف المفرط عن الأعمدة الحساسة (الرواتب، الطبية، البيانات الشخصية)',
          'ضمان أن جميع البيانات في قواعد البيانات المربوطة محتفظ بها بشكل قانوني وفق نظام PDPL',
          'تدوير بيانات الاعتماد دوريًا وفورًا عند الاشتباه بأي اختراق',
          'ضمان أن قواعد البيانات المربوطة لا تحتوي على بيانات تنتهك النظام السعودي',
        ]}
      />
      <P>
        لا تتحمّل Empowering Energy (باسم ESAP AI) المسؤولية عن سوء ضبط العميل لضوابط وصول الجداول أو ربط قواعد بيانات تحتوي على بيانات محتفظ بها بصورة غير قانونية.
      </P>

      <SectionHeading id="acceptable-use" num="5">الاستخدام المقبول</SectionHeading>
      <P>يُحظر ما يلي:</P>
      <ProhibitedListRtl
        items={[
          'ربط قواعد بيانات تحتوي على بيانات لا يحق للعميل الاحتفاظ بها قانونًا',
          'منح صلاحية الكتابة على الأعمدة دون تفويض سليم وإدارة التغييرات',
          'استخدام التقارير المولّدة بالذكاء الاصطناعي كأساس وحيد لقرارات التوظيف أو المالية أو القانونية دون مراجعة بشرية',
          'الهندسة العكسية لمحرك ترجمة استعلامات الذكاء الاصطناعي أو نظام توليد التقارير',
          'استخدام المخرجات في المنتجات المنافسة',
          'مشاركة أو إعادة بيع أو ترخيص الوصول أو بيانات اعتماد قاعدة البيانات من الباطن',
        ]}
      />

      <SectionHeading id="ai-disclaimer" num="6">إخلاء مسؤولية المحتوى المولّد بالذكاء الاصطناعي</SectionHeading>
      <ul className="mb-4 mr-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>قد لا تُنتج الاستعلامات المولّدة بالذكاء الاصطناعي دائمًا النتائج المقصودة تحقّق من بيانات المصدر</li>
        <li>التقارير ملخّصات مولّدة بالذكاء الاصطناعي، <strong className="text-foreground">وليست وثائق مالية أو موارد بشرية مُراجَعة</strong></li>
        <li>تعتمد إجابات الذكاء الاصطناعي على دقة واكتمال البيانات في قواعد البيانات المربوطة</li>
        <li>جميع المخرجات تحمل تسمية: <em className="text-foreground">"مولَّد بالذكاء الاصطناعي تحقّق من بيانات المصدر قبل الاستخدام الرسمي."</em></li>
        <li>لا تتحمّل Empowering Energy (باسم ESAP AI) المسؤولية عن قرارات اتُّخذت بناءً على تقارير ذكاء اصطناعي دون تحقّق بشري</li>
      </ul>

      <SectionHeading id="client-data" num="7">بيانات العميل والمحتوى</SectionHeading>
      <P>
        يحتفظ العميل بالملكية الكاملة لجميع البيانات في قواعد البيانات المربوطة والتقارير المولّدة ومحتوى الدردشة والإعدادات. تلتزم Empowering Energy (باسم ESAP AI) بما يلي:
      </P>
      <ul className="mb-4 mr-5 list-disc space-y-2 font-sans text-sm text-muted">
        <li>عدم بيع بيانات العميل أو ترخيصها أو مشاركتها مع أطراف ثالثة</li>
        <li>عدم استخدام بيانات العميل لتدريب نماذج الذكاء الاصطناعي دون موافقة كتابية صريحة</li>
        <li>الوصول إلى البيانات فقط لأغراض تقديم الخدمة التعاقدية أو الأمن أو الامتثال القانوني</li>
        <li>عدم الاحتفاظ بنسخ من بيانات قاعدة البيانات الخام بعد معالجة الاستعلامات العابرة</li>
      </ul>

      <SectionHeading id="data-processing" num="8">معالجة البيانات والخصوصية</SectionHeading>
      <P>
        تحكم معالجة البيانات{' '}
        <Link href={`/${locale}/privacy`} className="text-accent hover:underline">
          سياسة الخصوصية
        </Link>{' '}
        واتفاقية معالجة البيانات (DPA) الموقّعة. تمتثل زاكرا لنظام حماية البيانات الشخصية المرسوم الملكي م/19 لعام 2021 ولوائحه التنفيذية.
      </P>

      <SectionHeading id="pricing" num="9">الأسعار والشروط التجارية</SectionHeading>
      <P>
        تُحدَّد الأسعار وشروط الدفع والفواتير حصرًا في MSA أو SOW موقّعة. لا تحكم هذه الشروط الفواتير بصورة مستقلة.
      </P>

      <SectionHeading id="ip" num="10">الملكية الفكرية</SectionHeading>
      <P>
        جميع حقوق الملكية الفكرية في منصة زاكرا مملوكة حصرًا لـ Empowering Energy (باسم ESAP AI)، بما في ذلك على سبيل المثال لا الحصر: برمجيات المنصة ومحرك ترجمة استعلامات الذكاء الاصطناعي ونظام توليد التقارير ومحرك القوالب وإطار ضوابط وصول الجداول وبنية سياق الشركة والعلامات التجارية والوثائق. لا يُمنح أي ترخيص يتجاوز الوصول التعاقدي.
      </P>

      <SectionHeading id="confidentiality" num="11">السرية</SectionHeading>
      <P>
        يتفق الطرفان على الحفاظ على سرية المعلومات غير العامة لمدة 3 سنوات بعد الإنهاء. تُعامَل بيانات اعتماد قاعدة البيانات بأعلى تصنيف سرية ويجب إتلافها فورًا عند الإنهاء أو تدوير بيانات الاعتماد.
      </P>

      <SectionHeading id="availability" num="12">توافر الخدمة</SectionHeading>
      <P>
        تستهدف زاكرا توافر المنصة بنسبة 99.5%. يعتمد توافر قاعدة البيانات وكمون الاستعلامات على البنية التحتية للعميل وهو خارج سيطرة Empowering Energy. سيُبلَّغ مسبقًا عن أعمال الصيانة المخططة.
      </P>

      <SectionHeading id="liability" num="13">تحديد المسؤولية</SectionHeading>
      <P>
        تُحدَّد المسؤولية الإجمالية بالرسوم المدفوعة في الأشهر الثلاثة السابقة للمطالبة. لا تتحمّل Empowering Energy (باسم ESAP AI) المسؤولية عن الأضرار غير المباشرة أو التبعية أو العرضية، بما في ذلك فقدان البيانات الناتج عن سوء ضبط العميل لضوابط وصول الجداول أو بيانات اعتماد قاعدة البيانات.
      </P>

      <SectionHeading id="termination" num="14">الإنهاء</SectionHeading>
      <P>
        عند الإنهاء، تُتاح نافذة تصدير مدتها 30 يومًا لجميع التقارير المولّدة وسجلات الدردشة والإعدادات. تُتلَف بيانات اعتماد قاعدة البيانات فورًا. يُلغى وصول المنصة عند الإنهاء. يُؤكَّد الحذف الدائم لجميع بيانات العميل كتابيًا خلال 30 يومًا.
      </P>

      <SectionHeading id="governing-law" num="15">القانون الحاكم</SectionHeading>
      <P>
        تخضع هذه الشروط لأنظمة المملكة العربية السعودية. تختص بالفصل في النزاعات المحاكم المختصة في مدينة الرياض.
      </P>

      <SectionHeading id="changes" num="16">التغييرات على الشروط</SectionHeading>
      <P>
        يُبلَّغ مسبقًا عن التغييرات الجوهرية على هذه الشروط بإشعار 14 يومًا عبر المنصة أو البريد الإلكتروني المسجّل. يُشكّل الاستمرار في الاستخدام بعد انتهاء فترة الإشعار قبولًا بالتغييرات.
      </P>

      {/* Contact */}
      <div className="mt-8 rounded-lg border border-border bg-surface-200 p-4">
        <p className="mb-1 font-sans text-sm font-medium text-foreground">Empowering Energy الفريق القانوني</p>
        <p className="font-sans text-sm text-muted">
          📧{' '}
          <a href="mailto:legal@esap.ai" className="text-accent hover:underline">
            legal@esap.ai
          </a>
          {'  '}·{'  '}
          🌐{' '}
          <Link href={`/${locale}/terms`} className="text-accent hover:underline">
            zakra.esap.ai/terms
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
          href={`/${locale}/cookies`}
          className="rounded-lg border border-border px-4 py-2 font-sans text-sm text-muted transition-colors hover:border-border-strong hover:text-foreground"
        >
          ← سياسة ملفات تعريف الارتباط
        </Link>
      </div>
    </article>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params;
  const isAr = locale === 'ar';
  const toc = isAr ? tocAr : tocEn;

  return (
    <div className="flex gap-10">
      {/* Sticky TOC desktop only */}
      <aside className="hidden shrink-0 xl:block">
        <LegalToc items={toc} />
      </aside>

      {isAr ? <ArabicContent locale={locale} /> : <EnglishContent locale={locale} />}
    </div>
  );
}
