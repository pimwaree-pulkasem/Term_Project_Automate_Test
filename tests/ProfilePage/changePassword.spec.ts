import { test } from "@playwright/test";
import { ProfilePage } from "../../pages/ProfilePage/profile-page";

const VALID_PASSWORD = "123456";
const NEW_PASSWORD = "test1234";

test.describe.configure({ mode: 'serial' });
test.describe("Change Password Feature", () => {
  let profilePage: ProfilePage;

  test.beforeEach(async ({ page }) => {
    profilePage = new ProfilePage(page);
    await profilePage.goto();
  });

  test.describe("ทดสอบการตรวจสอบการเปลี่ยนรหัสผ่านของผู้ใช้", () => {

    test.describe("Positive Cases", () => {
      test("TC-GUEST-08 | ทดสอบการเปลี่ยนรหัสผ่านสำเร็จ", async () => {
        const msg = await profilePage.changePassword(VALID_PASSWORD, NEW_PASSWORD, NEW_PASSWORD);
        await profilePage.expectSuccess(msg);
      });
    });

    test.describe("Negative Cases", () => {
      test("TC-GUEST-09 | ทดสอบรหัสผ่านใหม่กับยืนยันรหัสผ่านใหม่ไม่ตรงกัน — แสดง error", async () => {
        const msg = await profilePage.changePassword(VALID_PASSWORD, "test123", NEW_PASSWORD);
        await profilePage.expectError(msg, "รหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      });

      test("TC-GUEST-10 | ทดสอบไม่กรอกรหัสผ่านปัจจุบัน — แสดง error", async () => {
        const msg = await profilePage.changePassword("", NEW_PASSWORD, NEW_PASSWORD);
        await profilePage.expectError(msg, "กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการเปลี่ยนรหัสผ่าน");
      });

      test("TC-GUEST-11 | ทดสอบไม่กรอกยืนยันรหัสผ่านใหม่ — แสดง error", async () => {
        const msg = await profilePage.changePassword(VALID_PASSWORD, NEW_PASSWORD, "");
        await profilePage.expectError(msg, "รหัสผ่านใหม่ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง");
      });

      test("TC-GUEST-12 | ทดสอบรหัสปัจจุบันผิด — แสดง error", async () => {
        const msg = await profilePage.changePassword("12345", NEW_PASSWORD, NEW_PASSWORD);
        await profilePage.expectError(msg, "รหัสผ่านไม่ถูกต้อง");
      });
    });
  });
});