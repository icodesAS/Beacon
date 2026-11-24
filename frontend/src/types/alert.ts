export type EmergencyCategory =
  | "MEDICAL"
  | "FIRE"
  | "ACCIDENT"
  | "HARASSMENT"
  | "NATURAL_DISASTER"
  | "THEFT"
  | "OTHER";

export type AlertStatus = "CREATED" | "SENT" | "RESOLVED" | "CANCELLED";

export interface CategoryMeta {
  value: EmergencyCategory;
  label: string;
  priority: 1 | 2 | 3 | 4;
  priorityLabel: "P1" | "P2" | "P3" | "P4";
  description: string;
  badgeVariant: "danger" | "warning" | "info" | "neutral";
  accentColor: string;
}

export const CATEGORY_LIST: ReadonlyArray<CategoryMeta> = [
  {
    value: "MEDICAL",
    label: "Medical",
    priority: 1,
    priorityLabel: "P1",
    description: "Severe injury, chest pain, breathing trouble, or medical crisis",
    badgeVariant: "danger",
    accentColor: "var(--sos)",
  },
  {
    value: "FIRE",
    label: "Fire",
    priority: 1,
    priorityLabel: "P1",
    description: "Active fire, heavy smoke, or gas leak nearby",
    badgeVariant: "danger",
    accentColor: "var(--sos)",
  },
  {
    value: "ACCIDENT",
    label: "Accident",
    priority: 2,
    priorityLabel: "P2",
    description: "Road collision, fall, or urgent physical accident",
    badgeVariant: "warning",
    accentColor: "var(--warning)",
  },
  {
    value: "HARASSMENT",
    label: "Harassment or Threat",
    priority: 2,
    priorityLabel: "P2",
    description: "Feeling unsafe, being followed, or facing a direct threat",
    badgeVariant: "warning",
    accentColor: "var(--warning)",
  },
  {
    value: "NATURAL_DISASTER",
    label: "Natural Disaster",
    priority: 2,
    priorityLabel: "P2",
    description: "Flooding, earthquake, storm damage, or evacuation need",
    badgeVariant: "warning",
    accentColor: "var(--warning)",
  },
  {
    value: "THEFT",
    label: "Theft or Robbery",
    priority: 3,
    priorityLabel: "P3",
    description: "Break-in, snatching, or stolen belongings",
    badgeVariant: "info",
    accentColor: "var(--info)",
  },
  {
    value: "OTHER",
    label: "Other",
    priority: 4,
    priorityLabel: "P4",
    description: "Any other urgent situation where you need help",
    badgeVariant: "neutral",
    accentColor: "var(--text-muted)",
  },
];

export interface AlertRecipient {
  id: number;
  contactName: string;
  contactPhone: string;
  contactRelation: string;
  contactRelationLabel: string;
  notifiedAt: string;
}

export interface Alert {
  id: number;
  category: EmergencyCategory;
  categoryLabel: string;
  priority: number;
  message: string;
  locationText: string | null;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  recipients: AlertRecipient[];
}

export interface CreateAlertPayload {
  category: EmergencyCategory;
  message: string;
  locationText?: string;
  force: boolean;
}

export type AlertSortOption = "newest" | "oldest" | "priority";

export interface AlertListParams {
  sort?: AlertSortOption;
  category?: EmergencyCategory | "";
  status?: AlertStatus | "";
  search?: string;
  page?: number;
  size?: number;
}

export interface PagedAlerts {
  items: Alert[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface LastAlertSummary {
  id: number;
  category: EmergencyCategory;
  categoryLabel: string;
  priority: number;
  status: AlertStatus;
  createdAt: string;
}

export interface CategoryCount {
  category: EmergencyCategory;
  label: string;
  count: number;
}

export interface StatusCount {
  status: AlertStatus;
  count: number;
}

export interface DailyCount {
  date: string;
  count: number;
}

export interface StatsSummary {
  totalAlerts: number;
  alertsThisMonth: number;
  contactCount: number;
  lastAlert: LastAlertSummary | null;
  byCategory: CategoryCount[];
  byStatus: StatusCount[];
  last30Days: DailyCount[];
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diffSeconds < 60) {
    return "Just now";
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}

export function getPriorityBadgeVariant(
  priority: number
): "danger" | "warning" | "info" | "neutral" {
  switch (priority) {
    case 1:
      return "danger";
    case 2:
      return "warning";
    case 3:
      return "info";
    default:
      return "neutral";
  }
}

export function getStatusBadgeVariant(
  status: AlertStatus
): "neutral" | "info" | "success" {
  switch (status) {
    case "SENT":
      return "info";
    case "RESOLVED":
      return "success";
    case "CREATED":
    case "CANCELLED":
    default:
      return "neutral";
  }
}

export function getCategoryMeta(category: EmergencyCategory): CategoryMeta {
  return (
    CATEGORY_LIST.find((item) => item.value === category) ??
    CATEGORY_LIST[CATEGORY_LIST.length - 1]
  );
}
