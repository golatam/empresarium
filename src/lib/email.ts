'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || 'Empresarium <noreply@golatam.digital>';

type Locale = 'en' | 'es' | 'pt' | 'ru';

const otpSubjects: Record<Locale, string> = {
  en: 'Your verification code — Empresarium',
  es: 'Tu código de verificación — Empresarium',
  pt: 'Seu código de verificação — Empresarium',
  ru: 'Ваш код подтверждения — Empresarium',
};

const otpTexts: Record<Locale, { heading: string; body: string; ignore: string }> = {
  en: {
    heading: 'Your verification code',
    body: 'Use the following code to sign in to your Empresarium account. It expires in 10 minutes.',
    ignore: 'If you didn\'t request this code, you can safely ignore this email.',
  },
  es: {
    heading: 'Tu código de verificación',
    body: 'Usa el siguiente código para iniciar sesión en tu cuenta de Empresarium. Expira en 10 minutos.',
    ignore: 'Si no solicitaste este código, puedes ignorar este correo.',
  },
  pt: {
    heading: 'Seu código de verificação',
    body: 'Use o código a seguir para entrar na sua conta Empresarium. Ele expira em 10 minutos.',
    ignore: 'Se você não solicitou este código, pode ignorar este e-mail.',
  },
  ru: {
    heading: 'Ваш код подтверждения',
    body: 'Используйте следующий код для входа в аккаунт Empresarium. Код действителен 10 минут.',
    ignore: 'Если вы не запрашивали этот код, просто проигнорируйте это письмо.',
  },
};

function buildOtpHtml(heading: string, body: string, code: string, footer: string) {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden">
        <tr><td style="background:#0f172a;padding:24px;text-align:center">
          <span style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">Empresarium</span>
        </td></tr>
        <tr><td style="padding:32px 24px">
          <h1 style="margin:0 0 16px;font-size:20px;color:#0f172a">${heading}</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#374151">${body}</p>
          <div style="text-align:center;padding:20px 0">
            <span style="display:inline-block;padding:16px 32px;background:#f4f4f5;border-radius:8px;font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a;font-family:monospace">${code}</span>
          </div>
        </td></tr>
        <tr><td style="padding:0 24px 24px"><p style="margin:0;font-size:13px;color:#9ca3af">${footer}</p></td></tr>
        <tr><td style="padding:16px 24px;border-top:1px solid #e5e7eb;text-align:center">
          <p style="margin:0;font-size:12px;color:#9ca3af">&copy; ${new Date().getFullYear()} Empresarium</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function toLocale(locale: string): Locale {
  if (locale === 'es' || locale === 'pt' || locale === 'ru') return locale;
  return 'en';
}

export async function sendOtpEmail(email: string, code: string, locale: string) {
  const loc = toLocale(locale);
  const texts = otpTexts[loc];

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: otpSubjects[loc],
    html: buildOtpHtml(texts.heading, texts.body, code, texts.ignore),
  });

  if (error) {
    console.error('[Resend] Failed to send OTP email:', error);
    throw new Error('Failed to send email');
  }
}
