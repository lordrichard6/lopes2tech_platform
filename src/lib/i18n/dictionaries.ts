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
            minimal: string;
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
        tasks: string;
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
};

export const dictionaries: Record<Locale, Dictionary> = {
    en: {
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
                horizon: "Horizon (Default)",
                sunset: "Sunset",
                forest: "Forest",
                minimal: "Minimal",
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
            tasks: "Tasks",
            documents: "Documents",
            invoices: "Invoices",
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
                horizon: "Horizonte (Padrão)",
                sunset: "Pôr do Sol",
                forest: "Floresta",
                minimal: "Minimalista",
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
            tasks: "Tarefas",
            documents: "Documentos",
            invoices: "Faturas",
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
                horizon: "Horizont (Standard)",
                sunset: "Sonnenuntergang",
                forest: "Wald",
                minimal: "Minimalistisch",
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
            tasks: "Aufgaben",
            documents: "Dokumente",
            invoices: "Rechnungen",
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
