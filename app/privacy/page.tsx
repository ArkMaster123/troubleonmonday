import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Trouble on Mondays',
  description: 'Privacy Policy for Trouble on Mondays - the community forum for monday.com power users.',
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Last updated: February 26, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Introduction
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Trouble on Mondays (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the troubleonmondays.com website. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and participate in our community forum.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Please read this privacy policy carefully. By using the site, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Information We Collect
          </h2>
          
          <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
            Information You Provide
          </h3>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2 mb-6">
            <li>
              <strong>Email Address:</strong> When you create an account or subscribe to updates, we collect your email address.
            </li>
            <li>
              <strong>Forum Posts:</strong> Content you post to discussions, including questions, answers, and comments. These are pseudonymous and associated with a display name you choose.
            </li>
            <li>
              <strong>Display Name:</strong> The username or pseudonym you choose to identify yourself in the community.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
            Automatically Collected Information
          </h3>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
            <li>
              <strong>Cookies:</strong> We use essential cookies to maintain your session and preferences (such as dark/light mode).
            </li>
            <li>
              <strong>Usage Data:</strong> Basic analytics such as page views and interaction patterns to improve the site experience.
            </li>
            <li>
              <strong>Device Information:</strong> Browser type, operating system, and general location (country-level) for service optimization.
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            How We Store Your Data
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Your data is stored securely using SQLite databases. We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Forum posts are stored indefinitely to maintain the integrity and usefulness of community discussions. Account information is retained while your account is active.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
            <li>To provide and maintain our community forum service</li>
            <li>To notify you about changes to our service or important updates</li>
            <li>To allow you to participate in discussions</li>
            <li>To monitor and analyze usage patterns to improve user experience</li>
            <li>To detect, prevent, and address spam or abuse</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            What We Do NOT Do
          </h2>
          <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/[0.06] rounded-xl p-6">
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
              <li>
                <strong>We do not sell your data.</strong> Your personal information is never sold to third parties.
              </li>
              <li>
                <strong>We do not share your email.</strong> Your email address is never shared with other users or third parties for marketing purposes.
              </li>
              <li>
                <strong>We do not track across sites.</strong> We do not use cross-site tracking technologies.
              </li>
            </ul>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Your Rights
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
            Depending on your location, you may have the following rights regarding your personal data:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-2">
            <li>
              <strong>Access:</strong> Request a copy of the personal data we hold about you.
            </li>
            <li>
              <strong>Correction:</strong> Request correction of any inaccurate personal data.
            </li>
            <li>
              <strong>Deletion:</strong> Request deletion of your account and associated personal data.
            </li>
            <li>
              <strong>Portability:</strong> Request a machine-readable copy of your data.
            </li>
          </ul>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed mt-4">
            Note: Forum posts you have made may remain visible for the benefit of the community, but can be anonymized upon request.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Data Retention
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We retain your personal information for as long as your account is active or as needed to provide you services. If you request account deletion, we will delete your personal data within 30 days, except where we are required to retain it for legal or legitimate business purposes.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Third-Party Services
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We may use third-party services for analytics, hosting, and email delivery. These services have their own privacy policies and may collect information as specified in their respective policies. We only work with providers that maintain appropriate data protection standards.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Changes to This Policy
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold tracking-tight mb-4 text-slate-900 dark:text-slate-50">
            Contact Us
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at:
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
