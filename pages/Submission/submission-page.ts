import { expect, Page } from "@playwright/test";
import { LoginKLONPage } from "./login-klon-page";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  level: string;
  filePath: string;
};

type PoemInfo = {
  title: string;
  content: string;
};

export class SubmissionPage extends LoginKLONPage {
  constructor(page: Page) {
    super(page);
  }

// Properties (locators)
  private firstNameInput() {
    return this.page.getByLabel("ชื่อ");
  }
  private lastNameInput() {
    return this.page.getByLabel("นามสกุล");
  }
  private submitEmailInput() {
    return this.page.getByLabel("อีเมล");
  }
  private phoneInput() {
    return this.page.getByLabel("เบอร์โทรศัพท์");
  }
  private levelSelect() {
    return this.page.getByLabel("ระดับการแข่งขัน");
  }
  private fileInput() {
    return this.page.locator('input[type="file"]');
  }
  private nextButton() {
    return this.page.getByRole("button", { name: "ถัดไป" });
  }
  private titleInput() {
    return this.page.getByLabel("ชื่อผลงาน");
  }
  private poemContentInput() {
    return this.page.getByLabel("เนื้อหากลอน");
  }
  private confirmButton() {
    return this.page.getByRole("button", { name: "ยืนยัน" });
  }
  private successMessage() {
    return this.page.getByText("ส่งผลงานสำเร็จ");
  }
  private pendingStatus() {
    return this.page.getByText("รอการตรวจสอบ");
  }
  private duplicateErrorMessage() {
    return this.page.getByText(/มีผลงาน.*แล้ว/);
  }

// Actions
  async fillPersonalInfo(data: PersonalInfo) {
    await this.firstNameInput().fill(data.firstName);
    await this.lastNameInput().fill(data.lastName);
    await this.submitEmailInput().fill(data.email);
    await this.phoneInput().fill(data.phone);
    await this.levelSelect().selectOption({ label: data.level });
    await this.fileInput().setInputFiles(data.filePath);
  }

  async goNextFromPersonalInfo() {
    await this.nextButton().click();
    await this.page.waitForLoadState("networkidle");
    await this.titleInput().waitFor({ state: "visible" });
  }

  async fillPoemInfo(data: PoemInfo) {
    await this.titleInput().fill(data.title);
    await this.poemContentInput().fill(data.content);
  }

  async goNextFromPoemInfo() {
    await this.nextButton().click();
    await this.page.waitForLoadState("networkidle");
    await this.confirmButton().waitFor({ state: "visible" });
  }

  async confirmSubmission() {
    await this.confirmButton().click();
    await this.page.waitForLoadState("networkidle");
  }

// Assertions 
  async expectSubmitSuccess() {
    await expect(this.successMessage()).toBeVisible();
  }

  async expectPendingReviewStatus() {
    await expect(this.pendingStatus()).toBeVisible();
  }

  async expectDuplicateError(expectedMessage: string) {
    await this.duplicateErrorMessage().waitFor({ state: "visible" });
    const message = (await this.duplicateErrorMessage().textContent()) || "";
    expect(message).toContain(expectedMessage);
    await expect(this.confirmButton()).not.toBeVisible();
  }
}