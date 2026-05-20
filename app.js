/* ============================================
   Bill Dealer - Application Logic v2
   Mobile-first, settled expenses, receipt scanner
   ============================================ */

// ─── State ───────────────────────────────────
const state = {
    members: [],
    expenses: [],       // { id, desc, amount, currency, payer, splitMethod, participants, customShares?, settled, date }
    baseCurrency: 'USD',
    lang: 'en',
    activeTab: 'expenses',
    expenseFilter: { payer: '', involved: '', period: '' }
};

// ─── Currency Data ───────────────────────────
const currencySymbols = {
    USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
    KRW: '₩', TWD: 'NT$', HKD: 'HK$', SGD: 'S$', THB: '฿',
    INR: '₹', AUD: 'A$', CAD: 'C$'
};

const currencyFlags = {
    USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', JPY: '🇯🇵', CNY: '🇨🇳',
    KRW: '🇰🇷', TWD: '🇹🇼', HKD: '🇭🇰', SGD: '🇸🇬', THB: '🇹🇭',
    INR: '🇮🇳', AUD: '🇦🇺', CAD: '🇨🇦'
};

// ─── Translations ────────────────────────────
const t = {
    en: {
        title: '🧾 Bill Dealer',
        subtitle: 'Smart bill splitting for groups & trips',
        settingsTab: 'Settings',
        expensesTab: 'Expenses',
        settleTab: 'Settle',
        settings: '⚙️ Trip Settings',
        baseCurrency: 'Base Currency',
        members: '👥 Members',
        addMember: '+ Add',
        memberPlaceholder: 'Member name',
        noMembers: 'No members added yet',
        addExpense: '💸 Add Expense',
        allExpenses: '📋 All Expenses',
        warningNoMembers: '⚠️ Please add members in Settings first',
        desc: 'Description',
        descPlaceholder: 'e.g., Dinner, Taxi, Hotel...',
        amount: 'Amount',
        currency: 'Currency',
        paidBy: 'Paid By',
        splitMethod: 'Split',
        equal: 'Equal',
        custom: 'Custom',
        splitAmong: 'Split Among',
        customAmounts: 'Custom Split Amounts',
        addExpenseBtn: '➕ Add Expense',
        noExpenses: 'No expenses yet — add one above!',
        settlement: '💰 Settlement Plan',
        noSettlement: 'No unsettled expenses yet',
        allSettled: '🎉 All settled! No debts.',
        footer: '💾 Data stored locally · Never uploaded',
        export: '📤',
        import: '📥',
        clear: '🗑',
        langSwitch: '中文',
        remaining: 'Remaining:',
        over: 'Over by:',
        pays: 'pays',
        to: 'to',
        delete: '×',
        confirmClear: 'Clear ALL data? This cannot be undone.',
        exported: 'Data exported!',
        imported: 'Data imported!',
        cleared: 'All data cleared.',
        memberAdded: 'Member added!',
        memberRemoved: 'Member removed.',
        expenseAdded: 'Expense added!',
        expenseDeleted: 'Expense deleted.',
        expenseSettled: 'Marked as settled ✓',
        expenseUnsettled: 'Marked as unsettled',
        selectPayer: '-- Select --',
        scanReceipt: '📸 Scan',
        receiptTitle: '📸 Receipt Scanner',
        receiptDesc: 'Take a photo of your receipt, then manually enter each item. More reliable than AI-only scanning.',
        uploadHint: 'Tap to take photo or upload',
        uploadFormat: 'JPG, PNG, HEIC · Auto-resized',
        retake: '↺ Retake',
        enterItems: '📝 Enter Items from Receipt',
        addItemRow: '+ Add Item',
        totalFromItems: 'Total from items:',
        addReceiptItems: '✅ Add All Items as Expenses',
        itemDesc: 'Item',
        itemAmount: 'Amount',
        receiptPaidBy: 'Paid By',
        selectMembers: 'Add members first',
        unsettled: 'unsettled',
        scan: '📸 Scan',
        settings: '⚙️ Settings',
    },
    zh: {
        title: '🧾 账单分摊',
        subtitle: '旅途多人多货币智能记账',
        settingsTab: '设置',
        expensesTab: '账单',
        settleTab: '结算',
        settings: '⚙️ 旅程设置',
        baseCurrency: '本币',
        members: '👥 成员',
        addMember: '+ 添加',
        memberPlaceholder: '成员名称',
        noMembers: '还没有添加成员',
        addExpense: '💸 快速记账',
        allExpenses: '📋 全部账单',
        warningNoMembers: '⚠️ 请先在设置中添加成员',
        desc: '描述',
        descPlaceholder: '例如：晚餐、出租车、酒店...',
        amount: '金额',
        currency: '货币',
        paidBy: '付款人',
        splitMethod: '分摊',
        equal: '均分',
        custom: '自定义',
        splitAmong: '分摊对象',
        customAmounts: '自定义分摊金额',
        addExpenseBtn: '➕ 添加账单',
        noExpenses: '还没有账单，记一笔吧',
        settlement: '💰 结算方案',
        noSettlement: '没有待结算的账单',
        allSettled: '🎉 已全部结清！没有欠款。',
        footer: '💾 数据存储在浏览器本地 · 不会上传到任何服务器',
        export: '📤',
        import: '📥',
        clear: '🗑',
        langSwitch: 'EN',
        remaining: '剩余：',
        over: '超出：',
        pays: '支付',
        to: '给',
        delete: '×',
        confirmClear: '确定要清空所有数据吗？此操作无法撤销。',
        exported: '数据已导出！',
        imported: '数据已导入！',
        cleared: '数据已清空。',
        memberAdded: '成员已添加！',
        memberRemoved: '成员已移除。',
        expenseAdded: '账单已添加！',
        expenseDeleted: '账单已删除。',
        expenseSettled: '已标记为结清 ✓',
        expenseUnsettled: '已取消结清标记',
        selectPayer: '-- 选择 --',
        scanReceipt: '📸 扫描',
        receiptTitle: '📸 收据扫描',
        receiptDesc: '拍摄收据照片，然后手动输入每项。比纯 AI 扫描更可靠。',
        uploadHint: '点击拍照或上传',
        uploadFormat: '支持 JPG、PNG、HEIC · 自动压缩',
        retake: '↺ 重拍',
        enterItems: '📝 输入收据项目',
        addItemRow: '+ 添加项目',
        totalFromItems: '项目合计：',
        addReceiptItems: '✅ 添加全部项目为账单',
        itemDesc: '项目',
        itemAmount: '金额',
        receiptPaidBy: '付款人',
        selectMembers: '请先添加成员',
        unsettled: '待结算',
        scan: '📸 扫描',
        settings: '⚙️ 设置',
    }
};

