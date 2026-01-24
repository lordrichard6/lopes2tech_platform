
export type Language = 'en' | 'de' | 'pt';

interface TemplateProps {
    appUrl: string;
    email: string;
    password?: string; // Optional now
    actionUrl?: string; // New: For Magic Link / Reset Password
    clientName: string;
}

const styles = {
    container: `font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; overflow: hidden;`,
    header: `background: linear-gradient(135deg, #10769B 0%, #09445C 100%); padding: 30px 20px; text-align: center;`,
    logo: `font-size: 28px; font-weight: bold; color: #ffffff; text-decoration: none; letter-spacing: 1px;`,
    body: `padding: 40px 30px;`,
    title: `font-size: 22px; color: #09445C; margin-bottom: 20px; font-weight: 600;`,
    text: `font-size: 16px; color: #4a5568; line-height: 1.6; margin-bottom: 20px;`,
    buttonContainer: `text-align: center; margin: 35px 0;`,
    button: `background-color: #10769B; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; box-shadow: 0 2px 4px rgba(0,0,0,0.1);`,
    credentialsBox: `background-color: #f8fafc; border-radius: 8px; padding: 25px; border: 1px solid #e2e8f0; margin: 25px 0; text-align: left;`,
    credentialGroup: `margin-bottom: 15px;`,
    credentialLabel: `font-size: 12px; text-transform: uppercase; color: #718096; margin-bottom: 4px; display: block; letter-spacing: 0.5px;`,
    credentialValue: `font-size: 18px; color: #2d3748; font-family: monospace; font-weight: 600; display: block; background: #fff; padding: 8px 12px; border-radius: 4px; border: 1px solid #cbd5e0;`,
    footer: `background-color: #f7fafc; padding: 20px; text-align: center; font-size: 12px; color: #718096; border-top: 1px solid #edf2f7;`
};

export function getWelcomeEmailTemplate(language: Language, props: TemplateProps): { subject: string; html: string } {
    const { appUrl, email, password, actionUrl, clientName } = props;
    const loginUrl = `${appUrl}/login`;

    // We strictly use the login URL now, ignoring actionUrl for button
    const targetUrl = loginUrl;

    const content = {
        en: {
            subject: 'Welcome to Lopes2Tech Client Portal',
            greeting: `Hi ${clientName},`,
            intro: 'Your client account has been created successfully. Below are your secure login credentials to access your projects, invoices, and documents.',
            loginButton: 'Log In to Portal',
            credentialsTitle: 'Access Credentials',
            emailLabel: 'Email Address',
            passwordLabel: 'Temporary Password',
            note: '<strong>Important:</strong> Please log in and change your password immediately in the settings area.',
            footer: '© Lopes2Tech. All rights reserved.',
            warning: 'If you did not request this account, please contact support.'
        },
        de: {
            subject: 'Willkommen im Lopes2Tech Kundenportal',
            greeting: `Hallo ${clientName},`,
            intro: 'Ihr Kundenkonto wurde erfolgreich erstellt. Unten finden Sie Ihre sicheren Zugangsdaten, um auf Ihre Projekte, Rechnungen und Dokumente zuzugreifen.',
            loginButton: 'Im Portal anmelden',
            credentialsTitle: 'Zugangsdaten',
            emailLabel: 'E-Mail-Adresse',
            passwordLabel: 'Vorläufiges Passwort',
            note: '<strong>Wichtig:</strong> Bitte ändern Sie Ihr Passwort sofort nach der Anmeldung in den Einstellungen.',
            footer: '© Lopes2Tech. Alle Rechte vorbehalten.',
            warning: 'Falls Sie dieses Konto nicht angefordert haben, kontaktieren Sie bitte den Support.'
        },
        pt: {
            subject: 'Bem-vindo ao Portal de Clientes Lopes2Tech',
            greeting: `Olá ${clientName},`,
            intro: 'A sua conta de cliente foi criada com sucesso. Abaixo estão as suas credenciais de acesso seguro para consultar projetos, faturas e documentos.',
            loginButton: 'Aceder ao Portal',
            credentialsTitle: 'Credenciais de Acesso',
            emailLabel: 'Endereço de Email',
            passwordLabel: 'Palavra-passe Temporária',
            note: '<strong>Importante:</strong> Por favor, altere a sua palavra-passe imediatamente nas definições após entrar.',
            footer: '© Lopes2Tech. Todos os direitos reservados.',
            warning: 'Se não solicitou esta conta, por favor contacte o suporte.'
        }
    };

    const t = content[language];

    // Always render credentials box for this new flow
    const credentialsHtml = `
        <div style="${styles.credentialsBox}">
            <div style="margin-bottom: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; font-weight: bold; color: #10769B;">
                ${t.credentialsTitle}
            </div>
            
            <div style="${styles.credentialGroup}">
                <span style="${styles.credentialLabel}">${t.emailLabel}</span>
                <span style="${styles.credentialValue}">${email}</span>
            </div>
            
            <div style="${styles.credentialGroup}" style="margin-bottom: 0;">
                <span style="${styles.credentialLabel}">${t.passwordLabel}</span>
                <span style="${styles.credentialValue}">${password || '********'}</span>
            </div>
        </div>
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>${t.subject}</title>
</head>
<body style="background-color: #f3f4f6; padding: 40px 0; margin: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
    <div style="${styles.container}">
        <div style="${styles.header}">
            <div style="${styles.logo}">Lopes2Tech</div>
        </div>
        
        <div style="${styles.body}">
            <h2 style="${styles.title}">${t.greeting}</h2>
            
            <p style="${styles.text}">${t.intro}</p>
            
            ${credentialsHtml}
            
            <div style="${styles.buttonContainer}">
                <a href="${targetUrl}" style="${styles.button}">${t.loginButton}</a>
            </div>
            
            <p style="${styles.text}">
                ${t.note}
            </p>
        </div>
        
        <div style="${styles.footer}">
            <p style="margin: 0 0 10px 0;">${t.footer}</p>
            <p style="margin: 0; font-size: 10px; color: #a0aec0;">${t.warning}</p>
        </div>
    </div>
</body>
</html>
    `;

    return {
        subject: t.subject,
        html
    };
}
