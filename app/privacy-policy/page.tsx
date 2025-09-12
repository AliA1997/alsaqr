import React from "react";

const PrivacyPage = () => {
    return (
        <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
            <h3 className="text-3xl font-bold mb-6 pt-4">Privacy Policy</h3>
            <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8 overflow-auto">
                <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
                <p>
                    At <strong>Alsaqr</strong>, your privacy is important to us. This
                    Privacy Policy explains how we collect, use, and safeguard your
                    information when you use our social networking platform (the
                    "Service"). By using Alsaqr, you agree to the practices described in
                    this Policy.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
                <p>We may collect the following types of information:</p>
                <ul className="list-disc list-inside mt-2">
                    <li>Account details such as your name, email, username, and password.</li>
                    <li>Profile information you choose to share (bio, photos, links).</li>
                    <li>Content you post, including messages, comments, and media.</li>
                    <li>
                        Technical information such as IP address, browser type, and device
                        identifiers.
                    </li>
                    <li>Usage data including interactions with posts and other users.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">3. How We Use Your Information</h2>
                <p>Your information may be used to:</p>
                <ul className="list-disc list-inside mt-2">
                    <li>Provide, operate, and improve the Service.</li>
                    <li>Personalize your user experience.</li>
                    <li>Communicate with you, including updates and notifications.</li>
                    <li>Protect against fraud, abuse, or illegal activity.</li>
                    <li>
                        Comply with legal obligations and enforce our Terms and Conditions.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">4. Cookies and Tracking</h2>
                <p>
                    Alsaqr may use cookies, web beacons, and similar technologies to
                    improve your experience, analyze usage, and deliver personalized
                    content. You can manage cookie preferences in your browser settings,
                    but some features of the Service may not function properly if cookies
                    are disabled.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">5. Sharing of Information</h2>
                <p>
                    We do not sell your personal information. However, we may share
                    information with:
                </p>
                <ul className="list-disc list-inside mt-2">
                    <li>Service providers that assist in operating Alsaqr.</li>
                    <li>
                        Legal authorities when required by law or to protect our rights.
                    </li>
                    <li>
                        Other users of the Service, in line with your privacy and account
                        settings.
                    </li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">6. Data Security</h2>
                <p>
                    We use reasonable security measures to protect your information.
                    However, no method of transmission over the Internet is 100% secure,
                    and we cannot guarantee absolute security.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">7. Your Rights</h2>
                <p>
                    Depending on your location, you may have rights to access, update, or
                    delete your personal information. To exercise these rights, please
                    contact us at{" "}
                    <a href="mailto:novigo.ali@gmail.com" className="text-blue-600">
                        privacy@alsaqr.netlify.app
                    </a>
                    .
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">8. Children's Privacy</h2>
                <p>
                    Alsaqr is not intended for children under 13. We do not knowingly
                    collect personal information from children under 13. If we learn that
                    such information has been collected, we will take steps to delete it.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-xl font-semibold mb-2">9. Changes to this Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Updates will be
                    effective when posted on this page. Continued use of the Service after
                    changes indicates acceptance of the revised Policy.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-2">10. Contact Us</h2>
                <p>
                    If you have questions about this Privacy Policy, please contact us at:{" "}
                    <a href="mailto:novigo.ali@gmail.com" className="text-blue-600">
                        privacy@alsaqr.netlify.app
                    </a>
                </p>
            </section>
        </div>
    );
};

export default PrivacyPage;
