# Task Progress: Restrict AI Assistant to ExplorePage Only

**Approved Plan Implementation:**

**✅ Step 1: Create TODO.md**
- [x] TODO.md created with breakdown of approved plan.

**⏳ Pending Steps:**

**Step 2: Edit src/main.jsx**
- [ ] Remove `<SupportChat />` component from UserDashboard return JSX (near end).
- Keep `<SupportChatbot ... />` only in ExplorePage (already user-role conditional).

**Step 3: Test changes**
- [ ] Run `npm run dev`
- [ ] Login as user@sisabisa.test / password123
- [ ] Verify AI chat appears ONLY on ExplorePage (/explore), NOT on UserDashboard.
- [ ] Check no console errors or visual breakage.

**Step 4: Complete task**
- [ ] Update TODO.md with completion status.
- [ ] Use attempt_completion.

**Notes:**
- User confirmed: "pokoknya dibagian explore produk aja" (only in explore products).
- No other pages have AI chat currently.
- ExplorePage already restricts to user role.

