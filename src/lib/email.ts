'use server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const from = process.env.EMAIL_FROM || 'Empresarium <noreply@golatam.digital>';

type Locale = 'en' | 'es' | 'pt' | 'ru';

const resetSubjects: Record<Locale, string> = {
  en: 'Reset your password — Empresarium',
  es: 'Restablecer contraseña — Empresarium',
  pt: 'Redefinir senha — Empresarium',
  ru: 'Сброс пароля — Empresarium',
};

const confirmSubjects: Record<Locale, string> = {
  en: 'Confirm your email — Empresarium',
  es: 'Confirma tu correo — Empresarium',
  pt: 'Confirme seu e-mail — Empresarium',
  ru: 'Подтвердите email — Empresarium',
};

const resetTexts: Record<Locale, { heading: string; body: string; button: string; ignore: string }> = {
  en: {
    heading: 'Reset your password',
    body: 'You requested a password reset for your Empresarium account. Click the button below to set a new password.',
    button: 'Reset password',
    ignore: 'If you didn\'t request this, you can safely ignore this email.',
  },
  es: {
    heading: 'Restablecer contraseña',
    body: 'Solicitaste restablecer la contraseña de tu cuenta de Empresarium. Haz clic en el botón para establecer una nueva.',
    button: 'Restablecer contraseña',
    ignore: 'Si no solicitaste esto, puedes ignorar este correo.',
  },
  pt: {
    heading: 'Redefinir senha',
    body: 'Você solicitou a redefinição da senha da sua conta Empresarium. Clique no botão abaixo para definir uma nova senha.',
    button: 'Redefinir senha',
    ignore: 'Se você não solicitou isso, pode ignorar este e-mail.',
  },
  ru: {
    heading: 'Сброс пароля',
    body: 'Вы запросили сброс пароля для вашей учётной записи Empresarium. Нажмите кнопку ниже, чтобы установить новый пароль.',
    button: 'Сбросить пароль',
    ignore: 'Если вы не запрашивали сброс, просто проигнорируйте это письмо.',
  },
};

const confirmTexts: Record<Locale, { heading: string; body: string; button: string }> = {
  en: {
    heading: 'Confirm your email',
    body: 'Thanks for signing up for Empresarium! Please confirm your email address by clicking the button below.',
    button: 'Confirm email',
  },
  es: {
    heading: 'Confirma tu correo',
    body: '¡Gracias por registrarte en Empresarium! Confirma tu dirección de correo haciendo clic en el botón.',
    button: 'Confirmar correo',
  },
  pt: {
    heading: 'Confirme seu e-mail',
    body: 'Obrigado por se cadastrar no Empresarium! Confirme seu endereço de e-mail clicando no botão abaixo.',
    button: 'Confirmar e-mail',
  },
  ru: {
    heading: 'Подтвердите email',
    body: 'Спасибо за регистрацию в Empresarium! Подтвердите ваш email, нажав кнопку ниже.',
    button: 'Подтвердить email',
  },
};

function buildHtml(heading: string, body: string, buttonText: string, link: string, footer?: string) {
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
          <a href="${link}" style="display:inline-block;padding:12px 32px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600">${buttonText}</a>
        </td></tr>
        ${footer ? `<tr><td style="padding:0 24px 24px"><p style="margin:0;font-size:13px;color:#9ca3af">${footer}</p></td></tr>` : ''}
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

export async function sendPasswordResetEmail(email: string, resetLink: string, locale: string) {
  const loc = toLocale(locale);
  const texts = resetTexts[loc];

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: resetSubjects[loc],
    html: buildHtml(texts.heading, texts.body, texts.button, resetLink, texts.ignore),
  });

  if (error) {
    console.error('[Resend] Failed to send password reset email:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendConfirmationEmail(email: string, confirmLink: string, locale: string) {
  const loc = toLocale(locale);
  const texts = confirmTexts[loc];

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: confirmSubjects[loc],
    html: buildHtml(texts.heading, texts.body, texts.button, confirmLink),
  });

  if (error) {
    console.error('[Resend] Failed to send confirmation email:', error);
    throw new Error('Failed to send email');
  }
}