function _(key) {
    return t[state.lang][key] || t['en'][key] || key;
}

// ─── DOM ─────────────────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Persistence ─────────────────────────────
function saveState() {
    localStorage.setItem('bill-dealer-v2', JSON.stringify({
        members: state.members,
        expenses: state.expenses,
        baseCurrency: state.baseCurrency,
        lang: state.lang
    }));
}

function loadState() {
    // Try v2 first, then v1
    let raw = localStorage.getItem('bill-dealer-v2');
    if (!raw) raw = localStorage.getItem('bill-dealer-data');
    if (raw) {
        try {
            const data = JSON.parse(raw);
            state.members = data.members || [];
            state.expenses = (data.expenses || []).map(e => ({ ...e, settled: e.settled || false }));
            state.baseCurrency = data.baseCurrency || 'USD';
            state.lang = data.lang || 'en';
        } catch (e) { console.error('Parse error:', e); }
    }
}

// ─── Toast ───────────────────────────────────
let toastTimer;
function showToast(message, type = 'info') {
    const toast = $('#toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2000);
}

// ─── Helpers ─────────────────────────────────
function formatCurrency(amount, currency) {
    const sym = currencySymbols[currency] || '';
    if (currency === 'JPY' || currency === 'KRW') return `${sym}${Math.round(amount).toLocaleString()}`;
    return `${sym}${amount.toFixed(2)}`;
}

function getFlag(c) { return currencyFlags[c] || ''; }
function escapeHtml(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

const memberColors = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#06b6d4','#3b82f6'];
function getMemberColor(i) { return memberColors[i % memberColors.length]; }
function getMemberInitial(n) { return n.charAt(0).toUpperCase(); }

// ─── Tab Navigation ──────────────────────────
function switchTab(tabName) {
    state.activeTab = tabName;
    $$('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tabName));
    $$('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tabName}`));
}

$$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
});

// ─── Collapsible Cards ───────────────────────
document.addEventListener('click', (e) => {
    const header = e.target.closest('.card-header.collapsible');
    if (!header) return;
    const targetId = header.dataset.target;
    const body = document.getElementById(targetId);
    if (!body) return;
    const isHidden = body.classList.contains('hidden');
    body.classList.toggle('hidden');
    header.classList.toggle('collapsed', !isHidden);
});

// ─── Render All ──────────────────────────────
function renderAll() {
    customSplitNeedsRebuild = true;
    renderMembers();
    renderPayerSelect();
    renderParticipants();
    renderCustomSplit(true);
    populateFilters();
    renderExpenses();
    renderSettlement();
    updateCounts();
    updateExpenseFormState();
    saveState();
}

// ─── Members ─────────────────────────────────
function renderMembers() {
    const container = $('#membersList');
    if (state.members.length === 0) {
        container.innerHTML = `<p class="empty-hint">${_('noMembers')}</p>`;
        return;
    }
    container.innerHTML = state.members.map((m, i) => `
        <span class="member-tag">
            <span class="member-avatar" style="background:${getMemberColor(i)}">${getMemberInitial(m)}</span>
            ${escapeHtml(m)}
            <span class="remove-member" data-index="${i}">×</span>
        </span>
    `).join('');
}

$('#membersList').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-member')) {
        const idx = parseInt(e.target.dataset.index);
        const name = state.members[idx];
        state.expenses = state.expenses.filter(exp => {
            if (exp.payer === name) return false;
            exp.participants = exp.participants.filter(p => p !== name);
            if (exp.customShares) delete exp.customShares[name];
            return exp.participants.length > 0;
        });
        state.members.splice(idx, 1);
        renderAll();
        showToast(_('memberRemoved'), 'info');
    }
});

// ─── Payer Select ────────────────────────────
function renderPayerSelect() {
    const sel = $('#payerSelect');
    sel.innerHTML = `<option value="">${_('selectPayer')}</option>` +
        state.members.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');

    // Also update receipt payer select
    const rSel = $('#receiptPayerSelect');
    if (rSel) {
        rSel.innerHTML = `<option value="">${_('selectPayer')}</option>` +
            state.members.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    }
}

// ─── Participants ────────────────────────────
function renderParticipants() {
    const c = $('#participantsCheckboxes');
    if (state.members.length === 0) {
        c.innerHTML = `<p class="empty-hint">${_('selectMembers')}</p>`;
        return;
    }
    c.innerHTML = state.members.map((m, i) => `
        <label class="checkbox-tag checked" data-member="${escapeHtml(m)}">
            <input type="checkbox" value="${escapeHtml(m)}" checked>
            <span class="member-avatar" style="background:${getMemberColor(i)};width:22px;height:22px;font-size:0.65rem;">${getMemberInitial(m)}</span>
            ${escapeHtml(m)}
        </label>
    `).join('');

    c.querySelectorAll('.checkbox-tag').forEach(tag => {
        tag.addEventListener('click', function(e) {
            if (e.target.tagName === 'INPUT') return;
            const cb = this.querySelector('input');
            cb.checked = !cb.checked;
            this.classList.toggle('checked', cb.checked);
            if (getCurrentSplitMethod() === 'custom') {
                customSplitNeedsRebuild = true;
                renderCustomSplit(true);
            }
        });
        tag.querySelector('input').addEventListener('change', function() {
            tag.classList.toggle('checked', this.checked);
            if (getCurrentSplitMethod() === 'custom') {
                customSplitNeedsRebuild = true;
                renderCustomSplit(true);
            }
        });
    });
}

function getCheckedParticipants() {
    return Array.from($$('#participantsCheckboxes input[type="checkbox"]:checked')).map(cb => cb.value);
}

function getCurrentSplitMethod() {
    const active = $('.split-btn.active');
    return active ? active.dataset.method : 'equal';
}

// ─── Split Method Buttons ────────────────────
$$('.split-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        $$('.split-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateExpenseFormState();
    });
});

// ─── Custom Split ────────────────────────────
// Track whether custom split inputs need full re-render
let customSplitNeedsRebuild = true;

