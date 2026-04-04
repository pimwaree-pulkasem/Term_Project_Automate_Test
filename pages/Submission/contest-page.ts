import { expect, Page } from "@playwright/test";
import { LoginKLONPage } from "./login-klon-page";

export class ContestPage extends LoginKLONPage {
  constructor(page: Page) {
    super(page);
  }

  // Properties (locators)
  private contestMenu() {
    return this.page.getByRole("link", { name: "การประกวด" });
  }

  private contestItem(contestName: string) {
    return this.page.getByText(contestName);
  }

  private submitContestButton() {
    return this.page.getByRole("button", { name: "สมัครเข้าประกวดนี้" });
  }

  //  Actions 
  async goToContestPage() {
    await this.contestMenu().click();
    await this.page.waitForLoadState("networkidle");
  }

  async openContest(contestName: string) {
    await this.contestItem(contestName).click();
    await this.page.waitForLoadState("networkidle");
  }

  async openSubmissionForm() {
    await this.submitContestButton().click();
    await this.page.waitForLoadState("networkidle");
  }

  // Assertions 
  async expectContestPageVisible() {
    await expect(this.contestMenu()).toBeVisible();
  }

  async expectContestVisible(contestName: string) {
    await expect(this.contestItem(contestName)).toBeVisible();
  }

  async expectSubmissionFormVisible() {
    await expect(this.submitContestButton()).toBeVisible();
  }
}