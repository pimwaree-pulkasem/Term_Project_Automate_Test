import { test, expect } from '@playwright/test';
import { ContestPage } from '../../pages/ContestCreation/contestCreationPage';
import { LoginPage } from '../../pages/ContestCreation/contestCreationPage';

const OWNER_EMAIL    = process.env.OWNER_EMAIL    ?? 'owner@example.com';
const OWNER_PASSWORD = process.env.OWNER_PASSWORD ?? 'password';
const FUTURE_DATE = '2000-03-31';
const PAST_DATE   = '2000-01-01';

test.describe('Contest Creation Feature', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login(OWNER_EMAIL, OWNER_PASSWORD);
  });

  test.describe('Positive Cases', () => {
    
    test('Contest-Creation-TC-01 | ควรบันทึกข้อมูลสำเร็จเมื่อกรอกข้อมูลครบถ้วน', async ({ page }) => {
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026', detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: FUTURE_DATE, scoreWeight: 100,
      });
      await contestPage.submit();
      await expect(contestPage.alertMessage).not.toBeVisible();
    });

    test('Contest-Creation-TC-05 | แสดงสถานะ "สร้างสำเร็จ" หลังจากสร้างการประกวด', async ({ page }) => {
      const contestName = 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026';
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: contestName, detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: FUTURE_DATE, scoreWeight: 100,
      });
      await contestPage.submit();
      expect(await contestPage.getContestStatus(contestName)).toBe('สร้างสำเร็จ');
    });

    test('Contest-Creation-TC-06 | บันทึกและแสดงอักขระพิเศษ', async ({ page }) => {
      const specialRules = 'กติกา @#$^* ห้ามทำ';
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026', detail: 'รายละเอียด',
        rules: specialRules, endDate: FUTURE_DATE, scoreWeight: 100,
      });
      await contestPage.submit();
      await expect(contestPage.contestRulesInput).toHaveValue(specialRules);
    });

    test('Contest-Creation-TC-07 | ข้อมูลไม่ควรถูกบันทึกเมื่อกดยกเลิกกลางคัน', async ({ page }) => {
      const contestName = 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026';
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: contestName, detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: FUTURE_DATE, scoreWeight: 100
      });
      await contestPage.cancel();
      await contestPage.contestListMenu.click();
      await expect(page.getByText(contestName)).not.toBeVisible();
    });
  });

  test.describe('Negative Cases', () => {
    test('Contest-Creation-TC-02 | แจ้งเตือนเมื่อไม่กรอกรายละเอียดการประกวด', async ({ page }) => {
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({ 
        name: 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026', 
        detail: '', 
        endDate: FUTURE_DATE 
      });
      await contestPage.submit();
      expect(await contestPage.getAlertText()).toContain('กรุณากรอกรายละเอียดการประกวด');
    });

    test('Contest-Creation-TC-03 | แจ้งเตือนเมื่อไม่กรอกชื่อการประกวด', async ({ page }) => {
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: '', detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: FUTURE_DATE, scoreWeight: 100
      });
      await contestPage.submit();
      expect(await contestPage.getAlertText()).toContain('กรุณากรอกชื่อการประกวด');
    });

    test('Contest-Creation-TC-04 | แจ้งเตือนเมื่อระบุวันสิ้นสุดเป็นอดีต', async ({ page }) => {
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026', detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: PAST_DATE, scoreWeight: 100
      });
      await contestPage.submit();
      expect(await contestPage.getAlertText()).toContain('กำหนดการไม่ถูกต้อง');
    });

    test('Contest-Creation-TC-08 | แจ้งเตือนเมื่อเกณฑ์คะแนนรวมไม่ครบ 100%', async ({ page }) => {
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026', detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: FUTURE_DATE, scoreWeight: 80
      });
      await contestPage.submit();
      expect(await contestPage.getAlertText()).toMatch(/ปรับคะแนนให้ครบ|เกณฑ์คะแนนต้องครบ 100/);
    });

    test('Contest-Creation-TC-09 | ควรเด้งไปหน้า Login เมื่อ Session หมดอายุ', async ({ page }) => {
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2026', detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: FUTURE_DATE, scoreWeight: 100
      });
      await page.context().clearCookies(); 
      await contestPage.submit(); 
      await expect(page).toHaveURL(/login/);
    });

    test('Contest-Creation-TC-10 | แจ้งเตือนเมื่อสร้างการประกวดชื่อซ้ำ', async ({ page }) => {
      const contestPage = new ContestPage(page);
      await contestPage.goToCreateContest();
      await contestPage.fillContestForm({
        name: 'การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025', detail: 'รายละเอียด',
        rules: 'ห้ามใช้ AI', endDate: FUTURE_DATE, scoreWeight: 100
      });
      await contestPage.submit();
      expect(await contestPage.getAlertText()).toContain('ชื่อการประกวดนี้มีอยู่แล้ว');
    });
  });
});