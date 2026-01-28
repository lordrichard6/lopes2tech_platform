export type Locale = 'en' | 'pt' | 'de';

export type Dictionary = {
    dashboard: {
        welcome: string;
        activeProjects: string;
        pendingInvoices: string;
        sharedDocuments: string;
        totalProjects: string;
        pending: string;
        filesAvailable: string;
        quickActions: string;
        viewDocuments: string;
        editProfile: string;
        contactSupport: string;
        profile: string;
        settings: string;
        signOut: string;
        theme: {
            title: string;
            horizon: string;
            sunset: string;
            forest: string;
            neutral: string;
        };
    };
    projects: {
        title: string;
        subtitle: string;
        myProjects: string;
        status: string;
        progress: string;
        due: string;
        viewDetails: string;
        backToProjects: string;
        backToDashboard: string;
        roadmap: string;
        projectBudget: string;
        totalInvoiced: string;
        paidAmount: string;
        makePayment: string;
        makeRequest: string;
        documents: string;
        lastUpdated: string;
        overallCompletion: string;
        viewInvoices: string;
        paidWatermark: string;
        nextUp: string;
        statusMap: {
            active: string;
            completed: string;
            pending: string;
            'on-hold': string;
            'in-progress': string;
        };
    };
    invoices: {
        title: string;
        myInvoices: string;
        paid: string;
        due: string;
        viewDetails: string;
        download: string;
        invoice: string;
        paidAmount: string;
        statusMap: {
            paid: string;
            pending: string;
            partial: string;
            overdue: string;
            draft: string;
            cancelled: string;
        };
        details: {
            backToInvoices: string;
            from: string;
            billTo: string;
            issueDate: string;
            description: string;
            totalAmount: string;
            paidToDate: string;
            remainingDue: string;
            paymentSchedule: string;
            installment: string;
            amount: string;
            action: string;
            paymentHistory: string;
            date: string;
            method: string;
            bankTransferDetails: string;
            bank: string;
            accountHolder: string;
            referenceNote: string;
            questions: string;
            helpText: string;
            pay: string;
            pendingVerification: string;
        };
    };
    common: {
        loading: string;
        error: string;
        noData: string;
    };
    sidebar: {
        dashboard: string;
        projects: string;
        requests: string;
        documents: string;
        invoices: string;
    };
    documents: {
        title: string;
        subtitle: string;
        download: string;
        noDocs: string;
        errorDetails: string;
        upload: {
            button: string;
            title: string;
            description: string;
            selectProject: string;
            dragDrop: string;
            uploading: string;
            success: string;
        };
    };
    settings: {
        title: string;
        description: string;
        profileInformation: string;
        profileDescription: string;
        billingAddress: string;
        billingDescription: string;
        security: string;
        securityDescription: string;
        saveChanges: string;
        saving: string;
        billing: {
            sameAsMain: string;
            save: string;
            saving: string;
        };
        securityForm: {
            newPassword: string;
            newPasswordDesc: string;
            confirmPassword: string;
            updatePassword: string;
            passwordMismatch: string;
            passwordMinLength: string;
            success: string;
        };
        form: {
            fullName: string;
            email: string;
            company: string;
            phone: string;
            secondaryEmail: string;
            whatsapp: string;
            street: string;
            city: string;
            zip: string;
            country: string;
            preferences: string;
            language: string;
            timezone: string;
            address: string;
        };
    };
    requests: {
        title: string;
        newRequest: string;
        noRequests: string;
        createFirst: string;
        view: string;
        quote: string;
        priority: string;
        createdOn: string;
        cancelRequest: string;
        description: string;
        quoteReceived: string;
        approveQuote: string;
        declineQuote: string;
        dialog: {
            title: string;
            description: string;
            requestTitle: string;
            details: string;
            cancel: string;
            submit: string;
            success: string;
            error: string;
            priorityLow: string;
            priorityMedium: string;
            priorityHigh: string;
            priorityPlaceholder: string;
        };
        statusMap: {
            requested: string;
            quoted: string;
            active: string;
            rejected: string;
            completed: string;
            cancelled: string;
        };
    };
    auth: {
        title: string;
        subtitle: string;
        email: string;
        password: string;
        login: string;
        forgotPassword: string;
        contactSupport: string;
        needHelp: string;
        footer: string;
    };
    subscriptions: {
        title: string;
        subtitle: string;
        noSubscriptions: string;
        noSubscriptionsDesc: string;
        stripeLinked: string;
        paid: string;
        pastDue: string;
        unpaid: string;
        started: string;
        ended: string;
        nextPayment: string;
        lastPaid: string;
        amountDue: string;
        payNow: string;
        processing: string;
        viewInStripe: string;
        noDescription: string;
        unknown: string;
        paymentLog: string;
        payment: string;
        recorded: string;
        noPaymentsYet: string;
    };
};

