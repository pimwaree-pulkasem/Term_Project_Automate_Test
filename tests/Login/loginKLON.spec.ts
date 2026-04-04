import { test, expect } from '@playwright/test';
import { LoginKLONPage } from '../../pages/Login/loginKLON-page';

const VALID_EMAIL     = 'exist@gmail.com';
const VALID_PASSWORD = '123456';

test.describe('Login Feature', () => {
  let loginKLONPage: LoginKLONPage;

  // beforeEach: ทำก่อนทุก Test — ไม่ต้องเขียน goto() ซ้ำในทุก test
  test.beforeEach(async ({ page }) => {
    loginKLONPage     = new LoginKLONPage(page);
    await loginKLONPage.goto();  // ทุก Test เริ่มที่หน้า Login
  });

    test.describe('Positive Cases', () => {
        test('TC-REG-020 | เข้าสู่ระบบสำเร็จด้วย exist@gmail.com', async ({ page }) => {
            await loginKLONPage.login(VALID_EMAIL, VALID_PASSWORD);
            await expect(page).toHaveURL('https://poetry-contest-platform.vercel.app/');
        });
    });

    test.describe('Negative Cases', () => {
        test('TC-REG-026 | เข้าสู่ระบบโดยไม่ใส่อีเมลและรหัสผ่าน — "กรุณากรอกอีเมลและรหัสผ่านให้ครบ"', async () => {
            await loginKLONPage.login('', '');
            await loginKLONPage.expectErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบ');
        });
    });
});