import mongoose from "mongoose";
import { env } from "../config/env.js";
import { ContactMessage } from "../models/ContactMessage.js";

async function sendEmail({ name, email, subject, message }) {
  if (!env.resendApiKey || !env.contactEmailTo) {
    return { sent: false, reason: "Email provider is not configured." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.contactEmailFrom,
      to: env.contactEmailTo,
      reply_to: email,
      subject: `Voyage contact: ${subject}`,
      text: `${name} <${email}> wrote:\n\n${message}`
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Email delivery failed: ${detail}`);
  }

  return { sent: true };
}

export async function createContact(req, res, next) {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message || !String(email).includes("@")) {
      return res.status(400).json({ message: "Name, valid email, subject, and message are required." });
    }

    if (mongoose.connection.readyState === 1) {
      await ContactMessage.create({ name, email, subject, message });
    }

    const emailResult = await sendEmail({ name, email, subject, message });
    res.status(201).json({ message: "Thanks. Your message has been received.", email: emailResult });
  } catch (error) {
    next(error);
  }
}