function renderCustomSplit(forceRebuild = false) {
    const container = $('#customSplitInputs');
    if (getCurrentSplitMethod() !== 'custom') return;

    // In custom mode, use all members (Split Among is hidden)
    const members = state.members;
    if (members.length === 0) { container.innerHTML = ''; return; }

    const totalAmount = parseFloat($('#expenseAmount').value) || 0;

    // Only rebuild DOM when participants change, not on amount change
    if (forceRebuild || customSplitNeedsRebuild) {
        // Save current values before rebuilding
        const oldValues = {};
        $$('.custom-split-input').forEach(inp => {
            oldValues[inp.dataset.member] = inp.value;
        });

        container.innerHTML = members.map(m => {
            const idx = state.members.indexOf(m);
            const savedVal = oldValues[m] || '';
            return `
                <div class="custom-split-row">
                    <span class="member-label">
                        <span class="member-avatar" style="background:${getMemberColor(idx)};width:22px;height:22px;font-size:0.65rem;">${getMemberInitial(m)}</span>
                        ${escapeHtml(m)}
                    </span>
                    <input type="number" class="custom-split-input" data-member="${escapeHtml(m)}"
                           placeholder="0.00" min="0" step="0.01" inputmode="decimal" value="${savedVal}">
                </div>`;
        }).join('');
        customSplitNeedsRebuild = false;
    }

    // Always update remaining display
    let sum = 0;
    $$('.custom-split-input').forEach(inp => sum += parseFloat(inp.value) || 0);
    updateCustomRemaining(totalAmount, sum);
}

$('#customSplitInputs').addEventListener('input', (e) => {
    if (e.target.classList.contains('custom-split-input')) {
        let sum = 0;
        $$('.custom-split-input').forEach(inp => sum += parseFloat(inp.value) || 0);
        updateCustomRemaining(parseFloat($('#expenseAmount').value) || 0, sum);
    }
});

$('#expenseAmount').addEventListener('input', () => {
    if (getCurrentSplitMethod() === 'custom') {
        // Just update remaining — don't rebuild inputs (preserves cursor)
        let sum = 0;
        $$('.custom-split-input').forEach(inp => sum += parseFloat(inp.value) || 0);
        updateCustomRemaining(parseFloat($('#expenseAmount').value) || 0, sum);
    }
});

function updateCustomRemaining(total, sum) {
    let el = $('#customSplitRemaining');
    if (!el) {
        el = document.createElement('div');
        el.id = 'customSplitRemaining';
        el.className = 'custom-split-remaining';
        $('#customSplitInputs').appendChild(el);
    }
    if (total <= 0) { el.textContent = ''; return; }
    const diff = total - sum;
    if (diff >= -0.005) {
        el.textContent = `${_('remaining')} ${formatCurrency(Math.max(0, diff), $('#expenseCurrency').value)}`;
        el.className = 'custom-split-remaining';
    } else {
        el.textContent = `${_('over')} ${formatCurrency(Math.abs(diff), $('#expenseCurrency').value)}`;
        el.className = 'custom-split-remaining over';
    }
}

// ─── Form State ──────────────────────────────
function updateExpenseFormState() {
    const hasMembers = state.members.length > 0;
    $('#noMembersWarning').classList.toggle('hidden', hasMembers);
    $('#addExpenseBtn').disabled = !hasMembers;

    const isCustom = getCurrentSplitMethod() === 'custom';

    // Hide "Split Among" when custom (custom inputs already list all members)
    $('#splitAmongGroup').classList.toggle('hidden', isCustom);

    $('#customSplitArea').classList.toggle('hidden', !isCustom);
    if (isCustom) {
        customSplitNeedsRebuild = true;
        renderCustomSplit(true);
    }
}

// ─── Expenses List ───────────────────────────
function renderExpenses() {
    const container = $('#expensesList');
    if (state.expenses.length === 0) {
        container.innerHTML = `<p class="empty-hint">${_('noExpenses')}</p>`;
        return;
    }

    // Apply filters
    const f = state.expenseFilter;
    const now = Date.now();
    const dayMs = 86400000;
    const filtered = state.expenses.filter(e => {
        if (f.payer && e.payer !== f.payer) return false;
        if (f.involved && !e.participants.includes(f.involved)) return false;
        if (f.period === 'today' && now - e.id > dayMs) return false;
        if (f.period === 'week' && now - e.id > 7 * dayMs) return false;
        if (f.period === 'month' && now - e.id > 30 * dayMs) return false;
        return true;
    });

    const hasFilter = f.payer || f.involved || f.period;

    let html = '';
    if (hasFilter) {
        html += `<div class="filter-count">Showing ${filtered.length} of ${state.expenses.length}</div>`;
    }

    if (filtered.length === 0) {
        html += `<p class="empty-hint">${hasFilter ? 'No matching expenses' : _('noExpenses')}</p>`;
    } else {
        html += filtered.map((e, i) => {
            const dateStr = new Date(e.id).toLocaleDateString();
            return `
        <div class="expense-item${e.settled ? ' settled' : ''}" data-index="${state.expenses.indexOf(e)}">
            <div class="settled-check">✓</div>
            <div class="settled-indicator"></div>
            <div class="expense-info">
                <div class="expense-desc">${escapeHtml(e.desc)}</div>
                <div class="expense-meta">
                    <span>👤 ${escapeHtml(e.payer)}</span>
                    <span>👥 ${e.participants.map(p => escapeHtml(p)).join(', ')}</span>
                    <span>📅 ${dateStr}</span>
                </div>
            </div>
            <span class="expense-amount">${getFlag(e.currency)} ${formatCurrency(e.amount, e.currency)}</span>
            <span class="delete-expense" data-index="${state.expenses.indexOf(e)}">×</span>
        </div>`;
        }).join('');
    }

    container.innerHTML = html;
}

// Toggle settled on expense click (but not on delete button)
$('#expensesList').addEventListener('click', (e) => {
    // Delete button
    if (e.target.classList.contains('delete-expense')) {
        e.stopPropagation();
        const idx = parseInt(e.target.dataset.index);
        state.expenses.splice(idx, 1);
        renderAll();
        showToast(_('expenseDeleted'), 'info');
        return;
    }

    // Toggle settled on the expense item
    const item = e.target.closest('.expense-item');
    if (!item) return;
    const idx = parseInt(item.dataset.index);
    state.expenses[idx].settled = !state.expenses[idx].settled;
    renderAll();
    showToast(state.expenses[idx].settled ? _('expenseSettled') : _('expenseUnsettled'), 'success');
});

