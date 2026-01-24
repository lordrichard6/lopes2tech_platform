export function getPaymentProcessingEmailHtml(invoiceNumber: string, installmentNumber: number, amount: string, currency: string) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .details { background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Payment Verification Required</h2>
        </div>
        <div class="content">
            <p>Hello Admin,</p>
            <p>A client has marked an installment as <strong>PAID</strong>. Please verify the receipt in your bank account.</p>
            
            <div class="details">
                <p><strong>Invoice:</strong> #${invoiceNumber}</p>
                <p><strong>Installment:</strong> #${installmentNumber}</p>
                <p><strong>Amount:</strong> ${currency} ${amount}</p>
            </div>

            <p>Once verified, please confirm the payment in the admin dashboard.</p>
            
            <center>
                <a href="https://app.lopes2tech.ch/admin/invoices" class="button">Go to Admin Dashboard</a>
            </center>
        </div>
    </div>
</body>
</html>
    `;
}

export function getPaymentConfirmedEmailHtml(invoiceNumber: string, installmentNumber: number, amount: string, currency: string) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #ecfdf5; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .details { background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="color: #059669;">Payment Confirmed</h2>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>We successfully received your payment. Thank you for your business!</p>
            
            <div class="details">
                <p><strong>Invoice:</strong> #${invoiceNumber}</p>
                <p><strong>Installment:</strong> #${installmentNumber}</p>
                <p><strong>Amount:</strong> ${currency} ${amount}</p>
                <p><strong>Status:</strong> <span style="color: #059669; font-weight: bold;">PAID</span></p>
            </div>

            <p>You can view your updated invoice status in the client portal.</p>
            
            <center>
                <a href="https://app.lopes2tech.ch/dashboard/invoices" class="button">View Invoice</a>
            </center>
        </div>
    </div>
</body>
</html>
    `;
}

export function getWelcomeEmailTemplate(language: 'en' | 'de' | 'pt', data: { appUrl: string, email: string, password: string, clientName: string }) {
    const t = {
        en: {
            subject: 'Welcome to Lopes2Tech',
            title: 'Welcome to Lopes2Tech',
            greeting: `Hello ${data.clientName},`,
            intro: 'Your client portal is now ready. You can access your documents, invoices, and project status using the link below.',
            button: 'Access Client Portal',
            credentials: 'Your credentials:',
            emailLabel: 'Email:',
            passwordLabel: 'Temporary Password:',
            footer: 'If the button doesn\'t work, copy this link:',
        },
        de: {
            subject: 'Willkommen bei Lopes2Tech',
            title: 'Willkommen bei Lopes2Tech',
            greeting: `Hallo ${data.clientName},`,
            intro: 'Ihr Kundenportal ist jetzt bereit. Sie haben Zugriff auf Ihre Dokumente, Rechnungen und den Projektstatus über den untenstehenden Link.',
            button: 'Kundenportal aufrufen',
            credentials: 'Ihre Zugangsdaten:',
            emailLabel: 'E-Mail:',
            passwordLabel: 'Vorläufiges Passwort:',
            footer: 'Falls der Button nicht funktioniert, kopieren Sie diesen Link:',
        },
        pt: {
            subject: 'Bem-vindo à Lopes2Tech',
            title: 'Bem-vindo à Lopes2Tech',
            greeting: `Olá ${data.clientName},`,
            intro: 'O seu portal do cliente já está pronto. Você pode acessar seus documentos, faturas e status do projeto usando o link abaixo.',
            button: 'Acessar Portal do Cliente',
            credentials: 'Suas credenciais:',
            emailLabel: 'E-mail:',
            passwordLabel: 'Senha temporária:',
            footer: 'Se o botão não funcionar, copie este link:',
        }
    }[language] || {
        subject: 'Welcome to Lopes2Tech',
        title: 'Welcome to Lopes2Tech',
        greeting: `Hello ${data.clientName},`,
        intro: 'Your client portal is now ready. You can access your documents, invoices, and project status using the link below.',
        button: 'Access Client Portal',
        credentials: 'Your credentials:',
        emailLabel: 'Email:',
        passwordLabel: 'Temporary Password:',
        footer: 'If the button doesn\'t work, copy this link:',
    };

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { padding: 20px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #0f172a; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .credentials { background-color: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>${t.title}</h2>
        </div>
        <div class="content">
            <p>${t.greeting}</p>
            <p>${t.intro}</p>
            
            <div class="credentials">
                <h3>${t.credentials}</h3>
                <p><strong>${t.emailLabel}</strong> ${data.email}</p>
                <p><strong>${t.passwordLabel}</strong> ${data.password}</p>
            </div>
            
            <center>
                <a href="${data.appUrl}/login" class="button">${t.button}</a>
            </center>
            
            <p style="margin-top: 20px; font-size: 0.9em; color: #666;">
                ${t.footer}<br>
                ${data.appUrl}/login
            </p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject: t.subject, html };
}
