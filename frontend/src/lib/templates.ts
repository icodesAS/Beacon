import type { EmergencyCategory } from "@/types/alert";

export const SOS_TEMPLATES: Record<EmergencyCategory, ReadonlyArray<string>> = {
  MEDICAL: [
    "Medical emergency! I need urgent help right now. Please call me or come immediately.",
    "Severe dizziness and trouble breathing. Please send medical help to my location.",
    "Someone with me is injured and needs immediate medical attention.",
  ],
  FIRE: [
    "Fire emergency near me! Evacuating now, please call emergency services.",
    "Heavy smoke and possible fire in the building. Need immediate help.",
    "Gas leak or fire hazard detected at my location. Please check on me.",
  ],
  ACCIDENT: [
    "I've been in a road accident and need help right away. Please call me.",
    "Urgent accident nearby, I am hurt and need assistance getting help.",
    "Vehicle breakdown/accident on the road. Please reach out immediately.",
  ],
  HARASSMENT: [
    "I feel unsafe and am being harassed or followed. Please call me right now.",
    "Urgent threat nearby. Stay on the line with me or come to my location.",
    "Unsafe situation — please check on me immediately and stay reachable.",
  ],
  NATURAL_DISASTER: [
    "Severe flooding or storm at my location. Need urgent assistance.",
    "Earthquake/disaster impact nearby. I am trying to reach a safe spot.",
    "Power out and trapped by severe weather. Please contact help for me.",
  ],
  THEFT: [
    "Break-in or robbery just happened near me. Please call me and help.",
    "My belongings/phone were stolen or threatened. Need assistance right away.",
    "Suspicious intrusion at my place. Please check on me immediately.",
  ],
  OTHER: [
    "Urgent emergency — I need help right now. Please call me as soon as possible.",
    "Stranded and need immediate assistance at my current location.",
    "Please reach out right away, I am in an urgent situation.",
  ],
};
