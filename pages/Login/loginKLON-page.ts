import { Page, Locator, expect } from '@playwright/test';

    export class LoginKLONPage {
        readonly page: Page;

        // ── ① Properties: Locator ทั้งหมดของหน้า Login ──────
        readonly emailInput: Locator;    
        readonly passwordInput: Locator;
        readonly loginButton: Locator;
        readonly errorMessage: Locator;
        
        constructor(page: Page) {
        this.page = page;

        // ใช้ getByPlaceholder เพราะ input ไม่มี label ที่ชัดเจน
        this.emailInput    = page.getByPlaceholder('อีเมล');
        this.passwordInput    = page.getByPlaceholder('รหัสผ่าน');
        this.loginButton      = page.getByRole('button', { name: 'เข้าสู่ระบบ' });
        // ใช้ data-test attribute เพราะ dev ตั้งใจไว้สำหรับ Testing
        this.errorMessage     = page.locator('[data-test="error"]');
    }

    // ── ② Actions ────────────────────────────────────────
    async goto() {
        await this.page.goto('https://poetry-contest-platform.vercel.app/login'); 
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    // ── ③ Assertions ──────────────────────────────────────
    async expectErrorMessage(message: string) {
        await expect(this.errorMessage).toBeVisible();
        await expect(this.errorMessage).toContainText(message);
    }

    async expectLoginPageVisible() {
        await expect(this.loginButton).toBeVisible();
    }
}
