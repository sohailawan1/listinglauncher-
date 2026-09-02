/**
 * Email service via Resend. Falls back to console-log when not configured so
 * the app stays functional in dev. Set RESEND_API_KEY + RESEND_FROM in env to
 * enable real delivery.
 */

export type EmailTemplate =
  | "booking_received"
  | "booking_accepted"
  | "booking_delivered"
  | "booking_released"
  | "review_request"
  | "creator_approved"
  | "creator_rejected"
  | "creator_application_received";

export type EmailArgs = Record<string, string | number>;

const FROM = process.env.RESEND_FROM ?? "ListingLauncher <hello@listinglauncher.app>";

function template(name: EmailTemplate, args: EmailArgs): { subject: string; html: string; text: string } {
  switch (name) {
    case "booking_received":
      return {
        subject: `Booking received: ${args.listingTitle}`,
        text: `We received your booking request for "${args.listingTitle}" ($${args.budget}). The creator will reply within 48 hours.`,
        html: `<p>We received your booking request for <strong>${args.listingTitle}</strong> ($${args.budget}).</p><p>The creator will reply within 48 hours.</p>`,
      };
    case "booking_accepted":
      return {
        subject: `${args.creatorName} accepted your promotion`,
        text: `${args.creatorName} accepted your promotion for "${args.listingTitle}". They will deliver by ${args.deadline}.`,
        html: `<p><strong>${args.creatorName}</strong> accepted your promotion for <em>${args.listingTitle}</em>.</p><p>Expected delivery: <strong>${args.deadline}</strong>.</p>`,
      };
    case "booking_delivered":
      return {
        subject: `${args.creatorName} delivered your promotion`,
        text: `${args.creatorName} finished the promotion for "${args.listingTitle}". View the work and approve.`,
        html: `<p><strong>${args.creatorName}</strong> finished the promotion for <em>${args.listingTitle}</em>.</p><p><a href="${args.url}">View the work &amp; approve</a> to release payment.</p>`,
      };
    case "booking_released":
      return {
        subject: `$${args.amount} paid to ${args.creatorName}`,
        text: `We released $${args.amount} to ${args.creatorName} for "${args.listingTitle}".`,
        html: `<p>We released <strong>$${args.amount}</strong> to ${args.creatorName} for <em>${args.listingTitle}</em>.</p>`,
      };
    case "review_request":
      return {
        subject: `How was ${args.creatorName}?`,
        text: `Leave a quick review to help other sellers find great creators.`,
        html: `<p>How was working with <strong>${args.creatorName}</strong>?</p><p><a href="${args.url}">Leave a 1-tap review</a> to help other sellers find great creators.</p>`,
      };
    case "creator_approved":
      return {
        subject: `You're approved on ListingLauncher!`,
        text: `Your creator profile is live. Sellers can now hire you to promote their products.`,
        html: `<p>Your creator profile is live.</p><p>Sellers can now hire you to promote their products. <a href="${args.url}">View your profile</a>.</p>`,
      };
    case "creator_rejected":
      return {
        subject: `Application update`,
        text: `Unfortunately we couldn't approve your application right now. ${args.reason ?? ""}`,
        html: `<p>Unfortunately we couldn't approve your application right now.</p>${args.reason ? `<p>${args.reason}</p>` : ""}`,
      };
    case "creator_application_received":
      return {
        subject: `Application received`,
        text: `We received your creator application. We'll review and email you within 3 days.`,
        html: `<p>We received your creator application. We'll review and email you within 3 days.</p>`,
      };
  }
}

export async function sendEmail(to: string, name: EmailTemplate, args: EmailArgs = {}): Promise<void> {
  const t = template(name, args);
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email:dev] → ${to} — ${t.subject}`);
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject: t.subject, html: t.html, text: t.text }),
    });
    if (!res.ok) console.error(`[email] Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
  } catch (err) {
    console.error(`[email] failed to send to ${to}:`, err);
  }
}
