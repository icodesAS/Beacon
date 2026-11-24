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