// ─── Settlement ──────────────────────────────
function calculateSettlement() {
    const unsettled = state.expenses.filter(e => !e.settled);
    if (unsettled.length === 0) return { balances: {}, transactions: [], hasExpenses: state.expenses.length > 0 };

    const balances = {};
    state.members.forEach(m => { balances[m] = 0; });

    unsettled.forEach(exp => {
        const rate = getExchangeRate(exp.currency, state.baseCurrency);
        const amountBase = exp.amount * rate;
        balances[exp.payer] = (balances[exp.payer] || 0) + amountBase;

        let shares;
        if (exp.splitMethod === 'equal' || !exp.customShares) {
            const share = amountBase / exp.participants.length;
            shares = {};
            exp.participants.forEach(p => { shares[p] = share; });
        } else {
            let totalCustom = 0;
            Object.values(exp.customShares).forEach(v => totalCustom += v);
            const rate2 = totalCustom > 0 ? amountBase / totalCustom : 1;
            shares = {};
            Object.entries(exp.customShares).forEach(([p, v]) => { shares[p] = v * rate2; });
        }

        Object.entries(shares).forEach(([person, share]) => {
            balances[person] = (balances[person] || 0) - share;
        });
    });

    Object.keys(balances).forEach(m => { balances[m] = Math.round(balances[m] * 100) / 100; });

    const creditors = [], debtors = [];
    Object.entries(balances).forEach(([name, bal]) => {
        if (bal > 0.005) creditors.push({ name, amount: bal });
        else if (bal < -0.005) debtors.push({ name, amount: -bal });
    });
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    const transactions = [];
    let ci = 0, di = 0;
    while (ci < creditors.length && di < debtors.length) {
        const amt = Math.min(creditors[ci].amount, debtors[di].amount);
        if (amt > 0.005) {
            transactions.push({ from: debtors[di].name, to: creditors[ci].name, amount: Math.round(amt * 100) / 100 });
        }
        creditors[ci].amount -= amt;
        debtors[di].amount -= amt;
        if (creditors[ci].amount < 0.005) ci++;
        if (debtors[di].amount < 0.005) di++;
    }

    return { balances, transactions, hasExpenses: true };
}

const exchangeRates = {
    USD:1, EUR:0.92, GBP:0.79, JPY:149.5, CNY:7.24,
    KRW:1325, TWD:31.5, HKD:7.82, SGD:1.34, THB:35.5,
    INR:83.1, AUD:1.53, CAD:1.36
};

function getExchangeRate(from, to) {
    if (from === to) return 1;
    return (exchangeRates[to] || 1) / (exchangeRates[from] || 1);
}

function renderSettlement() {
    const container = $('#settlementContent');
    const result = calculateSettlement();

    if (!result.hasExpenses) {
        container.innerHTML = `<p class="empty-hint">${_('noSettlement')}</p>`;
        return;
    }

    const { balances, transactions } = result;

    if (Object.keys(balances).length === 0) {
        container.innerHTML = `<div class="no-settlement">${_('allSettled')}</div>`;
        return;
    }

    let html = '<div class="settlement-summary">';

    // Balance cards
    html += '<div class="balance-grid">';
    state.members.forEach((m, i) => {
        const bal = balances[m] || 0;
        const cls = bal > 0.005 ? 'positive' : (bal < -0.005 ? 'negative' : 'zero');
        const sign = bal > 0.005 ? '+' : '';
        html += `<div class="balance-card ${cls}">
            <div class="balance-name">
                <span class="member-avatar" style="background:${getMemberColor(i)};width:20px;height:20px;font-size:0.65rem;">${getMemberInitial(m)}</span>
                ${escapeHtml(m)}
            </div>
            <div class="balance-amount">${sign}${formatCurrency(bal, state.baseCurrency)}</div>
        </div>`;
    });
    html += '</div>';

    // Transactions
    if (transactions.length === 0) {
        html += `<div class="no-settlement">${_('allSettled')}</div>`;
    } else {
        html += '<div class="settlement-transactions"><h3>💱 ' + _('pays') + ' / ' + _('to') + '</h3>';
        transactions.forEach(tx => {
            html += `<div class="transaction-item">
                <span>${escapeHtml(tx.from)}</span>
                <span class="arrow">→</span>
                <span>${escapeHtml(tx.to)}</span>
                <span class="tx-amount">${formatCurrency(tx.amount, state.baseCurrency)}</span>
            </div>`;
        });
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

// ─── Counts ──────────────────────────────────
function updateCounts() {
    const total = state.expenses.length;
    const unsettled = state.expenses.filter(e => !e.settled).length;
    const ec = $('#expenseCount');
    const uc = $('#unsettledCount');
    if (ec) ec.textContent = total;
    if (uc) uc.textContent = unsettled + ' ' + _('unsettled');
}

// ─── Add Expense ─────────────────────────────
$('#addMemberBtn').addEventListener('click', () => {
    const input = $('#memberNameInput');
    const name = input.value.trim();
    if (!name) return;
    if (state.members.includes(name)) { showToast('Already exists!', 'error'); return; }
    state.members.push(name);
    input.value = '';
    renderAll();
    showToast(_('memberAdded'), 'success');
});

$('#memberNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); $('#addMemberBtn').click(); }
});

$('#expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const desc = $('#expenseDesc').value.trim();
    const amount = parseFloat($('#expenseAmount').value);
    const currency = $('#expenseCurrency').value;
    const payer = $('#payerSelect').value;
    const splitMethod = getCurrentSplitMethod();

    // In custom mode, all members are participants (Split Among is hidden)
    // In equal mode, use checked participants
    const participants = splitMethod === 'custom'
        ? [...state.members]
        : getCheckedParticipants();

    if (!desc) { showToast('Enter a description', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Enter a valid amount', 'error'); return; }
    if (!payer) { showToast('Select who paid', 'error'); return; }
    if (participants.length === 0) { showToast('Select participants', 'error'); return; }

    const expense = { id: Date.now(), desc, amount, currency, payer, splitMethod, participants, settled: false };

    if (splitMethod === 'custom') {
        const customShares = {};
        let totalCustom = 0;
        $$('.custom-split-input').forEach(inp => {
            const v = parseFloat(inp.value) || 0;
            customShares[inp.dataset.member] = v;
            totalCustom += v;
        });
        if (totalCustom <= 0) { showToast('Enter custom amounts', 'error'); return; }
        expense.customShares = customShares;
    }

    state.expenses.push(expense);
    $('#expenseDesc').value = '';
    $('#expenseAmount').value = '';
    $$('.split-btn').forEach(b => b.classList.remove('active'));
    $('.split-btn[data-method="equal"]').classList.add('active');

    renderAll();
    switchTab('expenses');
    showToast(_('expenseAdded'), 'success');
});

// ─── Export / Import / Clear ─────────────────
$('#exportBtn').addEventListener('click', () => {
    const data = { version: 2, exportedAt: new Date().toISOString(), members: state.members, expenses: state.expenses, baseCurrency: state.baseCurrency };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-dealer-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(_('exported'), 'success');
});

$('#importBtn').addEventListener('click', () => $('#importFileInput').click());

$('#importFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (!data.members) throw new Error('Invalid');
            state.members = data.members;
            state.expenses = (data.expenses || []).map(ex => ({ ...ex, settled: ex.settled || false }));
            state.baseCurrency = data.baseCurrency || 'USD';
            $('#baseCurrency').value = state.baseCurrency;
            renderAll();
            showToast(_('imported'), 'success');
        } catch (err) { showToast('Invalid file format', 'error'); }
    };
    reader.readAsText(file);
    e.target.value = '';
});

