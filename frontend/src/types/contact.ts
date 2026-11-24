export type Relation =
  | "PARENT"
  | "SIBLING"
  | "FRIEND"
  | "NEIGHBOR"
  | "DOCTOR"
  | "OTHER";

export const RELATION_OPTIONS: ReadonlyArray<{ value: Relation; label: string }> = [
  { value: "PARENT", label: "Parent" },
  { value: "SIBLING", label: "Sibling" },
  { value: "FRIEND", label: "Friend" },
  { value: "NEIGHBOR", label: "Neighbor" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "OTHER", label: "Other" },
];

export interface Contact {
  id: number;
  name: string;
  phone: string;
  relation: Relation;
  relationLabel: string;
  createdAt: string;
}

export interface ContactPayload {
  name: string;
  phone: string;
  relation: Relation;
}

export function formatIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
