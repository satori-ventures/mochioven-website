import { siteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects and uses your information.`,
};

const LAST_UPDATED = "October 13, 2026";

const email = siteConfig.contact.email;

function EmailLink() {
  return (
    <a
      href={`mailto:${email}`}
      className="font-semibold text-coral-700 transition-colors hover:text-coral-600"
    >
      {email}
    </a>
  );
}

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "What we collect when you order",
    body: (
      <>
        When you place an order, we ask for your name, mobile phone number,
        email address, delivery address (for delivery orders), and any notes
        you add. We use this information to make, confirm, and deliver your
        order.
      </>
    ),
  },
  {
    title: "Payments",
    body: (
      <>
        Payments are processed by Square on Square&apos;s own secure page. We
        never see or store your card number. We send your order and contact
        details to Square to create your order.
      </>
    ),
  },
  {
    title: "Order text messages",
    body: (
      <>
        We use your mobile phone number only for messages about your order. We
        do not use it for marketing.
      </>
    ),
  },
  {
    title: "Email marketing",
    body: (
      <>
        We send marketing emails only if you check the box at checkout. If you
        do, your email address and first name are stored in MailerLite, our
        email service. Every marketing email has an unsubscribe link.
      </>
    ),
  },
  {
    title: "Analytics and cookies",
    body: (
      <>
        We use Google Analytics to measure visits to this site. Google
        Analytics uses cookies.
      </>
    ),
  },
  {
    title: "Catering inquiries",
    body: (
      <>
        When you send the catering form, your inquiry is sent to us through
        Formspree.
      </>
    ),
  },
  {
    title: "Hosting",
    body: <>This site is hosted by Netlify.</>,
  },
  {
    title: "We do not sell your data",
    body: <>We do not sell personal data.</>,
  },
  {
    title: "Your choices",
    body: (
      <>
        To see, correct, or delete your data, email <EmailLink />.
      </>
    ),
  },
  {
    title: "Contact",
    body: (
      <>
        Questions about this policy? Email <EmailLink />.
      </>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <h1 className="text-balance text-3xl font-semibold text-ink sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-ink/70">Last updated: {LAST_UPDATED}</p>
        <p className="mt-6 text-pretty text-[15px] leading-relaxed text-ink/70">
          {siteConfig.name} is a small bakery in {siteConfig.location}. This
          page explains what information we collect on this site and how we
          use it.
        </p>

        {sections.map((section) => (
          <section key={section.title} className="mt-8">
            <h2 className="text-xl font-semibold text-ink">{section.title}</h2>
            <p className="mt-2 text-pretty text-[15px] leading-relaxed text-ink/70">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