$('#clearBtn').addEventListener('click', () => {
    if (confirm(_('confirmClear'))) {
        state.members = [];
        state.expenses = [];
        state.baseCurrency = 'USD';
        $('#baseCurrency').value = 'USD';
        renderAll();
        showToast(_('cleared'), 'info');
    }
});

$('#baseCurrency').addEventListener('change', () => {
    state.baseCurrency = $('#baseCurrency').value;
    renderAll();
});

// ─── Language ────────────────────────────────
$('#langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'zh' : 'en';
    updateStaticText();
    renderAll();
});

function updateStaticText() {
    document.querySelector('.app-header h1').textContent = _('title');
    document.querySelector('.subtitle').textContent = _('subtitle');
    $('#langToggle').textContent = _('langSwitch');
    document.querySelector('.app-footer p').textContent = _('footer');

    // Tab buttons
    const tabs = $$('.tab-btn span');
    if (tabs[0]) tabs[0].textContent = _('settingsTab');
    if (tabs[1]) tabs[1].textContent = _('expensesTab');
    if (tabs[2]) tabs[2].textContent = _('settleTab');

    // Card titles — update only the .title-text span, preserving badges
    const titleSpans = $$('.title-text');
    titleSpans.forEach(span => {
        const text = span.textContent;
        if (text.includes('Settings') || text.includes('设置')) {
            span.textContent = _('settings');
        } else if (text.includes('Add') || text.includes('记账')) {
            span.textContent = _('addExpense');
        } else if (text.includes('All') || text.includes('全部')) {
            span.textContent = _('allExpenses');
        } else if (text.includes('Settlement') || text.includes('结算')) {
            span.textContent = _('settlement');
        }
    });

    $('#scanReceiptBtn').textContent = _('scanReceipt');
    $('#addExpenseBtn').textContent = _('addExpenseBtn');
    $('#addMemberBtn').textContent = _('addMember');
    $('#memberNameInput').placeholder = _('memberPlaceholder');
    $('#expenseDesc').placeholder = _('descPlaceholder');

    // Labels
    document.querySelector('label[for="baseCurrency"]').textContent = _('baseCurrency');
    document.querySelector('label[for="expenseDesc"]').textContent = _('desc');
    document.querySelector('label[for="expenseAmount"]').textContent = _('amount');
    document.querySelector('label[for="expenseCurrency"]').textContent = _('currency');
    document.querySelector('label[for="payerSelect"]').textContent = _('paidBy');

    // Split buttons
    const sbs = $$('.split-btn');
    if (sbs[0]) sbs[0].textContent = '＝ ' + _('equal');
    if (sbs[1]) sbs[1].textContent = '⚖ ' + _('custom');

    // Header action buttons
    $('#exportBtn').textContent = _('export');
    $('#importBtn').textContent = _('import');
    $('#clearBtn').textContent = _('clear');
}

// ─── Receipt Scanner (Tesseract OCR → Groq → OpenRouter → Manual) ──

const GROQ_KEY_STORAGE = 'bill-dealer-groq-key';
const OPENROUTER_KEY_STORAGE = 'bill-dealer-openrouter-key';

function getGroqApiKey() { return localStorage.getItem(GROQ_KEY_STORAGE) || ''; }
function getOpenRouterKey() { return localStorage.getItem(OPENROUTER_KEY_STORAGE) || ''; }
function saveGroqApiKey(k) { localStorage.setItem(GROQ_KEY_STORAGE, k.trim()); }
function saveOpenRouterKey(k) { localStorage.setItem(OPENROUTER_KEY_STORAGE, k.trim()); }

$('#scanReceiptBtn').addEventListener('click', openReceiptModal);
$('#closeReceiptModal').addEventListener('click', closeReceiptModal);
$('#receiptModal').addEventListener('click', (e) => { if (e.target === $('#receiptModal')) closeReceiptModal(); });

// Toggle API key visibility (works for both Groq & OpenRouter)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.toggle-key');
    if (!btn) return;
    const targetId = btn.dataset.target;
    const inp = document.getElementById(targetId);
    if (!inp) return;
    if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
    else { inp.type = 'password'; btn.textContent = '👁'; }
});

// Auto-save on input
$('#groqApiKey').addEventListener('input', () => saveGroqApiKey($('#groqApiKey').value));
$('#openrouterApiKey').addEventListener('input', () => saveOpenRouterKey($('#openrouterApiKey').value));

function openReceiptModal() {
    if (state.members.length === 0) { showToast(_('selectMembers'), 'error'); return; }
    $('#receiptModal').classList.remove('hidden');
    $('#groqApiKey').value = getGroqApiKey();
    $('#openrouterApiKey').value = getOpenRouterKey();
    resetReceiptModal();
    renderPayerSelect();
}

function closeReceiptModal() {
    $('#receiptModal').classList.add('hidden');
    resetReceiptModal();
}

let receiptImageDataUrl = null;

function resetReceiptModal() {
    $('#receiptPreview').src = '';
    $('#receiptPreviewWrapper').classList.add('hidden');
    const ph = $('#uploadArea').querySelector('.upload-placeholder');
    ph.classList.remove('hidden');
    ph.innerHTML = `
        <span class="upload-icon">📷</span>
        <p>Tap to take photo or upload</p>
        <p class="upload-hint">OCR reads text → AI structures it → add to bill</p>`;
    $('#scanActions').classList.add('hidden');
    $('#aiLoading').classList.add('hidden');
    $('#aiResult').classList.add('hidden');
    $('#aiResult').innerHTML = '';
    $('#manualEntrySection').classList.add('hidden');
    $('#receiptPayerArea').classList.add('hidden');
    $('#receiptImageInput').value = '';
    receiptImageDataUrl = null;
    clearManualItems();
}

