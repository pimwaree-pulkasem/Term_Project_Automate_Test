import { Page, expect } from "@playwright/test";

type PersonalInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  level: string;
  filePath?: string;
};

type PoemInfo = {
  title: string;
  content: string;
};

export class SubmissionPage {
  constructor(private page: Page) {}

  // Navigation 
  async goToMySubmissions() {
    await this.page.locator("[data-testid='profile-avatar']").click();
    await this.page.getByRole("menuitem", { name: "ผลงานที่ส่งประกวด" }).click();
    await this.page.waitForURL("**/submissions**");
  }

  async openSubmission(title: string) {
    await this.page.getByText(title).click();
    await this.page.waitForURL("**/submissions/**");
  }

  // Form: Personal Info 
  async fillPersonalInfo(info: PersonalInfo) {
    if (info.firstName !== undefined) {
      await this.page.getByLabel("ชื่อ").fill(info.firstName);
    }
    if (info.lastName !== undefined) {
      await this.page.getByLabel("นามสกุล").fill(info.lastName);
    }
    if (info.email !== undefined) {
      await this.page.getByLabel("อีเมล").fill(info.email);
    }
    if (info.phone !== undefined) {
      await this.page.getByLabel("เบอร์โทรศัพท์").fill(info.phone);
    }
    if (info.level) {
      await this.page
        .getByRole("group", { name: "เลือกระดับการแข่งขัน" })
        .getByText(info.level)
        .click();
    }
    if (info.filePath) {
      await this.uploadFile(info.filePath);
    }
  }

  async goNextFromPersonalInfo() {
    await this.page.getByRole("button", { name: "ถัดไป" }).click();
  }

  // Form: Poem Info 
  async fillPoemInfo(info: PoemInfo) {
    if (info.title !== undefined) {
      await this.page.getByLabel("ชื่อผลงาน").fill(info.title);
    }
    if (info.content !== undefined) {
      await this.page.getByLabel("เนื้อหากลอน").fill(info.content);
    }
  }

  async goNextFromPoemInfo() {
    await this.page.getByRole("button", { name: "ถัดไป" }).click();
  }

  // Form: Confirm & Edit 
  async confirmSubmission() {
    await this.page.getByRole("button", { name: "ยืนยัน" }).click();
  }

  async clickEdit() {
    await this.page.getByRole("button", { name: "แก้ไข" }).click();
  }

  async confirmEdit() {
    await this.page.getByRole("button", { name: "ยืนยัน" }).click();
  }

  // File Upload 
  async uploadFile(filePath: string) {
    const fileInput = this.page.locator("input[type='file']");
    await fileInput.setInputFiles(filePath);
  }

  async removeUploadedFile() {
    await this.page.getByRole("button", { name: "ลบไฟล์" }).click();
  }

  // Cancel 
  async cancelSubmission() {
    await this.page.getByRole("button", { name: "ยกเลิกการสมัคร" }).click();
  }

  async confirmCancel() {
    await this.page
      .getByRole("dialog")
      .getByRole("button", { name: "ยืนยันการยกเลิก" })
      .click();
  }

  // Assertions: Success
  async expectSubmitSuccess() {
    await expect(
      this.page.getByText("ส่งผลงานสำเร็จ")
    ).toBeVisible();
  }

  async expectEditSuccess() {
    await expect(
      this.page.getByText("แก้ไขผลงานสำเร็จ")
    ).toBeVisible();
  }

  async expectPoemContentVisible(content: string) {
    await expect(this.page.getByText(content)).toBeVisible();
  }

  async expectCancelSuccess() {
    await expect(
      this.page.getByText("ยกเลิกการสมัครสำเร็จ")
    ).toBeVisible();
  }

  async expectFileUploaded(fileName: string) {
    await expect(
      this.page.getByText(fileName)
    ).toBeVisible();
  }

  async expectSubmissionProofVisible() {
    await expect(
      this.page.locator("[data-testid='submission-proof']")
    ).toBeVisible();
  }

  // Assertions: Status
  async expectPendingReviewStatus() {
    await expect(
      this.page.locator("[data-testid='submission-status']")
    ).toHaveText("รอการตรวจสอบ");
  }

  async expectStatus(status: string) {
    await expect(
      this.page.locator("[data-testid='submission-status']")
    ).toHaveText(status);
  }

  // Assertions: List 
  async expectMySubmissionsListVisible() {
    await expect(
      this.page.locator("[data-testid='my-submissions-list']")
    ).toBeVisible();
    const items = this.page.locator("[data-testid='submission-item']");
    await expect(items.first()).toBeVisible();
  }

  async expectSubmissionVisible(title: string) {
    await expect(
      this.page.getByTestId("my-submissions-list").getByText(title)
    ).toBeVisible();
  }

  async expectSubmissionNotInList(title: string) {
    await expect(
      this.page.getByTestId("my-submissions-list").getByText(title)
    ).not.toBeVisible();
  }

  async expectSubmissionFormVisible() {
    await expect(
      this.page.locator("[data-testid='submission-form']")
    ).toBeVisible();
    await expect(this.page.getByLabel("ชื่อ")).toBeVisible();
    await expect(this.page.getByLabel("นามสกุล")).toBeVisible();
    await expect(this.page.getByLabel("อีเมล")).toBeVisible();
    await expect(this.page.getByLabel("เบอร์โทรศัพท์")).toBeVisible();
  }

  async expectSubmissionFormTitle(title: string) {
    await expect(this.page.getByText(title)).toBeVisible();
  }

  // Assertions: Errors
  async expectFieldError(field: string, message: string) {
    await expect(
      this.page.locator(`[data-testid='error-${field}']`)
    ).toHaveText(message);
  }

  async expectDuplicateError(message: string) {
    await expect(
      this.page.locator("[data-testid='error-duplicate']")
    ).toHaveText(message);
  }

  async expectFileUploadError(message: string) {
    await expect(
      this.page.locator("[data-testid='error-file-upload']")
    ).toHaveText(message);
  }

  async expectRedirectToLogin() {
    await this.page.waitForURL("**/login**");
    await expect(
      this.page.locator("[data-testid='login-form']")
    ).toBeVisible();
  }
}