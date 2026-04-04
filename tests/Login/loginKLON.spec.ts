import { test, expect } from '@playwright/test';
import { LoginKLONPage } from '../pages/loginKLON-page';

const VALID_EMAIL     = 'existuser@gmail.com';
const VALID_PASSWORD  = 'user01';

test.describe('Login Feature', () => {
  let loginKLONPage: LoginKLONPage;


  test.beforeEach(async ({ page }) => {
    loginKLONPage = new LoginKLONPage(page);
    await loginKLONPage.goto();  
  });

    test.describe('Positive Cases', () => {
        test('TC-LOG-01 | เข้าสู่ระบบสำเร็จด้วยอีเมลที่ถูกต้อง', async ({ page }) => {
            await loginKLONPage.login(VALID_EMAIL, VALID_PASSWORD);
            await expect(page).toHaveURL('https://poetry-contest-platform.vercel.app/');
        });

        test('TC-LOG-02 | เข้าสู่ระบบสำเร็จด้วยรหัสผ่านที่ถูกต้อง', async ({ page }) => {
            await loginKLONPage.login(VALID_EMAIL, VALID_PASSWORD);
            await expect(page).toHaveURL('https://poetry-contest-platform.vercel.app/');
        });
    });

    test.describe('Negative Cases', () => {
        test('TC-LOG-03 | เข้าสู่ระบบไม่สำเร็จด้วยอีเมลที่ไม่ถูกต้อง — "กรุณากรอกอีเมลให้ถูกต้อง"', async () => {
            await loginKLONPage.login('existusergmail.com', VALID_PASSWORD);
            await loginKLONPage.expectErrorMessage('กรุณากรอกอีเมลให้ถูกต้อง');
        });

        test('TC-LOG-04 | เข้าสู่ระบบไม่สำเร็จด้วยรหัสผ่านที่ไม่ถูกต้อง — "กรุณากรอกรหัสผ่านให้ถูกต้อง"', async () => {
            await loginKLONPage.login(VALID_EMAIL, 'user1');
            await loginKLONPage.expectErrorMessage('กรุณากรอกรหัสผ่านให้ถูกต้อง');
        });

        test('TC-LOG-07 | เข้าสู่ระบบโดยไม่ใส่อีเมลและรหัสผ่าน — "กรุณากรอกอีเมลและรหัสผ่านให้ครบ"', async () => {
            await loginKLONPage.login('', '');
            await loginKLONPage.expectErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ครบ');
        });

        test('TC-LOG-08 | เข้าสู่ระบบโดยใส่อีเมลและรหัสผ่านที่ไม่ถูกต้อง — "กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง"', async () => {
            await loginKLONPage.login('existusergmail.com', 'user1');
            await loginKLONPage.expectErrorMessage('กรุณากรอกอีเมลและรหัสผ่านให้ถูกต้อง');
        });

    });
});
