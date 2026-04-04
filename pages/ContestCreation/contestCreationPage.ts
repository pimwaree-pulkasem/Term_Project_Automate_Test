import { Page, Locator } from '@playwright/test';

export class ContestPage {
  readonly page: Page;
  readonly createContestMenu: Locator;
  readonly contestListMenu: Locator;

  readonly contestNameInput: Locator;
  readonly contestDetailInput: Locator;
  readonly contestRulesInput: Locator;
  readonly endDateInput: Locator;
  readonly scoreWeightInput: Locator;

  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  readonly alertMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createContestMenu  = page.getByRole('menuitem', { name: 'สร้างการประกวด' });
    this.contestListMenu    = page.getByRole('menuitem', { name: 'งานประกวด' });

    this.contestNameInput   = page.getByLabel('ชื่อการประกวด');
    this.contestDetailInput = page.getByLabel('รายละเอียดการประกวด');
    this.contestRulesInput  = page.getByLabel('กติกา');
    this.endDateInput       = page.getByLabel('วันสิ้นสุด');
    this.scoreWeightInput   = page.getByLabel('เกณฑ์คะแนน');

    this.confirmButton      = page.getByRole('button', { name: 'ยืนยัน' });
    this.cancelButton       = page.getByRole('button', { name: /ยกเลิก|กลับ/ });

    this.alertMessage       = page.getByRole('alert');
  }

  async goToCreateContest() {
    await this.createContestMenu.click();
  }

  async fillContestForm(data: {
    name: string;
    detail: string;
    rules?: string;
    endDate: string;
    scoreWeight?: number;
  }) {
    await this.contestNameInput.fill(data.name);
    await this.contestDetailInput.fill(data.detail);
    if (data.rules !== undefined) {
      await this.contestRulesInput.fill(data.rules);
    }
    await this.endDateInput.fill(data.endDate);
    if (data.scoreWeight !== undefined) {
      await this.scoreWeightInput.fill(String(data.scoreWeight));
    }
  }

  async submit() {
    await this.confirmButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getAlertText(): Promise<string> {
    await this.alertMessage.waitFor({ state: 'visible' });
    return (await this.alertMessage.textContent()) ?? '';
  }

  async getContestStatus(contestName: string): Promise<string> {
    await this.contestListMenu.click();
    const card = this.page.getByText(contestName).locator('..');
    return (await card.getByTestId('contest-status').textContent()) ?? '';
  }
}
export class LoginPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async login(email: string, password: string) {
 
  }
}