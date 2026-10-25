/* Shared test step: enter an inside postcode on the builder's opening screen,
   let the check pass, and come back to the opening screen, so a tool can run
   as it did before the gate. */
export async function passPostcode(p) {
  await p.fill('#pc', 'SW1A 1AA');
  await p.click('.dk-next', { force: true });
  await p.waitForFunction(() => /Due date/.test(document.querySelector('[data-step-name]').textContent), null, { timeout: 20000 });
  await p.waitForTimeout(900);
  await p.evaluate(() => document.querySelector('.dk-back').click());
  await p.waitForFunction(() => /Start/.test(document.querySelector('[data-step-name]').textContent), null, { timeout: 8000 });
  await p.waitForTimeout(900);
}
