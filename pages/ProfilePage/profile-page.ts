import { expect, Page } from "@playwright/test";

export class ProfilePage {
  constructor(private page: Page) {}

  // locators
  private editButton() {
    return this.page.getByRole("button", { name: "แก้ไขข้อมูล" });
  }
  private saveButton() {
    return this.page.getByRole("button", { name: "บันทึกการเปลี่ยนแปลง" });
  }
  private currentPasswordInput() {
    return this.page.getByRole("textbox", {
      name: "กรอกรหัสผ่านปัจจุบันของคุณ",
    });
  }
  private newPasswordInput() {
    return this.page.getByRole("textbox", {
      name: "รหัสผ่านใหม่",
      exact: true,
    });
  }
  private confirmPasswordInput() {
    return this.page.getByRole("textbox", {
      name: "ยืนยันรหัสผ่านใหม่อีกครั้ง",
    });
  }

  // actions
  async goto() {
    await this.page.goto("/profile");
    await this.page.waitForLoadState("networkidle");
  }

  async openEditMode() {
    await this.editButton().click();
  }

  async changePassword(
    current: string,
    newPass: string,
    confirm: string,
  ): Promise<string> {
    await this.openEditMode();
    await this.currentPasswordInput().fill(current || "");
    await this.newPasswordInput().fill(newPass || "");
    await this.confirmPasswordInput().fill(confirm || "");

    let dialogMessage = "";

    this.page.once("dialog", async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.accept();
    });

    await this.saveButton().click({ force: true });
    await this.page.waitForTimeout(1000);

    if (dialogMessage) {
      return dialogMessage;
    }

    const validationError = await this.page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const invalidInput = inputs.find(
        (input) => input.validationMessage !== "",
      );
      return invalidInput ? invalidInput.validationMessage : null;
    });

    return validationError || "No Dialog or Validation found";
  }

  // assertions
  async expectSuccess(message: string) {
    expect(message).toContain("บันทึกข้อมูลสำเร็จ");
  }

  async expectError(message: string, expectedMessage: string) {
    expect(message).toContain(expectedMessage);
  }

  async expectInEditMode() {
    await expect(this.saveButton()).toBeVisible();
  }
}