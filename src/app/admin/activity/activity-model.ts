import {
  BadgeCheck,
  ClipboardList,
  CreditCard,
  FileText,
  FolderKanban,
  KeyRound,
  Mail,
  ShieldCheck,
  Ticket,
  Upload,
  UserCog,
  UserPlus,
  UserRound,
} from "lucide-react";

export type ActivityLogRow = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: any;
  created_at: string;
  user_id: string | null;
  ip_address: string | null;
};

export type ProfileRow = {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
};

export type ActivityVM = {
  id: string;
  title: string;
  subtitle?: string;
  when: Date;
  actor: {
    name: string;
    isSystem: boolean;
    avatarUrl?: string | null;
  };
  icon: any;
  accentClass: string; // badge/bg color classes
  chips: Array<{ label: string }>;
  href?: string;
  raw: {
    action: string;
    entityType: string;
    entityId?: string | null;
    ip?: string | null;
    metadata?: any;
  };
};

function formatMoney(meta: any) {
  const currency = meta?.currency || "CHF";
  const amount = meta?.amount ?? meta?.total ?? meta?.value;
  if (amount === undefined || amount === null) return null;
  return `${currency} ${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function entityHref(entityType: string, entityId?: string | null) {
  if (!entityId) return undefined;
  switch (entityType) {
    case "invoice":
      return `/admin/invoices/${entityId}`;
    case "client":
      return `/admin/clients/${entityId}`;
    case "project":
      return `/admin/projects/${entityId}`;
    case "ticket":
      return `/admin/tickets?highlight=${entityId}`;
    default:
      return undefined;
  }
}

export function buildActivityVM(log: ActivityLogRow, profile?: ProfileRow | null): ActivityVM {
  const isSystem = !log.user_id;
  const actorName =
    profile?.full_name ||
    profile?.username ||
    (isSystem ? "System" : "Admin");

  const action = log.action;
  const meta = log.metadata || {};
  const entityType = log.entity_type;

  // Default presentation
  let title = action.replace(/_/g, " ");
  title = title.charAt(0).toUpperCase() + title.slice(1);
  let subtitle: string | undefined;
  let icon: any = ClipboardList;
  let accentClass = "bg-muted text-muted-foreground";

  // Rich mapping
  if (action === "create_invoice") {
    icon = FileText;
    accentClass = "bg-primary text-primary-foreground";
    const money = formatMoney(meta);
    title = money ? `Invoice created (${money})` : "Invoice created";
    subtitle = meta?.clientName ? `Client: ${meta.clientName}` : undefined;
  } else if (action === "update_invoice") {
    icon = FileText;
    accentClass = "bg-primary/10 text-primary border border-primary/20";
    title = "Invoice updated";
  } else if (action === "payment_received") {
    icon = CreditCard;
    accentClass = "bg-emerald-500/10 text-emerald-600 border border-emerald-200";
    const money = formatMoney(meta);
    title = money ? `Payment received (${money})` : "Payment received";
  } else if (action === "install_payment_verified") {
    icon = BadgeCheck;
    accentClass = "bg-emerald-500/10 text-emerald-600 border border-emerald-200";
    title = "Installment payment verified";
  } else if (action === "create_client") {
    icon = UserPlus;
    accentClass = "bg-sky-500/10 text-sky-600 border border-sky-200";
    title = meta?.name ? `Client created (${meta.name})` : "Client created";
  } else if (action === "update_client") {
    icon = UserCog;
    accentClass = "bg-sky-500/10 text-sky-600 border border-sky-200";
    title = meta?.name ? `Client updated (${meta.name})` : "Client updated";
  } else if (action === "create_project") {
    icon = FolderKanban;
    accentClass = "bg-violet-500/10 text-violet-600 border border-violet-200";
    title = meta?.name ? `Project created (${meta.name})` : "Project created";
  } else if (action === "update_project") {
    icon = FolderKanban;
    accentClass = "bg-violet-500/10 text-violet-600 border border-violet-200";
    title = "Project updated";
  } else if (action === "login") {
    icon = KeyRound;
    accentClass = "bg-amber-500/10 text-amber-700 border border-amber-200";
    title = "User logged in";
  } else if (action === "send_email" || action === "send_invoice") {
    icon = Mail;
    accentClass = "bg-blue-500/10 text-blue-600 border border-blue-200";
    title = "Email sent";
  } else if (action === "document_uploaded") {
    icon = Upload;
    accentClass = "bg-slate-500/10 text-slate-600 border border-slate-200";
    title = "Document uploaded";
  } else if (action === "create_ticket") {
    icon = Ticket;
    accentClass = "bg-cyan-500/10 text-cyan-700 border border-cyan-200";
    title = "Ticket created";
  } else if (action === "delete_ticket") {
    icon = ShieldCheck;
    accentClass = "bg-slate-500/10 text-slate-600 border border-slate-200";
    title = "Ticket deleted";
  } else if (entityType === "client") {
    icon = UserRound;
    accentClass = "bg-sky-500/10 text-sky-600 border border-sky-200";
  }

  const chips: Array<{ label: string }> = [];
  if (entityType) chips.push({ label: entityType.replace(/_/g, " ") });
  if (log.ip_address) chips.push({ label: log.ip_address });

  return {
    id: log.id,
    title,
    subtitle,
    when: new Date(log.created_at),
    actor: { name: actorName, isSystem, avatarUrl: profile?.avatar_url },
    icon,
    accentClass,
    chips,
    href: entityHref(entityType, log.entity_id),
    raw: {
      action,
      entityType,
      entityId: log.entity_id,
      ip: log.ip_address,
      metadata: meta,
    },
  };
}

