import { NextResponse } from 'next/server';

// In-memory store for basic rate-limiting and double-submit prevention
// Note: In a multi-instance production environment, use Redis or a DB instead.
const submitCache = new Map();

function sanitize(input) {
  if (!input) return "";
  return input.toString().replace(/[<>]/g, "").trim();
}

export async function POST(req) {
  try {
    const body = await req.json();
    
    const name = sanitize(body.name);
    const email = sanitize(body.email);
    const phone = sanitize(body.phone);
    const whatsapp = sanitize(body.whatsapp);
    const projectType = sanitize(body.projectType);
    const budget = sanitize(body.budget);
    const timeline = sanitize(body.timeline);
    const topic = sanitize(body.topic);

    // 1. Server-side Validation
    if (!name || !email || !projectType || !topic) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
    }

    if (topic.length > 2000) {
      return NextResponse.json({ error: "Message is too long. Max 2000 characters." }, { status: 400 });
    }

    // 2. Rate Limiting & Double Submit Guard
    // Use IP + email as a unique key for recent submissions
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const cacheKey = `${ip}-${email}`;
    
    const lastSubmitTime = submitCache.get(cacheKey);
    const now = Date.now();
    
    // Prevent submissions within 60 seconds (rate limiting + double submit)
    if (lastSubmitTime && now - lastSubmitTime < 60000) {
      return NextResponse.json({ error: "You are submitting too quickly. Please wait a moment." }, { status: 429 });
    }
    
    // 3. Save the Lead
    // We send to a configured CRM / Database Webhook (e.g. Zapier, Make, or internal backend)
    const leadWebhookUrl = process.env.LEAD_WEBHOOK_URL;
    
    if (leadWebhookUrl) {
      const dbRes = await fetch(leadWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Strategy Call Booking',
          name, email, phone, whatsapp, projectType, budget, timeline, topic,
          timestamp: new Date().toISOString(),
          ip
        })
      });
      
      if (!dbRes.ok) {
        throw new Error(`Failed to save lead: ${dbRes.statusText}`);
      }
    } else {
      // If no webhook configured, log it to server console (fallback)
      console.log(`[LEAD SAVED] New strategy call request from ${name} (${email})`);
    }

    // Mark as submitted in cache only after successful save
    submitCache.set(cacheKey, now);

    // 4. Email Handling (Notification & Auto-reply)
    // We use a non-blocking Promise to ensure failure doesn't stop the success response.
    const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL;
    if (emailWebhookUrl) {
      // Async execution (fire and forget)
      Promise.all([
        // Send Notification to Owner
        fetch(emailWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.EMAIL_API_KEY || ''}` },
          body: JSON.stringify({
            to: process.env.OWNER_EMAIL,
            subject: `New Strategy Call Request: ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nWhatsApp: ${whatsapp}\nType: ${projectType}\nBudget: ${budget}\nTimeline: ${timeline}\nTopic: ${topic}`
          })
        }),
        // Send Auto-reply to Lead
        fetch(emailWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.EMAIL_API_KEY || ''}` },
          body: JSON.stringify({
            to: email,
            subject: `Request Received - Codalina Strategy Call`,
            text: `Hi ${name},\n\nWe have received your request for a strategy call. Our founder will review your details and send you a calendar link within 24 hours.\n\nBest,\nCodalina Team`
          })
        })
      ]).catch((err) => {
        // Log failure but DO NOT break the success response
        console.error(`[EMAIL ERROR] Failed to send emails for lead ${email}:`, err);
      });
    }

    return NextResponse.json({ success: true, message: "Lead saved successfully." });

  } catch (error) {
    console.error("[BOOK CALL ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
