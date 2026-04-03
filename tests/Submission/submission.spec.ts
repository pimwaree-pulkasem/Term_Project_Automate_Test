import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('https://poetry-contest-platform.vercel.app/');

  await page.getByLabel('อีเมล').fill('somchai.ruk@email.com');
  await page.getByLabel('รหัสผ่าน').fill('Password123!');
  await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();

  await page.waitForLoadState('networkidle');
});
 
// TC-05 ส่งผลงานสำเร็จ
test('TC-05 ส่งผลงานสำเร็จ', async ({ page }) => {
  // เข้าเมนูการประกวด
  await page.getByRole('link', { name: 'การประกวด' }).click();

  // เลือกการประกวด
  await page.getByText('การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025').click();

  // สมัครเข้าประกวด
  await page.getByRole('button', { name: 'สมัครเข้าประกวดนี้' }).click();

  // กรอกข้อมูล
  await page.getByLabel('ชื่อ').fill('สมชาย');
  await page.getByLabel('นามสกุล').fill('รักอักษร');
  await page.getByLabel('อีเมล').fill('somchai.ruk@email.com');
  await page.getByLabel('เบอร์โทรศัพท์').fill('0123456789');
  await page.getByLabel('ระดับการแข่งขัน').selectOption({ label: 'มัธยม' });

  // upload file
  await page.setInputFiles('input[type="file"]', 'tests/fixtures/sample.pdf');

  await page.getByRole('button', { name: 'ถัดไป' }).click();

  // กรอกผลงาน
  await page.getByLabel('ชื่อผลงาน').fill('กลอนวันภาษาไทย');
  await page.getByLabel('เนื้อหากลอน').fill(
    'แสงอรุณอุ่นฟ้าพาสดใส\nภาษาไทยงดงามตามวิถี\nสืบวัฒนธรรมค่าควรภักดี\nร่วมรักษาอย่างดีทุกเวลา'
  );

  await page.getByRole('button', { name: 'ถัดไป' }).click();

  await page.getByRole('button', { name: 'ยืนยัน' }).click();

  // ตรวจสอบผล
  await expect(page.getByText('ส่งผลงานสำเร็จ')).toBeVisible();
  await expect(page.getByText('รอการตรวจสอบ')).toBeVisible();
});

// TC-20 ส่งผลงานซ้ำ
test('TC-20 ส่งผลงานซ้ำในการประกวดเดิม', async ({ page }) => {
  await page.getByRole('link', { name: 'การประกวด' }).click();

  await page.getByText('การประกวดแต่งกลอนแปด ระดับประเทศ ประจำปี 2025').click();

  await page.getByRole('button', { name: 'สมัครเข้าประกวดนี้' }).click();

  await expect(page.getByText('มีผลงานในรายการนี้แล้ว')).toBeVisible();
  await expect(page.getByRole('button', { name: 'ยืนยัน' })).not.toBeVisible();
});