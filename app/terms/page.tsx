import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Trouble on Mondays',
  description: 'Terms of Service for Trouble on Mondays - the community forum for monday.com power users.',
};

export default function TermsPage() {
  return (
    <div className="max-w-[760px] mx-auto py-12 md:py-16">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors mb-6"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Discussions
        </Link>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
          Terms of Service
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Last updated: February 26, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Agreement to Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            By accessing or using Trouble on Mondays (&quot;the Site&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of these terms, you may not access the Site.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            These Terms apply to all visitors, users, and others who access or use the Site.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Disclaimer: Not Affiliated with monday.com
          </h2>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
              <strong>Trouble on Mondays is an independent community forum and is not affiliated with, endorsed by, or officially connected to monday.com Ltd. or any of its subsidiaries or affiliates.</strong> The official monday.com website is located at{' '}
              <a
                href="https://monday.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                monday.com
              </a>
              . Any references to &quot;monday.com&quot; are for descriptive purposes only.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            User Accounts
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            When you create an account, you must provide accurate and complete information. You are responsible for safeguarding your account credentials and for any activities under your account.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            You agree to notify us immediately of any unauthorized access to your account.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            User Content
          </h2>
          <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
            Ownership
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            You retain ownership of any content you post to the Site (&quot;User Content&quot;). By posting User Content, you grant us a non-exclusive, worldwide, royalty-free license to use, display, reproduce, and distribute your content in connection with operating the Site.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
            Responsibility
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            You are solely responsible for your User Content. You represent that you have all necessary rights to post the content and that it does not violate any third-party rights or applicable laws.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Community Guidelines
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            To maintain a helpful and respectful community, you agree not to:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
            <li>
              <strong>Spam:</strong> Post repetitive, promotional, or irrelevant content
            </li>
            <li>
              <strong>Harass or abuse:</strong> Engage in personal attacks, harassment, or discriminatory behavior toward other users
            </li>
            <li>
              <strong>Post illegal content:</strong> Share content that violates any applicable laws or regulations
            </li>
            <li>
              <strong>Impersonate:</strong> Falsely represent yourself as another person or entity
            </li>
            <li>
              <strong>Manipulate:</strong> Use bots, scripts, or automated means to interact with the Site
            </li>
            <li>
              <strong>Share malware:</strong> Post links or content containing viruses or malicious code
            </li>
            <li>
              <strong>Violate privacy:</strong> Share personal information of others without their consent
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Moderation Rights
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            We reserve the right, but not the obligation, to:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
            <li>Remove or modify any User Content for any reason without notice</li>
            <li>Suspend or terminate accounts that violate these Terms</li>
            <li>Ban users who repeatedly violate community guidelines</li>
            <li>Edit or remove content that we deem inappropriate, harmful, or in violation of these Terms</li>
          </ul>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
            We are not obligated to monitor User Content but may do so at our discretion.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Acceptable Use
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
            <li>Use the Site in any way that violates applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to any portion of the Site or its systems</li>
            <li>Interfere with or disrupt the integrity or performance of the Site</li>
            <li>Use the Site to transmit unsolicited commercial messages</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Intellectual Property
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            The Site and its original content (excluding User Content), features, and functionality are owned by Trouble on Mondays and are protected by copyright, trademark, and other intellectual property laws. Our trademarks may not be used without prior written permission.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Disclaimer of Warranties
          </h2>
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] rounded-xl p-6">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              <strong>THE SITE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED.</strong>
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              We do not warrant that:
            </p>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>The Site will be uninterrupted, secure, or error-free</li>
              <li>The results obtained from the Site will be accurate or reliable</li>
              <li>Any advice or information obtained through the Site is accurate</li>
            </ul>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
              User Content represents the views of individual users and does not reflect the views of Trouble on Mondays. We are not responsible for the accuracy of information shared in community discussions.
            </p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Limitation of Liability
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            To the maximum extent permitted by law, Trouble on Mondays shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, arising from your use of the Site or any content obtained from the Site.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Changes to Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the &quot;Last updated&quot; date. Your continued use of the Site after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Termination
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We may terminate or suspend your account and access to the Site immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Site will cease immediately.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Governing Law
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Contact Us
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-3">
            <a
              href="mailto:privacy@troubleonmonday.com"
              className="text-red-500 hover:text-red-600 font-medium transition-colors"
            >
              privacy@troubleonmonday.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
