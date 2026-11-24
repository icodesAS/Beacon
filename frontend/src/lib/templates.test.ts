import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { SOS_TEMPLATES } from "./templates.ts";

const EXPECTED_CATEGORIES = [
  "MEDICAL",
  "FIRE",
  "ACCIDENT",
  "HARASSMENT",
  "NATURAL_DISASTER",
  "THEFT",
  "OTHER",
] as const;

describe("SOS_TEMPLATES", () => {
  it("contains all 7 emergency categories", () => {
    const keys = Object.keys(SOS_TEMPLATES).sort();
    assert.deepEqual(keys, [...EXPECTED_CATEGORIES].sort());
  });

  it("provides 3 templates per category, each 5 to 150 characters long", () => {
    for (const category of EXPECTED_CATEGORIES) {
      const templates = SOS_TEMPLATES[category];
      assert.equal(
        templates.length,
        3,
        `${category} should have 3 templates`
      );
      for (const template of templates) {
        assert.ok(
          template.length >= 5 && template.length <= 150,
          `Template in ${category} has invalid length ${template.length}: "${template}"`
        );
      }
    }
  });
});