// Upload
$('#uploadArea').addEventListener('dragover', (e) => { e.preventDefault(); $('#uploadArea').classList.add('dragover'); });
$('#uploadArea').addEventListener('dragleave', () => $('#uploadArea').classList.remove('dragover'));
$('#uploadArea').addEventListener('drop', (e) => {
    e.preventDefault();
    $('#uploadArea').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) processReceiptImage(file);
});
$('#receiptImageInput').addEventListener('change', (e) => {
    if (e.target.files[0]) processReceiptImage(e.target.files[0]);
});

function processReceiptImage(file) {
    $('#uploadArea').querySelector('.upload-placeholder').innerHTML = `
        <span class="upload-icon">⏳</span><p>Processing image...</p>`;
    const reader = new FileReader();
    reader.onerror = () => { showToast('Failed to read image file', 'error'); resetUploadPlaceholder(); };
    reader.onload = (ev) => {
        const img = new Image();
        img.onerror = () => { showToast('Failed to load image', 'error'); resetUploadPlaceholder(); };
        img.onload = () => {
            // Resize: upscale small images (min 800px), downscale large ones (max 1024px)
            const MIN_W = 800, MAX_W = 1024;
            let w = img.width, h = img.height;
            if (w > MAX_W) { h = h * (MAX_W / w); w = MAX_W; }
            else if (w < MIN_W) { h = h * (MIN_W / w); w = MIN_W; }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            receiptImageDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            $('#receiptPreview').src = receiptImageDataUrl;
            $('#receiptPreviewWrapper').classList.remove('hidden');
            $('#uploadArea').querySelector('.upload-placeholder').classList.add('hidden');
            $('#scanActions').classList.remove('hidden');
            $('#manualEntrySection').classList.add('hidden');
            $('#receiptPayerArea').classList.add('hidden');
            $('#aiResult').classList.add('hidden');
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
}

function resetUploadPlaceholder() {
    $('#uploadArea').querySelector('.upload-placeholder').innerHTML = `
        <span class="upload-icon">📷</span>
        <p>Tap to take photo or upload</p>
        <p class="upload-hint">OCR reads text → AI structures it → add to bill</p>`;
}

// ─── Scan button ──
$('#aiScanBtn2').addEventListener('click', () => {
    if (!receiptImageDataUrl) { showToast('Please upload a receipt image first', 'error'); return; }
    const groqKey = $('#groqApiKey').value.trim();
    const orKey = $('#openrouterApiKey').value.trim();
    if (groqKey) saveGroqApiKey(groqKey);
    if (orKey) saveOpenRouterKey(orKey);
    runReceiptScan(receiptImageDataUrl, groqKey, orKey);
});

$('#manualEntryBtn').addEventListener('click', () => {
    $('#scanActions').classList.add('hidden');
    $('#aiResult').classList.add('hidden');
    $('#manualEntrySection').classList.remove('hidden');
    $('#receiptPayerArea').classList.remove('hidden');
    initManualItems();
});

$('#retakePhotoBtn').addEventListener('click', () => {
    $('#receiptPreview').src = '';
    $('#receiptPreviewWrapper').classList.add('hidden');
    $('#uploadArea').querySelector('.upload-placeholder').classList.remove('hidden');
    $('#scanActions').classList.add('hidden');
    $('#aiLoading').classList.add('hidden');
    $('#aiResult').classList.add('hidden');
    $('#manualEntrySection').classList.add('hidden');
    $('#receiptPayerArea').classList.add('hidden');
    $('#receiptImageInput').value = '';
    receiptImageDataUrl = null;
    clearManualItems();
});

// ─── Pipeline: OCR → Server(Groq→OR) | OCR → Local Groq | OCR → Local OR | Manual ──

async function runReceiptScan(imageDataUrl, groqKey, openRouterKey) {
    $('#scanActions').classList.add('hidden');
    $('#aiLoading').classList.remove('hidden');
    $('#aiResult').classList.add('hidden');
    $('#manualEntrySection').classList.add('hidden');
    const lt = $('#aiLoading p');

    // Step 0: Tesseract OCR
    lt.textContent = '🔍 OCR: Reading text from image...';
    let ocrText;
    try {
        ocrText = await runTesseractOCR(imageDataUrl);
        if (!ocrText || !ocrText.trim()) throw new Error('No text detected');
        console.log('[ReceiptScan] OCR:', ocrText.slice(0, 200));
    } catch (err) {
        console.warn('[ReceiptScan] OCR failed:', err.message);
        $('#aiLoading').classList.add('hidden');
        showToast('OCR could not read the image — enter manually', 'info');
        $('#manualEntrySection').classList.remove('hidden');
        $('#receiptPayerArea').classList.remove('hidden');
        initManualItems();
        return;
    }

    // Tier 1: Server proxy (Groq → OpenRouter)
    lt.textContent = '🤖 Tier 1: Server AI (Groq → OpenRouter)...';
    const serverResult = await tryServerScan(ocrText);
    if (serverResult) { displayScanResult(serverResult); return; }

    // Tier 2: Local Groq key
    if (groqKey) {
        lt.textContent = '🤖 Tier 2: Your Groq key (llama 3.1 8B)...';
        const groqResult = await tryGroqScan(ocrText, groqKey);
        if (groqResult) { displayScanResult(groqResult); return; }
    }

    // Tier 3: Local OpenRouter key
    if (openRouterKey) {
        lt.textContent = '🤖 Tier 3: OpenRouter (free Llama 3.2)...';
        const orResult = await tryOpenRouterScan(ocrText, openRouterKey);
        if (orResult) { displayScanResult(orResult); return; }
    }

    // Tier 4: Manual
    $('#aiLoading').classList.add('hidden');
    showToast('All AI tiers unavailable — enter manually', 'info');
    $('#manualEntrySection').classList.remove('hidden');
    $('#receiptPayerArea').classList.remove('hidden');
    initManualItems();
}

// ─── Tesseract.js OCR ───

async function runTesseractOCR(imageDataUrl) {
    const worker = await Tesseract.createWorker('eng+chi_sim', 1, {
        logger: (m) => {
            if (m.status === 'recognizing text') {
                const pct = Math.round(m.progress * 100);
                const lt = $('#aiLoading p');
                if (lt) lt.textContent = `🔍 OCR: Reading text... ${pct}%`;
            }
        }
    });
    try { const { data: { text } } = await worker.recognize(imageDataUrl); return text; }
    finally { await worker.terminate(); }
}

// ─── Shared: call OpenAI-compatible chat API ───

const RECEIPT_SYSTEM = `Extract receipt data from OCR text into JSON.

RULES:
- Items: extract only lines that have a price number. Skip sub-description lines without prices (e.g. "Sprite" under a main item).
- Merge multi-line names (e.g. "K3 Cheese" then "Ramyeon" → "Cheese Ramyeon").
- Totals: copy the EXACT number after SUBTOTAL, TAX, SERVICE CHARGE, GRANDTOTAL labels. Never calculate.
- isTaxInclusive: false if service charge or tax is listed separately.`;

async function callChatAPI(url, apiKey, model, ocrText, extraHeaders = {}) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, ...extraHeaders },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: RECEIPT_SYSTEM },
                { role: 'user', content: `OCR Text:\n${ocrText}\n\nExtract the REAL values from the text above. Do NOT copy the example zeros — use the actual numbers found in the OCR. Return JSON in this shape: ${'{"isTaxInclusive":false,"subtotal":0,"tax":0,"serviceCharge":0,"grandTotal":0,"items":[{"name":"EXAMPLE","price":0}]}'}` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_tokens: 1024,
        }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    // Normalize: flatten nested totals if AI returns them
    if (parsed.totals && !parsed.subtotal) {
        parsed.subtotal = parsed.totals.subtotal;
        parsed.tax = parsed.totals.tax;
        parsed.serviceCharge = parsed.totals.serviceCharge;
        parsed.grandTotal = parsed.totals.grandTotal;
        delete parsed.totals;
    }
    return parsed;
}

