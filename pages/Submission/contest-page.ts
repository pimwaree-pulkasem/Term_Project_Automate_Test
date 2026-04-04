import { Page, expect } from "@playwright/test";

export class ContestPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto("/");
  }

  async goToContestPage() {
    await this.page.getByRole("link", { name: "การประกวด" }).click();
    await this.page.waitForURL("**/contests**");
  }

  // Auth 
  async login(email: string, password: string) {
    await this.page.getByRole("link", { name: "เข้าสู่ระบบ" }).click();
    await this.page.getByLabel("อีเมล").fill(email);
    await this.page.getByLabel("รหัสผ่าน").fill(password);
    await this.page.getByRole("button", { name: "เข้าสู่ระบบ" }).click();
    await this.page.waitForURL("**/");
  }

  //  Filter & Search 
  async filterByStatus(status: string) {
    await this.page.getByRole("combobox", { name: "สถานะ" }).selectOption(status);
  }

  async searchContest(keyword: string) {
    await this.page.getByPlaceholder("ค้นหาการประกวด").fill(keyword);
    await this.page.getByRole("button", { name: "ค้นหา" }).click();
  }

  async filterByTopicType(type: string) {
  await this.page
    .getByRole("combobox", { name: "รูปแบบหัวข้อ" })
    .selectOption(type);
  }

  async filterByPoemType(type: string) {
    await this.page
      .getByRole("combobox", { name: "ประเภทกลอน" })
      .selectOption(type);
  }

  // Contest Actions 
  async openContest(contestName: string) {
    await this.page.getByText(contestName).click();
    await this.page.waitForURL("**/contests/**");
  }

  async openSubmissionForm() {
    await this.page.getByRole("button", { name: "สมัครเข้าประกวดนี้" }).click();
  }

  // Assertions 
  async expectContestListVisible() {
    await expect(
      this.page.locator("[data-testid='contest-list']")
    ).toBeVisible();
  }

  async expectAllContestsHaveStatus(status: string) {
    const statusBadges = this.page.locator("[data-testid='contest-status']");
    const count = await statusBadges.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(statusBadges.nth(i)).toHaveText(status);
    }
  }

  async expectSearchResultVisible(keyword: string) {
    const results = this.page.locator("[data-testid='contest-card']");
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i)).toContainText(keyword);
    }
  }

  async expectContestDetailVisible() {
    await expect(
      this.page.locator("[data-testid='contest-detail']")
    ).toBeVisible();
    await expect(
      this.page.locator("[data-testid='contest-title']")
    ).toBeVisible();
    await expect(
      this.page.locator("[data-testid='contest-rules']")
    ).toBeVisible();
    await expect(
      this.page.locator("[data-testid='contest-schedule']")
    ).toBeVisible();
  }

  async expectContestVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}