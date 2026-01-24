import { Resend } from 'resend';

// NOTE: You need to add RESEND_API_KEY to your .env.local file
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailProps) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY is missing. Email not sent.");
        return { success: false, error: "Missing API Key" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from: 'Lopes2Tech <onboarding@info.lopes2tech.ch>', // Verified domain
            to,
            subject,
            html,
        });

        if (error) {
            console.error("Resend API Error:", error);
            return { success: false, error: error.message };
        }

        return { success: true, data };
    } catch (error: unknown) {
        console.error("Email sending exception:", error);
        return { success: false, error: (error as Error).message || "Unknown email error" };
    }
}
