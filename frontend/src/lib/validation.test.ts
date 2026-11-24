import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  contactSchema,
  loginSchema,
  registerSchema,
  sosMessageSchema,
} from "./validation.ts";

describe("loginSchema", () => {
  it("accepts valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "  demo@beacon.local  ",
      password: "Password1",
    });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.email, "demo@beacon.local");
    }
  });

  it("rejects invalid email and empty password", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "",
    });
    assert.equal(result.success, false);
    if (!result.success) {
      const fields = result.error.issues.map((issue) => issue.path[0]);
      assert.ok(fields.includes("email"));
      assert.ok(fields.includes("password"));
    }
  });
});

describe("registerSchema", () => {
  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse({
      fullName: "Aarav Sharma",
      email: "aarav@example.com",
      password: "Password1",
      confirmPassword: "Password1",
    });
    assert.equal(result.success, true);
  });

  it("rejects short name, weak password, and mismatched confirmPassword", () => {
    const result = registerSchema.safeParse({
      fullName: "A",
      email: "bad-email",
      password: "short",
      confirmPassword: "different",
    });
    assert.equal(result.success, false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path[0]);
      assert.ok(paths.includes("fullName"));
      assert.ok(paths.includes("email"));
      assert.ok(paths.includes("password"));
      assert.ok(paths.includes("confirmPassword"));
    }
  });

  it("rejects password without a number", () => {
    const result = registerSchema.safeParse({
      fullName: "Aarav Sharma",
      email: "aarav@example.com",
      password: "OnlyLetters",
      confirmPassword: "OnlyLetters",
    });
    assert.equal(result.success, false);
  });
});

describe("contactSchema", () => {
  it("accepts valid Indian mobile number and relation", () => {
    const result = contactSchema.safeParse({
      name: "Priya Nair",
      phone: "9876543210",
      relation: "PARENT",
    });
    assert.equal(result.success, true);
  });

  it("rejects phone numbers not starting with 6-9 or wrong length", () => {
    const badStart = contactSchema.safeParse({
      name: "Priya Nair",
      phone: "5876543210",
      relation: "PARENT",
    });
    assert.equal(badStart.success, false);

    const shortPhone = contactSchema.safeParse({
      name: "Priya Nair",
      phone: "98765",
      relation: "FRIEND",
    });
    assert.equal(shortPhone.success, false);
  });

  it("rejects invalid relation", () => {
    const result = contactSchema.safeParse({
      name: "Priya Nair",
      phone: "9876543210",
      relation: "BOSS",
    });
    assert.equal(result.success, false);
  });
});

describe("sosMessageSchema", () => {
  it("accepts valid message and optional locationText", () => {
    const result = sosMessageSchema.safeParse({
      message: "Need urgent medical help near gate 2.",
      locationText: "Campus Gate 2",
    });
    assert.equal(result.success, true);
  });

  it("rejects messages shorter than 5 or longer than 300 characters", () => {
    const tooShort = sosMessageSchema.safeParse({
      message: "Help",
    });
    assert.equal(tooShort.success, false);

    const tooLong = sosMessageSchema.safeParse({
      message: "x".repeat(301),
    });
    assert.equal(tooLong.success, false);
  });

  it("rejects locationText longer than 100 characters", () => {
    const result = sosMessageSchema.safeParse({
      message: "Valid SOS message",
      locationText: "a".repeat(101),
    });
    assert.equal(result.success, false);
  });
});