// ─── Tier 1: Server proxy ───

async function tryServerScan(ocrText) {
    try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 15000);
        const res = await fetch('/api/split-receipt', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: ocrText }), signal: c.signal
        });
        clearTimeout(t);
        if (!res.ok) { console.warn('[ReceiptScan] Server failed:', res.status); return null; }
        const result = await res.json();
        if (!result.items?.length) { console.warn('[ReceiptScan] Server: no items'); return null; }
        console.log('[ReceiptScan] Tier 1 SUCCESS — server');
        return result;
    } catch (err) { console.warn('[ReceiptScan] Tier 1 error:', err.message); return null; }
}

// ─── Tier 2: Local Groq ───

async function tryGroqScan(ocrText, apiKey) {
    try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 15000);
        const result = await callChatAPI('https://api.groq.com/openai/v1/chat/completions', apiKey, 'llama-3.1-8b-instant', ocrText);
        clearTimeout(t);
        if (!result?.items?.length) return null;
        console.log('[ReceiptScan] Tier 2 SUCCESS — Groq');
        return result;
    } catch (err) { console.warn('[ReceiptScan] Tier 2 error:', err.message); return null; }
}

// ─── Tier 3: Local OpenRouter ───

async function tryOpenRouterScan(ocrText, apiKey) {
    try {
        const c = new AbortController();
        const t = setTimeout(() => c.abort(), 15000);
        const result = await callChatAPI('https://openrouter.ai/api/v1/chat/completions', apiKey, 'meta-llama/llama-3.2-3b-instruct:free', ocrText, {
            'HTTP-Referer': window.location.origin,
            'X-Title': 'Bill Dealer',
        });
        clearTimeout(t);
        if (!result?.items?.length) return null;
        console.log('[ReceiptScan] Tier 3 SUCCESS — OpenRouter');
        return result;
    } catch (err) { console.warn('[ReceiptScan] Tier 3 error:', err.message); return null; }
}

// ─── Display scan result ───

function displayScanResult(result) {
    $('#aiLoading').classList.add('hidden');

    const items = (result.items || []).map(it => ({
        desc: it.name || it.desc || 'Item',
        amount: it.price || it.amount || 0
    }));

    const meta = {
        subtotal: result.subtotal || 0,
        tax: result.tax || 0,
        serviceCharge: result.serviceCharge || 0,
        grandTotal: result.grandTotal || 0,
        isTaxInclusive: result.isTaxInclusive || false
    };

    displayAiResults(items, meta);
}

function displayAiResults(items, receiptMeta = null) {
    const container = $('#aiResult');
    const sum = items.reduce((s, i) => s + (i.amount || 0), 0);

    // Store original receipt meta for proportional recalc
    const orig = receiptMeta ? { ...receiptMeta, origSubtotal: receiptMeta.subtotal || sum } : null;

    let html = '<h4>🤖 AI Extracted Items (edit if needed)</h4>';

    items.forEach((item, idx) => {
        const memberOpts = `<option value="all">👥 All (split equally)</option>` +
            state.members.map(m => `<option value="${escapeHtml(m)}">👤 ${escapeHtml(m)}</option>`).join('');
        html += `
            <div class="ai-result-item" data-index="${idx}">
                <input type="text" class="text-input ai-edit-desc" value="${escapeHtml(item.desc)}" style="flex:2;padding:6px 8px;font-size:0.82rem;">
                <input type="number" class="text-input ai-edit-amount" value="${item.amount}" step="0.01" style="flex:1;padding:6px 8px;font-size:0.82rem;text-align:right;">
                <span class="ai-item-del" data-index="${idx}">×</span>
                <select class="ai-item-assign">${memberOpts}</select>
            </div>`;
    });

    if (receiptMeta && (receiptMeta.subtotal || receiptMeta.grandTotal)) {
        html += '<div class="ai-breakdown" id="aiBreakdown">';
        if (receiptMeta.subtotal) {
            html += `<div class="ai-breakdown-row"><span>Subtotal</span><span id="aiSubtotal">${formatCurrency(receiptMeta.subtotal, state.baseCurrency)}</span></div>`;
        }
        if (receiptMeta.tax) {
            html += `<div class="ai-breakdown-row"><span>Tax / SST</span><span id="aiTax">${formatCurrency(receiptMeta.tax, state.baseCurrency)}</span></div>`;
        }
        if (receiptMeta.serviceCharge) {
            html += `<div class="ai-breakdown-row"><span>Service Charge</span><span id="aiService">${formatCurrency(receiptMeta.serviceCharge, state.baseCurrency)}</span></div>`;
        }
        html += `<div class="ai-breakdown-row" style="font-weight:700;border-top:1px solid var(--border);padding-top:6px;"><span>Grand Total</span><span id="aiGrandTotal">${formatCurrency(receiptMeta.grandTotal || sum, state.baseCurrency)}</span></div>`;
        if (receiptMeta.isTaxInclusive) {
            html += '<div class="ai-breakdown-note">📌 Tax is included in item prices</div>';
        }
        html += '</div>';
    }

    html += `
        <div class="ai-result-total">
            <span>Items Sum</span>
            <strong id="aiResultTotal">${formatCurrency(sum, state.baseCurrency)}</strong>
        </div>`;

    container.innerHTML = html;
    container.classList.remove('hidden');
    $('#receiptPayerArea').classList.remove('hidden');

    container._aiItems = items;
    container._receiptMeta = orig;

    function refreshAll() {
        let t = 0;
        container.querySelectorAll('.ai-edit-amount').forEach(i => t += parseFloat(i.value) || 0);
        const totalEl = $('#aiResultTotal');
        if (totalEl) totalEl.textContent = formatCurrency(t, state.baseCurrency);

        // Recalc breakdown proportionally
        if (container._receiptMeta) {
            const m = container._receiptMeta;
            const originalSum = m.origSubtotal || 1;
            const ratio = t / originalSum;
            const newSub = $('#aiSubtotal'); if (newSub) newSub.textContent = formatCurrency(t, state.baseCurrency);
            const newTax = $('#aiTax'); if (newTax) newTax.textContent = formatCurrency(m.tax * ratio, state.baseCurrency);
            const newSvc = $('#aiService'); if (newSvc) newSvc.textContent = formatCurrency(m.serviceCharge * ratio, state.baseCurrency);
            const newGt = $('#aiGrandTotal');
            if (newGt) newGt.textContent = formatCurrency(t + (m.tax || 0) * ratio + (m.serviceCharge || 0) * ratio, state.baseCurrency);
        }
    }

    container.querySelectorAll('.ai-edit-amount').forEach(inp => {
        inp.addEventListener('input', refreshAll);
    });

    container.querySelectorAll('.ai-item-del').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.ai-result-item').remove();
            refreshAll();
            if (container.querySelectorAll('.ai-result-item').length === 0) {
                container.classList.add('hidden');
                $('#receiptPayerArea').classList.add('hidden');
            }
        });
    });
}

