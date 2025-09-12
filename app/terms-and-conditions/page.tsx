import React from "react";

const TermsPage = () => {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <h3 className="text-3xl font-bold mb-6">Terms and Conditions</h3>
      <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
        <p>
          Welcome to <strong>Alsaqr</strong>, a social networking platform based
          in Florida, United States. By accessing or using our application
          ("Service"), you agree to comply with these Terms and Conditions
          ("Terms"). If you do not agree, you must not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">2. Eligibility</h2>
        <p>
          You must be at least 13 years old to use Alsaqr. If you are under 18,
          you represent that you have the consent of a parent or legal guardian
          to use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">3. Accounts</h2>
        <p>
          To access certain features, you must create an account. You are
          responsible for maintaining the confidentiality of your account
          credentials and for all activities under your account. Alsaqr reserves
          the right to suspend or terminate accounts that violate these Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">4. User Content</h2>
        <p>
          You retain ownership of any content ("Content") you post on Alsaqr.
          However, by posting, you grant Alsaqr a worldwide, non-exclusive,
          royalty-free license to use, reproduce, distribute, and display such
          Content in connection with the Service. You are solely responsible for
          the Content you share and agree not to post unlawful, harmful, or
          infringing material.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">
          5. Prohibited Activities
        </h2>
        <p>
          You agree not to use Alsaqr to: (a) engage in harassment, hate speech,
          or abusive behavior; (b) impersonate others or misrepresent your
          identity; (c) spread spam, malware, or harmful code; (d) violate any
          applicable laws or regulations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
        <p>
          Alsaqr may suspend or terminate your account at any time without prior
          notice if you violate these Terms or engage in conduct harmful to the
          Service or other users.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">7. Disclaimer</h2>
        <p>
          The Service is provided "as is" and "as available" without warranties
          of any kind, express or implied. Alsaqr does not guarantee that the
          Service will be uninterrupted, secure, or error-free.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">8. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, Alsaqr shall not be liable for
          any indirect, incidental, special, or consequential damages arising
          from your use of the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">9. Governing Law</h2>
        <p>
          These Terms are governed by and construed under the laws of the State
          of Florida, United States, without regard to its conflict of law
          principles. Any disputes shall be resolved exclusively in the courts
          located in Florida.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">10. Changes to Terms</h2>
        <p>
          We may update these Terms from time to time. Updates will be effective
          when posted on this page. Continued use of Alsaqr after changes
          indicates acceptance of the revised Terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at:{" "}
          <a href="mailto:novigo.ali@gmail.com" className="text-blue-600">
            support@alsaqr.netlify.app
          </a>
        </p>
      </section>
    </div>
  );
};

export default TermsPage;
