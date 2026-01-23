# Dialog Handling Attempts - Contact Form

## Problem
After clicking Submit button:
1. Form submits to server
2. Browser alert dialog appears ("Press OK to proceed!")
3. Need to click OK
4. Page reloads
5. Success message appears

## Root Issue
The `click()` call is BLOCKING and the dialog appears DURING the click, so we never reach the dialog handling code.

---

## Attempt 1: page.once() - FAILED
```typescript
this.page.once('dialog', async dialog => {
    await dialog.accept();
});
await this.submitButton.click();
```
**Problem**: Doesn't wait for the dialog or page reload. Test moves on too fast.

---

## Attempt 2: Promise.all with waitForEvent - FAILED
```typescript
const [dialog] = await Promise.all([
    this.page.waitForEvent('dialog'),
    this.submitButton.click()
]);
await dialog.accept();
```
**Problem**: Gets stuck at click() because the click is waiting for something before resolving.

---

## Attempt 3: Click then wait - FAILED
```typescript
await this.submitButton.click();
const dialog = await this.page.waitForEvent('dialog');
await dialog.accept();
```
**Problem**: Click never resolves because dialog is blocking it.

---

## Attempt 4: Promise before click - FAILED (CURRENT)
```typescript
const dialogPromise = this.page.waitForEvent('dialog');
await this.submitButton.click();
const dialog = await dialogPromise;
await dialog.accept();
```
**Problem**: Click is still blocking, never reaches the dialog await line.

---

## Attempt 5: Click without await - FAILED
```typescript
const dialogPromise = this.page.waitForEvent('dialog');
this.submitButton.click(); // NO AWAIT!
const dialog = await dialogPromise;
await dialog.accept();
```
**Problem**: Dialog doesn't appear. Click action needs to be awaited to actually execute.

---

## Attempt 6: page.on() with double wait - FAILED
```typescript
this.page.on('dialog', async dialog => {
    await dialog.accept();
});
await this.submitButton.click();
await this.page.waitForLoadState('domcontentloaded');
await this.page.waitForLoadState('networkidle');
```
**Problem**: Still had timing issues. Auto-accepting in background is hard to coordinate.

---

## Attempt 7: Separate explicit steps - FAILED
```typescript
// Method 1: Just click submit
async submitContactUsForm(): Promise<void> {
    await this.submitButton.click();
}

// Method 2: Wait for and accept dialog
async acceptConfirmationDialog(): Promise<void> {
    const dialog = await this.page.waitForEvent('dialog');
    await dialog.accept();
    await this.page.waitForLoadState('networkidle');
}
```

**Test usage:**
```typescript
await pages.contactUs.submitContactUsForm();
await pages.contactUs.acceptConfirmationDialog();
await pages.contactUs.assertSuccessMessage();
```

**Problem**: Dialog is triggered by client-side JS immediately on click, so the click blocks. The acceptConfirmationDialog() method is never reached.

---

## KEY INSIGHT
**Alert appears via JS with no network communication** - This means the dialog fires SYNCHRONOUSLY during the click, blocking it.

---

## Attempt 8: Promise.all with .then() - UNCLEAR RESULT

## Attempt 9: Sequential with dialogPromise - TESTING NOW
```typescript
async submitContactUsForm(): Promise<void> {
    await Promise.all([
        this.page.waitForEvent('dialog').then(dialog => dialog.accept()),
        this.submitButton.click()
    ]);
    await this.page.waitForLoadState('networkidle');
}
```

**Theory**:
- Promise.all starts both operations simultaneously
- waitForEvent starts listening BEFORE click executes
- Click triggers JS that shows dialog synchronously
- Dialog event fires and gets accepted via .then()
- Click completes after dialog is dismissed
- Then wait for page reload
- Using .then() instead of await inside the array prevents blocking

## Attempt 9: Sequential with dialogPromise - TESTING NOW
```typescript
async submitContactUsForm(): Promise<void> {
    // Set up dialog handler BEFORE clicking submit
    const dialogPromise = this.page.waitForEvent('dialog');

    await this.submitButton.click();

    // Wait for and accept the alert
    const dialog = await dialogPromise;
    await dialog.accept();

    // Wait for page to process the submission
    await this.page.waitForLoadState('networkidle');
}
```

**Theory**:
- Set up dialog listener BEFORE clicking (non-blocking)
- Click the button (even though it triggers sync alert, Playwright may handle it differently)
- After click completes (or resolves), wait for the dialog promise
- Accept the dialog
- Wait for page reload

**Difference from Attempt 4**:
- Maybe Playwright's click handling allows it to proceed even when alert appears?
- Or the click doesn't actually block in Playwright's implementation?
- User suggested this approach, so testing it
