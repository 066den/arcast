export default function DataDeletionPage() {
  return (
    <section className="py-6 xl:py-14 space-y-6">
      <h1 className="text-accent">Data Deletion Request</h1>
      <div className="text-content space-y-3 text-xl">
        <p>
          At Arcast Studio, we respect your privacy and your right to control
          your personal data. If you would like to request the deletion of your
          personal data associated with our services, please follow the
          instructions below.
        </p>
      </div>
      <h2 className="text-accent">1. How to Request Data Deletion</h2>
      <div className="text-content space-y-3 text-xl">
        <p>
          If you wish to delete your data from our systems, you can request this
          by contacting us at:
        </p>
        <ul>
          <li>
            Email:{' '}
            <a href="mailto:Booking@arcast.studio">Booking@arcast.studio</a>
          </li>
          <li>
            Phone: <a href="tel:+971508249795">+971 508249795</a>
          </li>
        </ul>
        <p>Please include the following details in your request:</p>
        <ul>
          <li>Your full name</li>
          <li>The email or phone number associated with your account</li>
          <li>A brief description of your request</li>
        </ul>
      </div>
      <h2 className="text-accent">2. What Happens Next?</h2>
      <div className="text-content space-y-3 text-xl">
        <ul>
          <li>
            Once we receive your request, we will verify your identity to ensure
            security.
          </li>
          <li>
            Your data will be deleted from our systems within 7-14 business
            days, in compliance with applicable regulations.
          </li>
          <li>
            You will receive a confirmation email once the deletion is complete.
          </li>
        </ul>
      </div>
      <h2 className="text-accent">3. Exceptions to Data Deletion</h2>
      <div className="text-content space-y-3 text-xl">
        <p>
          Certain data may not be immediately deleted due to legal, security, or
          operational requirements. This includes:
        </p>
        <ul>
          <li>Data necessary to comply with legal obligations.</li>
          <li>Data related to transactions or support requests.</li>
          <li>Data required for fraud prevention and security measures.</li>
        </ul>
      </div>
    </section>
  )
}