export const dictionaries: Record<Locale, Dictionary> = {
    en: {
        settings: {
            title: "Settings",
            description: "Manage your account settings and preferences.",
            profileInformation: "Profile Information",
            profileDescription: "Your personal and business details.",
            billingAddress: "Billing Address",
            billingDescription: "Address used for invoices.",
            security: "Security",
            securityDescription: "Update your password to keep your account secure.",
            saveChanges: "Save Changes",
            saving: "Saving...",
            billing: {
                sameAsMain: "Same as main address",
                save: "Save",
                saving: "Saving...",
            },
            securityForm: {
                newPassword: "New Password",
                newPasswordDesc: "Enter your new password.",
                confirmPassword: "Confirm Password",
                updatePassword: "Update Password",
                passwordMismatch: "Passwords don't match",
                passwordMinLength: "Password must be at least 6 characters.",
                success: "Password updated successfully",
            },
            form: {
                fullName: "Full Name",
                email: "Email",
                company: "Company",
                phone: "Phone",
                secondaryEmail: "Secondary Email",
                whatsapp: "WhatsApp Number",
                street: "Street Address",
                city: "City",
                zip: "Postal Code",
                country: "Country",
                preferences: "Preferences",
                language: "Preferred Language",
                timezone: "Timezone",
                address: "Address",
            }
        },
        requests: {
            title: "Access Requests",
            newRequest: "New Request",
            noRequests: "No requests found.",
            createFirst: "Create your first request",
            view: "View",
            quote: "Quote",
            priority: "Priority",
            createdOn: "Created on",
            cancelRequest: "Cancel Request",
            description: "Description",
            quoteReceived: "Quote Received",
            approveQuote: "Approve Quote",
            declineQuote: "Decline",
            dialog: {
                title: "Submit New Request",
                description: "Describe what you need. We'll review and provide a quote.",
                requestTitle: "Request Title",
                details: "Details",
                cancel: "Cancel",
                submit: "Submit Request",
                success: "Request submitted successfully!",
                error: "Failed to submit request.",
                priorityLow: "Low",
                priorityMedium: "Medium",
                priorityHigh: "High",
                priorityPlaceholder: "Select priority",
            },
            statusMap: {
                requested: "Requested",
                quoted: "Quoted",
                active: "Active",
                rejected: "Rejected",
                completed: "Completed",
                cancelled: "Cancelled",
            },
        },
        auth: {
            title: "Welcome to my office",
            subtitle: "Enter your credentials to access your account",
            email: "Email",
            password: "Password",
            login: "Sign in",
            forgotPassword: "Forgot password?",
            contactSupport: "Contact Support",
            needHelp: "Need help?",
            footer: "Lopes2Tech. All rights reserved.",
        },
        subscriptions: {
            title: "My Subscriptions",
            subtitle: "View your active recurring services and payment status",
            noSubscriptions: "No subscriptions found",
            noSubscriptionsDesc: "You don't have any active subscriptions yet.",
            stripeLinked: "Stripe Linked",
            paid: "Paid",
            pastDue: "Past Due",
            unpaid: "Unpaid",
            started: "Started",
            ended: "Ended",
            nextPayment: "Next payment",
            lastPaid: "Last paid",
            amountDue: "Amount due",
            payNow: "Pay Now",
            processing: "Processing...",
            viewInStripe: "View in Stripe",
            noDescription: "No description",
            unknown: "Unknown",
            paymentLog: "Payment Log",
            payment: "payment",
            recorded: "recorded",
            noPaymentsYet: "No payments recorded yet. Payments will appear here after payment is processed.",
        },
        dashboard: {
            welcome: "Welcome back",
            activeProjects: "Active Projects",
            pendingInvoices: "Pending Invoices",
            sharedDocuments: "Shared Documents",
            totalProjects: "total projects",
            pending: "pending",
            filesAvailable: "Available files",
            quickActions: "Quick Actions",
            viewDocuments: "View Documents",
            editProfile: "Edit Profile",
            contactSupport: "Contact Support",
            profile: "Profile",
            settings: "Settings",
            signOut: "Sign out",
            theme: {
                title: "Theme Color",
                horizon: "Deep Blue",
                sunset: "Sunset",
                forest: "Forest",
                neutral: "Neutral",
            },
        },
        projects: {
            title: "Projects",
            subtitle: "Manage and track your ongoing projects.",
            myProjects: "My Projects",
            status: "Status",
            progress: "Progress",
            due: "Due",
            viewDetails: "View Details",
            backToProjects: "Back to Projects",
            backToDashboard: "Back to Dashboard",
            roadmap: "Project Roadmap",
            projectBudget: "Project Budget",
            totalInvoiced: "Total Invoiced",
            paidAmount: "Paid Amount",
            makePayment: "Make Payment",
            makeRequest: "Make a Request",
            documents: "Documents",
            lastUpdated: "Last updated",
            overallCompletion: "Overall Completion",
            viewInvoices: "View Invoice",
            paidWatermark: "PAID",
            nextUp: "Next Up",
            statusMap: {
                active: "Active",
                completed: "Completed",
                pending: "Pending",
                'on-hold': "On Hold",
                'in-progress': "In Progress",
            }
        },
        invoices: {
            title: "Invoices",
            myInvoices: "My Invoices",
            paid: "Paid",
            due: "Due",
            viewDetails: "View Details",
            download: "Download",
            invoice: "Invoice",
            paidAmount: "Paid",
            statusMap: {
                paid: "Paid",
                pending: "Pending",
                partial: "Partial",
                overdue: "Overdue",
                draft: "Draft",
                cancelled: "Cancelled",
            },
            details: {
                backToInvoices: "Back to My Invoices",
                from: "From",
                billTo: "Bill To",
                issueDate: "Issue Date",
                description: "Description",
                totalAmount: "Total Amount",
                paidToDate: "Paid to date",
                remainingDue: "Remaining Due",
                paymentSchedule: "Payment Schedule (Installments)",
                installment: "Installment",
                amount: "Amount",
                action: "Action",
                paymentHistory: "Payment History",
                date: "Date",
                method: "Method",
                bankTransferDetails: "Bank Transfer Details",
                bank: "Bank",
                accountHolder: "Account Holder",
                referenceNote: "Please use invoice number {number} as payment reference.",
                questions: "Questions about this invoice?",
                helpText: "We're here to help.",
                pay: "Pay",
                pendingVerification: "Pending Verification",
            },
        },
        common: {
            loading: "Loading...",
            error: "An error occurred",
            noData: "No data found",
        },
        sidebar: {
            dashboard: "Dashboard",
            projects: "My Projects",
            requests: "Requests",
            documents: "Documents",
            invoices: "Invoices",
            subscriptions: "Subscriptions",
        },
        documents: {
            title: "Documents",
            subtitle: "Access files and documents shared with you.",
            download: "Download",
            noDocs: "No documents available yet.",
            errorDetails: "Could not load client profile.",
            upload: {
                button: "Upload Document",
                title: "Upload Document",
                description: "Upload files related to your projects.",
                selectProject: "Select Project (Optional)",
                dragDrop: "Drag and drop file here or click to browse",
                uploading: "Uploading...",
                success: "Document uploaded successfully",
            },
        },
    },
    pt: {
        settings: {
            title: "Configurações",
            description: "Gerencie as configurações e preferências da sua conta.",
            profileInformation: "Informações do Perfil",
            profileDescription: "Seus detalhes pessoais e comerciais.",
            billingAddress: "Endereço de Cobrança",
            billingDescription: "Endereço usado para faturas.",
            security: "Segurança",
            securityDescription: "Atualize sua senha para manter sua conta segura.",
            saveChanges: "Salvar Alterações",
            saving: "Salvando...",
            billing: {
                sameAsMain: "Igual ao endereço principal",
                save: "Salvar",
                saving: "Salvando...",
            },
            securityForm: {
                newPassword: "Nova Senha",
                newPasswordDesc: "Digite sua nova senha.",
                confirmPassword: "Confirmar Senha",
                updatePassword: "Atualizar Senha",
                passwordMismatch: "As senhas não coincidem",
                passwordMinLength: "A senha deve ter pelo menos 6 caracteres.",
                success: "Senha atualizada com sucesso",
            },
            form: {
                fullName: "Nome Completo",
                email: "Email",
                company: "Empresa",
                phone: "Telefone",
                secondaryEmail: "Email Secundário",
                whatsapp: "Número WhatsApp",
                street: "Endereço",
                city: "Cidade",
                zip: "Código Postal",
                country: "País",
                preferences: "Preferências",
                language: "Idioma Preferido",
                timezone: "Fuso Horário",
                address: "Endereço",
            }
        },
        requests: {
            title: "Solicitações de Acesso",
            newRequest: "Nova Solicitação",
            noRequests: "Nenhuma solicitação encontrada.",
            createFirst: "Crie sua primeira solicitação",
            view: "Ver",
            quote: "Cotação",
            priority: "Prioridade",
            createdOn: "Criado em",
            cancelRequest: "Cancelar Solicitação",
            description: "Descrição",
            quoteReceived: "Cotação Recebida",
            approveQuote: "Aprovar Cotação",
            declineQuote: "Recusar",
            dialog: {
                title: "Enviar Nova Solicitação",
                description: "Descreva o que precisa. Analisaremos e enviaremos uma cotação.",
                requestTitle: "Título da Solicitação",
                details: "Detalhes",
                cancel: "Cancelar",
                submit: "Enviar Solicitação",
                success: "Solicitação enviada com sucesso!",
                error: "Falha ao enviar solicitação.",
                priorityLow: "Baixa",
                priorityMedium: "Média",
                priorityHigh: "Alta",
                priorityPlaceholder: "Selecione a prioridade",
            },
            statusMap: {
                requested: "Solicitado",
                quoted: "Cotado",
                active: "Ativo",
                rejected: "Rejeitado",
                completed: "Concluído",
                cancelled: "Cancelado",
            },
        },
        auth: {
            title: "Bem-vindo ao meu escritório",
            subtitle: "Insira suas credenciais para acessar sua conta",
            email: "E-mail",
            password: "Senha",
            login: "Entrar",
            forgotPassword: "Esqueceu a senha?",
            contactSupport: "Contatar Suporte",
            needHelp: "Precisa de ajuda?",
            footer: "Lopes2Tech. Todos os direitos reservados.",
        },
        subscriptions: {
            title: "Minhas Assinaturas",
            subtitle: "Visualize seus serviços recorrentes ativos e status de pagamento",
            noSubscriptions: "Nenhuma assinatura encontrada",
            noSubscriptionsDesc: "Você ainda não tem assinaturas ativas.",
            stripeLinked: "Vinculado ao Stripe",
            paid: "Pago",
            pastDue: "Atrasado",
            unpaid: "Não Pago",
            started: "Iniciado",
            ended: "Encerrado",
            nextPayment: "Próximo pagamento",
            lastPaid: "Último pagamento",
            amountDue: "Valor devido",
            payNow: "Pagar Agora",
            processing: "Processando...",
            viewInStripe: "Ver no Stripe",
            noDescription: "Sem descrição",
            unknown: "Desconhecido",
            paymentLog: "Registro de Pagamentos",
            payment: "pagamento",
            recorded: "registrado",
            noPaymentsYet: "Nenhum pagamento registrado ainda. Os pagamentos aparecerão aqui após o processamento.",
        },
        dashboard: {
            welcome: "Bem-vindo de volta",
            activeProjects: "Projetos Ativos",
            pendingInvoices: "Faturas Pendentes",
            sharedDocuments: "Documentos",
            totalProjects: "projetos total",
            pending: "pendentes",
            filesAvailable: "arquivos disponíveis",
            quickActions: "Ações Rápidas",
            viewDocuments: "Ver Documentos",
            editProfile: "Editar Perfil",
            contactSupport: "Contatar Suporte",
            profile: "Perfil",
            settings: "Configurações",
            signOut: "Sair",
            theme: {
                title: "Cor do Tema",
                horizon: "Azul Profundo",
                sunset: "Pôr do Sol",
                forest: "Floresta",
                neutral: "Neutro",
            },
        },
        projects: {
            title: "Projetos",
            subtitle: "Gerencie e acompanhe seus projetos em andamento.",
            myProjects: "Meus Projetos",
            status: "Status",
            progress: "Progresso",
            due: "Vencimento",
            viewDetails: "Ver Detalhes",
            backToProjects: "Voltar para Projetos",
            backToDashboard: "Voltar ao Painel",
            roadmap: "Roteiro do Projeto",
            projectBudget: "Orçamento do Projeto",
            totalInvoiced: "Total Faturado",
            paidAmount: "Valor Pago",
            makePayment: "Fazer Pagamento",
            makeRequest: "Fazer Solicitação",
            documents: "Documentos",
            lastUpdated: "Última atualização",
            overallCompletion: "Conclusão Geral",
            viewInvoices: "Ver Fatura",
            paidWatermark: "PAGO",
            nextUp: "Próximo Passo",
            statusMap: {
                active: "Ativo",
                completed: "Concluído",
                pending: "Pendente",
                'on-hold': "Em Espera",
                'in-progress': "Em Andamento",
            }
        },
        invoices: {
            title: "Faturas",
            myInvoices: "Minhas Faturas",
            paid: "Pago",
            due: "Vencimento",
            viewDetails: "Ver Detalhes",
            download: "Baixar",
            invoice: "Fatura",
            paidAmount: "Pago",
            statusMap: {
                paid: "Pago",
                pending: "Pendente",
                partial: "Parcial",
                overdue: "Atrasada",
                draft: "Rascunho",
                cancelled: "Cancelada",
            },
            details: {
                backToInvoices: "Voltar para Faturas",
                from: "De",
                billTo: "Faturar Para",
                issueDate: "Data de Emissão",
                description: "Descrição",
                totalAmount: "Valor Total",
                paidToDate: "Pago até o momento",
                remainingDue: "Restante",
                paymentSchedule: "Cronograma de Pagamento (Parcelas)",
                installment: "Parcela",
                amount: "Valor",
                action: "Ação",
                paymentHistory: "Histórico de Pagamentos",
                date: "Data",
                method: "Método",
                bankTransferDetails: "Dados para Transferência",
                bank: "Banco",
                accountHolder: "Titular",
                referenceNote: "Use o número da fatura {number} como referência.",
                questions: "Dúvidas sobre esta fatura?",
                helpText: "Estamos aqui para ajudar.",
                pay: "Pagar",
                pendingVerification: "Verificação Pendente",
            },
        },
        common: {
            loading: "Carregando...",
            error: "Ocorreu um erro",
            noData: "Nenhum dado encontrado",
        },
        sidebar: {
            dashboard: "Painel",
            projects: "Meus Projetos",
            requests: "Solicitações",
            documents: "Documentos",
            invoices: "Faturas",
            subscriptions: "Assinaturas",
        },
        documents: {
            title: "Documentos",
            subtitle: "Acesse arquivos e documentos compartilhados com você.",
            download: "Baixar",
            noDocs: "Nenhum documento disponível ainda.",
            errorDetails: "Não foi possível carregar o perfil do cliente.",
            upload: {
                button: "Enviar Documento",
                title: "Enviar Documento",
                description: "Envie arquivos relacionados aos seus projetos.",
                selectProject: "Selecione o Projeto (Opcional)",
                dragDrop: "Arraste e solte o arquivo aqui ou clique para buscar",
                uploading: "Enviando...",
                success: "Documento enviado com sucesso",
            },
        },
    },
    de: {
        settings: {
            title: "Einstellungen",
            description: "Verwalten Sie Ihre Kontoeinstellungen und -präferenzen.",
            profileInformation: "Profilinformationen",
            profileDescription: "Ihre persönlichen und geschäftlichen Details.",
            billingAddress: "Rechnungsadresse",
            billingDescription: "Für Rechnungen verwendete Adresse.",
            security: "Sicherheit",
            securityDescription: "Aktualisieren Sie Ihr Passwort, um Ihr Konto sicher zu halten.",
            saveChanges: "Änderungen speichern",
            saving: "Speichern...",
            billing: {
                sameAsMain: "Wie Hauptadresse",
                save: "Speichern",
                saving: "Speichern...",
            },
            securityForm: {
                newPassword: "Neues Passwort",
                newPasswordDesc: "Geben Sie Ihr neues Passwort ein.",
                confirmPassword: "Passwort bestätigen",
                updatePassword: "Passwort aktualisieren",
                passwordMismatch: "Passwörter stimmen nicht überein",
                passwordMinLength: "Passwort muss mindestens 6 Zeichen lang sein.",
                success: "Passwort erfolgreich aktualisiert",
            },
            form: {
                fullName: "Voller Name",
                email: "E-Mail",
                company: "Firma",
                phone: "Telefon",
                secondaryEmail: "Zweit-E-Mail",
                whatsapp: "WhatsApp-Nummer",
                street: "Straße / Nr.",
                city: "Stadt",
                zip: "Postleitzahl",
                country: "Land",
                preferences: "Präferenzen",
                language: "Bevorzugte Sprache",
                timezone: "Zeitzone",
                address: "Adresse",
            }
        },
        requests: {
            title: "Zugriffsanfragen",
            newRequest: "Neue Anfrage",
            noRequests: "Keine Anfragen gefunden.",
            createFirst: "Erstellen Sie Ihre erste Anfrage",
            view: "Ansehen",
            quote: "Angebot",
            priority: "Priorität",
            createdOn: "Erstellt am",
            cancelRequest: "Anfrage stornieren",
            description: "Beschreibung",
            quoteReceived: "Angebot erhalten",
            approveQuote: "Angebot annehmen",
            declineQuote: "Ablehnen",
            dialog: {
                title: "Neue Anfrage senden",
                description: "Beschreiben Sie Ihren Bedarf. Wir prüfen es und senden ein Angebot.",
                requestTitle: "Anfragetitel",
                details: "Details",
                cancel: "Abbrechen",
                submit: "Anfrage senden",
                success: "Anfrage erfolgreich gesendet!",
                error: "Fehler beim Senden der Anfrage.",
                priorityLow: "Niedrig",
                priorityMedium: "Mittel",
                priorityHigh: "Hoch",
                priorityPlaceholder: "Priorität wählen",
            },
            statusMap: {
                requested: "Angefragt",
                quoted: "Angeboten",
                active: "Aktiv",
                rejected: "Abgelehnt",
                completed: "Abgeschlossen",
                cancelled: "Storniert",
            },
        },
        auth: {
            title: "Willkommen in meinem Büro",
            subtitle: "Geben Sie Ihre Anmeldedaten ein, um auf Ihr Konto zuzugreifen",
            email: "E-Mail",
            password: "Passwort",
            login: "Anmelden",
            forgotPassword: "Passwort vergessen?",
            contactSupport: "Support kontaktieren",
            needHelp: "Brauchen Sie Hilfe?",
            footer: "Lopes2Tech. Alle Rechte vorbehalten.",
        },
        subscriptions: {
            title: "Meine Abonnements",
            subtitle: "Zeigen Sie Ihre aktiven wiederkehrenden Dienste und Zahlungsstatus an",
            noSubscriptions: "Keine Abonnements gefunden",
            noSubscriptionsDesc: "Sie haben noch keine aktiven Abonnements.",
            stripeLinked: "Mit Stripe verknüpft",
            paid: "Bezahlt",
            pastDue: "Überfällig",
            unpaid: "Nicht bezahlt",
            started: "Gestartet",
            ended: "Beendet",
            nextPayment: "Nächste Zahlung",
            lastPaid: "Letzte Zahlung",
            amountDue: "Fälliger Betrag",
            payNow: "Jetzt bezahlen",
            processing: "Wird verarbeitet...",
            viewInStripe: "In Stripe anzeigen",
            noDescription: "Keine Beschreibung",
            unknown: "Unbekannt",
            paymentLog: "Zahlungsprotokoll",
            payment: "Zahlung",
            recorded: "erfasst",
            noPaymentsYet: "Noch keine Zahlungen erfasst. Zahlungen werden hier nach der Verarbeitung angezeigt.",
        },
        dashboard: {
            welcome: "Willkommen zurück",
            activeProjects: "Aktive Projekte",
            pendingInvoices: "Offene Rechnungen",
            sharedDocuments: "Dokumente",
            totalProjects: "Projekte gesamt",
            pending: "ausstehend",
            filesAvailable: "Dateien verfügbar",
            quickActions: "Schnellaktionen",
            viewDocuments: "Dokumente ansehen",
            editProfile: "Profil bearbeiten",
            contactSupport: "Support kontaktieren",
            profile: "Profil",
            settings: "Einstellungen",
            signOut: "Abmelden",
            theme: {
                title: "Themenfarbe",
                horizon: "Tiefblau",
                sunset: "Sonnenuntergang",
                forest: "Wald",
                neutral: "Neutral",
            },
        },
        projects: {
            title: "Projekte",
            subtitle: "Verwalten und verfolgen Sie Ihre laufenden Projekte.",
            myProjects: "Meine Projekte",
            status: "Status",
            progress: "Fortschritt",
            due: "Fällig",
            viewDetails: "Details anzeigen",
            backToProjects: "Zurück zu Projekten",
            backToDashboard: "Zurück zum Dashboard",
            roadmap: "Projekt-Roadmap",
            projectBudget: "Projektbudget",
            totalInvoiced: "Gesamt in Rechnung gestellt",
            paidAmount: "Bezahlter Betrag",
            makePayment: "Zahlung tätigen",
            makeRequest: "Anfrage stellen",
            documents: "Dokumente",
            lastUpdated: "Zuletzt aktualisiert",
            overallCompletion: "Gesamtfortschritt",
            viewInvoices: "Rechnung ansehen",
            paidWatermark: "BEZAHLT",
            nextUp: "Nächster Schritt",
            statusMap: {
                active: "Aktiv",
                completed: "Abgeschlossen",
                pending: "Ausstehend",
                'on-hold': "Pausiert",
                'in-progress': "In Bearbeitung",
            }
        },
        invoices: {
            title: "Rechnungen",
            myInvoices: "Meine Rechnungen",
            paid: "Bezahlt",
            due: "Fällig",
            viewDetails: "Details anzeigen",
            download: "Herunterladen",
            invoice: "Rechnung",
            paidAmount: "Bezahlt",
            statusMap: {
                paid: "Bezahlt",
                pending: "Ausstehend",
                partial: "Teilweise",
                overdue: "Überfällig",
                draft: "Entwurf",
                cancelled: "Storniert",
            },
            details: {
                backToInvoices: "Zurück zu Rechnungen",
                from: "Von",
                billTo: "Rechnung an",
                issueDate: "Ausstellungsdatum",
                description: "Beschreibung",
                totalAmount: "Gesamtbetrag",
                paidToDate: "Bisher bezahlt",
                remainingDue: "Restbetrag",
                paymentSchedule: "Zahlungsplan (Raten)",
                installment: "Rate",
                amount: "Betrag",
                action: "Aktion",
                paymentHistory: "Zahlungshistorie",
                date: "Datum",
                method: "Methode",
                bankTransferDetails: "Bankverbindung",
                bank: "Bank",
                accountHolder: "Kontoinhaber",
                referenceNote: "Bitte verwenden Sie Rechnungsnummer {number} als Referenz.",
                questions: "Fragen zu dieser Rechnung?",
                helpText: "Wir sind hier, um zu helfen.",
                pay: "Bezahlen",
                pendingVerification: "Ausstehende Überprüfung",
            },
        },
        common: {
            loading: "Laden...",
            error: "Ein Fehler ist aufgetreten",
            noData: "Keine Daten gefunden",
        },
        sidebar: {
            dashboard: "Dashboard",
            projects: "Meine Projekte",
            requests: "Anfragen",
            documents: "Dokumente",
            invoices: "Rechnungen",
            subscriptions: "Abonnements",
        },
        documents: {
            title: "Dokumente",
            subtitle: "Greifen Sie auf Dateien und Dokumente zu, die mit Ihnen geteilt wurden.",
            download: "Herunterladen",
            noDocs: "Noch keine Dokumente verfügbar.",
            errorDetails: "Kundenprofil konnte nicht geladen werden.",
            upload: {
                button: "Dokument hochladen",
                title: "Dokument hochladen",
                description: "Laden Sie Dateien zu Ihren Projekten hoch.",
                selectProject: "Projekt auswählen (Optional)",
                dragDrop: "Datei hierher ziehen oder klicken zum Durchsuchen",
                uploading: "Lädt hoch...",
                success: "Dokument erfolgreich hochgeladen",
            },
        },
    },
};