// ─── Add AI items as expenses ────────────────

function getAiEditedItems() {
    const items = [];
    $$('#aiResult .ai-result-item').forEach(row => {
        const desc = row.querySelector('.ai-edit-desc').value.trim();
        const amount = parseFloat(row.querySelector('.ai-edit-amount').value);
        const assign = row.querySelector('.ai-item-assign')?.value || 'all';
        if (desc && amount > 0) items.push({ desc, amount, assign });
    });
    return items;
}

$('#addReceiptItemsBtn').addEventListener('click', () => {
    const payer = $('#receiptPayerSelect').value;
    if (!payer) { showToast('Select who paid', 'error'); return; }

    let items = getAiEditedItems();
    if (items.length === 0) {
        $$('.manual-item-row').forEach(row => {
            const desc = row.querySelector('.manual-desc').value.trim();
            const amount = parseFloat(row.querySelector('.manual-amount').value);
            if (desc && amount > 0) items.push({ desc, amount, assign: 'all' });
        });
    }

    if (items.length === 0) { showToast('Enter at least one item', 'error'); return; }

    items.forEach(item => {
        // Per-item assignment: individual person vs all members
        const participants = item.assign && item.assign !== 'all'
            ? [item.assign]
            : [...state.members];
        state.expenses.push({
            id: Date.now() + Math.random(),
            desc: item.desc,
            amount: item.amount,
            currency: state.baseCurrency,
            payer,
            splitMethod: 'equal',
            participants,
            settled: false
        });
    });

    closeReceiptModal();
    renderAll();
    switchTab('expenses');
    showToast(`Added ${items.length} items!`, 'success');
});

// ─── Manual item entry (Tier 3 fallback) ────

function initManualItems() {
    clearManualItems();
    addManualItemRow();
    addManualItemRow();
    addManualItemRow();
}

function clearManualItems() {
    $('#manualItems').innerHTML = '';
    updateManualTotal();
}

function addManualItemRow() {
    const row = document.createElement('div');
    row.className = 'manual-item-row';
    row.innerHTML = `
        <input type="text" class="text-input manual-desc" placeholder="${_('itemDesc')}" autocomplete="off">
        <input type="number" class="text-input amount-input manual-amount" placeholder="0.00" min="0" step="0.01" inputmode="decimal">
        <button type="button" class="remove-item-btn">×</button>
    `;
    row.querySelector('.remove-item-btn').addEventListener('click', () => {
        row.remove();
        updateManualTotal();
        if ($('#manualItems').children.length === 0) addManualItemRow();
    });
    row.querySelector('.manual-amount').addEventListener('input', updateManualTotal);
    $('#manualItems').appendChild(row);
}

$('#addItemRowBtn').addEventListener('click', addManualItemRow);

function updateManualTotal() {
    let total = 0;
    $$('.manual-amount').forEach(inp => { total += parseFloat(inp.value) || 0; });
    $('#manualTotal').textContent = formatCurrency(total, state.baseCurrency);
}

// ─── Keyboard shortcut ───────────────────────

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('#receiptModal').classList.contains('hidden')) {
        closeReceiptModal();
    }
});

// ─── Expense Filters ────────────────────────

function populateFilters() {
    if (state.expenses.length === 0) {
        $('#expenseFilterBar').classList.add('hidden');
        return;
    }
    $('#expenseFilterBar').classList.remove('hidden');

    const fP = $('#filterPayer');
    const fI = $('#filterInvolved');
    const savedP = fP.value;
    const savedI = fI.value;
    fP.innerHTML = '<option value="">👤 All Payers</option>' + state.members.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    fI.innerHTML = '<option value="">👥 All Involved</option>' + state.members.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
    fP.value = savedP;
    fI.value = savedI;
}

$('#filterPayer').addEventListener('change', () => { state.expenseFilter.payer = $('#filterPayer').value; renderExpenses(); });
$('#filterInvolved').addEventListener('change', () => { state.expenseFilter.involved = $('#filterInvolved').value; renderExpenses(); });
$('#filterPeriod').addEventListener('change', () => { state.expenseFilter.period = $('#filterPeriod').value; renderExpenses(); });
$('#clearFiltersBtn').addEventListener('click', () => {
    state.expenseFilter = { payer: '', involved: '', period: '' };
    $('#filterPayer').value = '';
    $('#filterInvolved').value = '';
    $('#filterPeriod').value = '';
    renderExpenses();
    populateFilters();
});

// ─── Init ────────────────────────────────────
function init() {
    loadState();
    $('#baseCurrency').value = state.baseCurrency;
    updateStaticText();
    renderAll();

    // On mobile, start on expenses tab; on desktop show all
    if (window.innerWidth < 500) {
        switchTab('expenses');
    }
}

init();

console.log('🧾 Bill Dealer v2 ready — Tesseract OCR + Groq → OpenRouter → Manual');
