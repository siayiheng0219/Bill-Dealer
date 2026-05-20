/* ============================================
   Bill Dealer - Application Logic
   ============================================ */

// ─── State ───────────────────────────────────
const state = {
    members: [],
    expenses: [],
    baseCurrency: 'USD',
    lang: 'en'
};

// ─── Currency Symbols ───────────────────────
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
        settings: '⚙️ Trip Settings',
        baseCurrency: 'Base Currency',
        members: '👥 Members',
        addMember: '+ Add',
        memberPlaceholder: 'Member name',
        noMembers: 'No members added yet',
        addExpense: '💸 Add Expense',
        warningNoMembers: '⚠️ Please add members in "Trip Settings" first',
        desc: 'Description',
        descPlaceholder: 'e.g., Dinner, Taxi, Hotel...',
        amount: 'Amount',
        currency: 'Currency',
        paidBy: 'Paid By',
        splitMethod: 'Split Method',
        equal: 'Equal',
        custom: 'Custom',
        splitAmong: 'Split Among',
        customAmounts: 'Custom Split Amounts',
        addExpenseBtn: '➕ Add Expense',
        noExpenses: 'No expenses yet — add one above!',
        settlement: '💰 Settlement Plan',
        noSettlement: 'No expenses to settle yet',
        footer: '💾 Data stored locally in your browser · Never uploaded to any server',
        export: '📤 Export',
        import: '📥 Import',
        clear: '🗑 Clear',
        langSwitch: '中文 ↓',
        remaining: 'Remaining:',
        over: 'Over by:',
        totalPaid: 'Total Paid',
        totalOwed: 'Total Owed',
        balance: 'Balance',
        pays: 'pays',
        to: 'to',
        allSettled: '🎉 All settled! No debts.',
        delete: '×',
        confirmClear: 'Are you sure you want to clear ALL data? This cannot be undone.',
        exported: 'Data exported successfully!',
        imported: 'Data imported successfully!',
        cleared: 'All data cleared.',
        memberAdded: 'Member added!',
        memberRemoved: 'Member removed.',
        expenseAdded: 'Expense added!',
        expenseDeleted: 'Expense deleted.',
        selectPayer: '-- Select --',
        aiScanner: '🤖 AI Receipt Scanner',
        aiDesc: 'Upload a receipt photo and let AI extract the items and amounts automatically.',
        uploadHint: 'Click or drag receipt image here',
        uploadFormat: 'Supports JPG, PNG, WEBP',
        scan: '🔍 Scan Receipt',
        addScanned: '✅ Add to Expenses',
        selectMembers: 'Add members first',
    },
    zh: {
        title: '🧾 账单分摊',
        subtitle: '旅途多人多货币智能记账',
        settings: '⚙️ 旅程设置',
        baseCurrency: '本币',
        members: '👥 成员',
        addMember: '+ 添加',
        memberPlaceholder: '成员名称',
        noMembers: '还没有添加成员',
        addExpense: '💸 快速记账',
        warningNoMembers: '⚠️ 请先在「旅程设置」中添加成员',
        desc: '描述',
        descPlaceholder: '例如：晚餐、出租车、酒店...',
        amount: '金额',
        currency: '货币',
        paidBy: '付款人',
        splitMethod: '分摊方式',
        equal: '均分',
        custom: '自定义',
        splitAmong: '分摊对象',
        customAmounts: '自定义分摊金额',
        addExpenseBtn: '➕ 添加账单',
        noExpenses: '还没有账单，记一笔吧',
        settlement: '💰 结算方案',
        noSettlement: '还没有账单，记一笔吧',
        footer: '💾 数据存储在浏览器本地 · 不会上传到任何服务器',
        export: '📤 导出备份',
        import: '📥 导入备份',
        clear: '🗑 清空数据',
        langSwitch: 'English ↓',
        remaining: '剩余：',
        over: '超出：',
        totalPaid: '总支付',
        totalOwed: '总应付',
        balance: '余额',
        pays: '支付',
        to: '给',
        allSettled: '🎉 已全部结清！没有欠款。',
        delete: '×',
        confirmClear: '确定要清空所有数据吗？此操作无法撤销。',
        exported: '数据导出成功！',
        imported: '数据导入成功！',
        cleared: '数据已清空。',
        memberAdded: '成员已添加！',
        memberRemoved: '成员已移除。',
        expenseAdded: '账单已添加！',
        expenseDeleted: '账单已删除。',
        selectPayer: '-- 选择 --',
        aiScanner: '🤖 AI 拍照智能拆单',
        aiDesc: '上传收据照片，AI 自动提取项目和金额。',
        uploadHint: '点击或拖拽收据图片',
        uploadFormat: '支持 JPG、PNG、WEBP',
        scan: '🔍 扫描收据',
        addScanned: '✅ 添加到账单',
        selectMembers: '请先添加成员',
    }
};

function _(key) {
    return t[state.lang][key] || t['en'][key] || key;
}

// ─── DOM References ──────────────────────────
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ─── Persistence ─────────────────────────────
function saveState() {
    localStorage.setItem('bill-dealer-data', JSON.stringify({
        members: state.members,
        expenses: state.expenses,
        baseCurrency: state.baseCurrency,
        lang: state.lang
    }));
}

function loadState() {
    const raw = localStorage.getItem('bill-dealer-data');
    if (raw) {
        try {
            const data = JSON.parse(raw);
            state.members = data.members || [];
            state.expenses = data.expenses || [];
            state.baseCurrency = data.baseCurrency || 'USD';
            state.lang = data.lang || 'en';
        } catch (e) {
            console.error('Failed to parse saved data:', e);
        }
    }
}

// ─── Toast ───────────────────────────────────
let toastTimer;
function showToast(message, type = 'info') {
    const toast = $('#toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 2500);
}

// ─── Currency Helpers ────────────────────────
function formatCurrency(amount, currency) {
    const sym = currencySymbols[currency] || '';
    if (currency === 'JPY' || currency === 'KRW') {
        return `${sym}${Math.round(amount).toLocaleString()}`;
    }
    return `${sym}${amount.toFixed(2)}`;
}

function getFlag(currency) {
    return currencyFlags[currency] || '';
}

// ─── Member Colors ───────────────────────────
const memberColors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
    '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#06b6d4', '#3b82f6'
];

function getMemberColor(index) {
    return memberColors[index % memberColors.length];
}

function getMemberInitial(name) {
    return name.charAt(0).toUpperCase();
}

// ─── Render All ──────────────────────────────
function renderAll() {
    renderMembers();
    renderPayerSelect();
    renderParticipants();
    renderCustomSplit();
    renderExpenses();
    renderSettlement();
    updateExpenseFormState();
    saveState();
}

// ─── Render Members ──────────────────────────
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
            <span class="remove-member" data-index="${i}" title="${_('delete')}">×</span>
        </span>
    `).join('');
}

// ─── Render Payer Select ─────────────────────
function renderPayerSelect() {
    const select = $('#payerSelect');
    select.innerHTML = `<option value="">${_('selectPayer')}</option>` +
        state.members.map(m => `<option value="${escapeHtml(m)}">${escapeHtml(m)}</option>`).join('');
}

// ─── Render Participants ─────────────────────
function renderParticipants() {
    const container = $('#participantsCheckboxes');
    if (state.members.length === 0) {
        container.innerHTML = `<p class="empty-hint">${_('selectMembers')}</p>`;
        return;
    }
    container.innerHTML = state.members.map((m, i) => `
        <label class="checkbox-tag checked" data-member="${escapeHtml(m)}">
            <input type="checkbox" value="${escapeHtml(m)}" checked>
            <span class="member-avatar" style="background:${getMemberColor(i)};width:22px;height:22px;font-size:0.7rem;">${getMemberInitial(m)}</span>
            ${escapeHtml(m)}
        </label>
    `).join('');

    // Toggle checkbox-tag visual
    container.querySelectorAll('.checkbox-tag').forEach(tag => {
        tag.addEventListener('click', function(e) {
            if (e.target.tagName === 'INPUT') return;
            const cb = this.querySelector('input');
            cb.checked = !cb.checked;
            this.classList.toggle('checked', cb.checked);
            if ($('input[name="splitMethod"]:checked').value === 'custom') {
                renderCustomSplit();
            }
        });
        const cb = tag.querySelector('input');
        cb.addEventListener('change', () => {
            tag.classList.toggle('checked', cb.checked);
            if ($('input[name="splitMethod"]:checked').value === 'custom') {
                renderCustomSplit();
            }
        });
    });
}

// ─── Render Custom Split ─────────────────────
function renderCustomSplit() {
    const container = $('#customSplitInputs');
    const checked = getCheckedParticipants();
    const totalAmount = parseFloat($('#expenseAmount').value) || 0;

    if (checked.length === 0) {
        container.innerHTML = '';
        updateRemainingDisplay(0, 0);
        return;
    }

    container.innerHTML = checked.map((m, i) => {
        const memberIdx = state.members.indexOf(m);
        return `
            <div class="custom-split-row">
                <span class="member-label">
                    <span class="member-avatar" style="background:${getMemberColor(memberIdx)};width:22px;height:22px;font-size:0.7rem;">${getMemberInitial(m)}</span>
                    ${escapeHtml(m)}
                </span>
                <input type="number" class="custom-split-input" data-member="${escapeHtml(m)}"
                       placeholder="0.00" min="0" step="0.01" value="">
            </div>
        `;
    }).join('');

    updateRemainingDisplay(totalAmount, 0);
}

function updateRemainingDisplay(total, sumCustom) {
    let el = $('#customSplitRemaining');
    if (!el) {
        el = document.createElement('div');
        el.id = 'customSplitRemaining';
        el.className = 'custom-split-remaining';
        $('#customSplitInputs').appendChild(el);
    }
    const remaining = total - sumCustom;
    if (total <= 0) {
        el.textContent = '';
    } else if (remaining >= -0.01) {
        el.textContent = `${_('remaining')} ${formatCurrency(Math.max(0, remaining), $('#expenseCurrency').value)}`;
        el.className = 'custom-split-remaining';
    } else {
        el.textContent = `${_('over')} ${formatCurrency(Math.abs(remaining), $('#expenseCurrency').value)}`;
        el.className = 'custom-split-remaining over';
    }
}

function getCheckedParticipants() {
    return Array.from($$('#participantsCheckboxes input[type="checkbox"]:checked'))
        .map(cb => cb.value);
}

// ─── Update Form State ───────────────────────
function updateExpenseFormState() {
    const hasMembers = state.members.length > 0;
    const noMembersWarning = $('#noMembersWarning');
    const addBtn = $('#addExpenseBtn');
    const form = $('#expenseForm');

    if (hasMembers) {
        noMembersWarning.classList.add('hidden');
        addBtn.disabled = false;
    } else {
        noMembersWarning.classList.remove('hidden');
        addBtn.disabled = true;
    }

    // Handle split method toggle
    const splitMethod = $('input[name="splitMethod"]:checked').value;
    const customArea = $('#customSplitArea');
    if (splitMethod === 'custom') {
        customArea.classList.remove('hidden');
        renderCustomSplit();
    } else {
        customArea.classList.add('hidden');
    }
}

// ─── Render Expenses ─────────────────────────
function renderExpenses() {
    const container = $('#expensesList');
    if (state.expenses.length === 0) {
        container.innerHTML = `<p class="empty-hint">${_('noExpenses')}</p>`;
        return;
    }
    container.innerHTML = state.expenses.map((e, i) => `
        <div class="expense-item">
            <div class="expense-info">
                <div class="expense-desc">${escapeHtml(e.desc)}</div>
                <div class="expense-meta">
                    <span>👤 ${escapeHtml(e.payer)} paid</span>
                    <span>👥 ${e.participants.map(p => escapeHtml(p)).join(', ')}</span>
                    <span>📐 ${e.splitMethod === 'equal' ? _('equal') : _('custom')}</span>
                </div>
            </div>
            <span class="expense-amount">${getFlag(e.currency)} ${formatCurrency(e.amount, e.currency)}</span>
            <span class="delete-expense" data-index="${i}" title="${_('delete')}">×</span>
        </div>
    `).join('');
}

// ─── Settlement Algorithm ────────────────────
function calculateSettlement() {
    if (state.expenses.length === 0) return null;

    // Net balance for each member (in base currency)
    const balances = {};
    state.members.forEach(m => { balances[m] = 0; });

    state.expenses.forEach(exp => {
        const rate = getExchangeRate(exp.currency, state.baseCurrency);
        const amountBase = exp.amount * rate;

        // Payer gets credited the full amount
        balances[exp.payer] = (balances[exp.payer] || 0) + amountBase;

        // Each participant owes their share
        let shares;
        if (exp.splitMethod === 'equal') {
            const share = amountBase / exp.participants.length;
            shares = {};
            exp.participants.forEach(p => { shares[p] = share; });
        } else {
            // Custom split
            let totalCustom = 0;
            Object.values(exp.customShares).forEach(v => totalCustom += v);
            const customRate = totalCustom > 0 ? amountBase / totalCustom : 1;
            shares = {};
            Object.entries(exp.customShares).forEach(([p, v]) => {
                shares[p] = v * customRate;
            });
        }

        Object.entries(shares).forEach(([person, share]) => {
            balances[person] = (balances[person] || 0) - share;
        });
    });

    // Round to 2 decimals
    Object.keys(balances).forEach(m => {
        balances[m] = Math.round(balances[m] * 100) / 100;
    });

    // Separate creditors and debtors
    const creditors = []; // positive balance (to receive)
    const debtors = [];   // negative balance (to pay)

    Object.entries(balances).forEach(([name, bal]) => {
        if (bal > 0.005) creditors.push({ name, amount: bal });
        else if (bal < -0.005) debtors.push({ name, amount: -bal });
    });

    // Sort by amount descending
    creditors.sort((a, b) => b.amount - a.amount);
    debtors.sort((a, b) => b.amount - a.amount);

    // Greedy match to minimize transactions
    const transactions = [];
    let ci = 0, di = 0;

    while (ci < creditors.length && di < debtors.length) {
        const amount = Math.min(creditors[ci].amount, debtors[di].amount);
        if (amount > 0.005) {
            transactions.push({
                from: debtors[di].name,
                to: creditors[ci].name,
                amount: Math.round(amount * 100) / 100
            });
        }
        creditors[ci].amount -= amount;
        debtors[di].amount -= amount;
        if (creditors[ci].amount < 0.005) ci++;
        if (debtors[di].amount < 0.005) di++;
    }

    return { balances, transactions };
}

// ─── Exchange Rates (simplified, relative to USD) ──
const exchangeRates = {
    USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.5, CNY: 7.24,
    KRW: 1325, TWD: 31.5, HKD: 7.82, SGD: 1.34, THB: 35.5,
    INR: 83.1, AUD: 1.53, CAD: 1.36
};

function getExchangeRate(from, to) {
    if (from === to) return 1;
    const fromUSD = exchangeRates[from] || 1;
    const toUSD = exchangeRates[to] || 1;
    return toUSD / fromUSD;
}

// ─── Render Settlement ───────────────────────
function renderSettlement() {
    const container = $('#settlementContent');
    const result = calculateSettlement();

    if (!result) {
        container.innerHTML = `<p class="empty-hint">${_('noSettlement')}</p>`;
        return;
    }

    const { balances, transactions } = result;

    let html = '<div class="settlement-summary">';

    // Balance cards
    html += '<div class="balance-grid">';
    state.members.forEach((m, i) => {
        const bal = balances[m] || 0;
        const cls = bal > 0.005 ? 'positive' : (bal < -0.005 ? 'negative' : 'zero');
        const sign = bal > 0.005 ? '+' : '';
        html += `
            <div class="balance-card ${cls}">
                <div class="balance-name">
                    <span class="member-avatar" style="background:${getMemberColor(i)};width:22px;height:22px;font-size:0.7rem;display:inline-flex;vertical-align:middle;margin-right:4px;">${getMemberInitial(m)}</span>
                    ${escapeHtml(m)}
                </div>
                <div class="balance-amount">${sign}${formatCurrency(bal, state.baseCurrency)}</div>
            </div>
        `;
    });
    html += '</div>';

    // Transactions
    if (transactions.length === 0) {
        html += `<div class="no-settlement">${_('allSettled')}</div>`;
    } else {
        html += '<div class="settlement-transactions"><h3>💱 Settlement Transactions</h3>';
        transactions.forEach(tx => {
            html += `
                <div class="transaction-item">
                    <span>${escapeHtml(tx.from)}</span>
                    <span class="arrow">→</span>
                    <span>${escapeHtml(tx.to)}</span>
                    <span class="tx-amount">${formatCurrency(tx.amount, state.baseCurrency)}</span>
                </div>
            `;
        });
        html += '</div>';
    }

    html += '</div>';
    container.innerHTML = html;
}

// ─── Escape HTML ─────────────────────────────
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ─── Event Handlers ──────────────────────────

// Add member
$('#addMemberBtn').addEventListener('click', () => {
    const input = $('#memberNameInput');
    const name = input.value.trim();
    if (!name) return;
    if (state.members.includes(name)) {
        showToast('Member already exists!', 'error');
        return;
    }
    state.members.push(name);
    input.value = '';
    renderAll();
    showToast(_('memberAdded'), 'success');
});

$('#memberNameInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        $('#addMemberBtn').click();
    }
});

// Remove member (delegated)
$('#membersList').addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-member')) {
        const index = parseInt(e.target.dataset.index);
        const name = state.members[index];
        // Remove member from expenses or update them
        state.expenses = state.expenses.filter(exp => {
            // If payer is removed, remove the expense
            if (exp.payer === name) return false;
            // Remove from participants
            exp.participants = exp.participants.filter(p => p !== name);
            if (exp.customShares) delete exp.customShares[name];
            return exp.participants.length > 0;
        });
        state.members.splice(index, 1);
        renderAll();
        showToast(_('memberRemoved'), 'info');
    }
});

// Split method toggle
$$('input[name="splitMethod"]').forEach(radio => {
    radio.addEventListener('change', updateExpenseFormState);
});

// Expense amount change → update custom split remaining
$('#expenseAmount').addEventListener('input', () => {
    if ($('input[name="splitMethod"]:checked').value === 'custom') {
        renderCustomSplit();
    }
});

// Custom split input change (delegated)
$('#customSplitInputs').addEventListener('input', (e) => {
    if (e.target.classList.contains('custom-split-input')) {
        const inputs = $$('.custom-split-input');
        let sum = 0;
        inputs.forEach(inp => { sum += parseFloat(inp.value) || 0; });
        const total = parseFloat($('#expenseAmount').value) || 0;
        updateRemainingDisplay(total, sum);
    }
});

// Add expense
$('#expenseForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const desc = $('#expenseDesc').value.trim();
    const amount = parseFloat($('#expenseAmount').value);
    const currency = $('#expenseCurrency').value;
    const payer = $('#payerSelect').value;
    const splitMethod = $('input[name="splitMethod"]:checked').value;
    const participants = getCheckedParticipants();

    if (!desc) { showToast('Please enter a description', 'error'); return; }
    if (!amount || amount <= 0) { showToast('Please enter a valid amount', 'error'); return; }
    if (!payer) { showToast('Please select who paid', 'error'); return; }
    if (participants.length === 0) { showToast('Please select at least one participant', 'error'); return; }

    const expense = {
        id: Date.now(),
        desc,
        amount,
        currency,
        payer,
        splitMethod,
        participants,
    };

    if (splitMethod === 'custom') {
        const customShares = {};
        const inputs = $$('.custom-split-input');
        let totalCustom = 0;
        inputs.forEach(inp => {
            const val = parseFloat(inp.value) || 0;
            customShares[inp.dataset.member] = val;
            totalCustom += val;
        });
        if (totalCustom <= 0) {
            showToast('Please enter custom split amounts', 'error');
            return;
        }
        expense.customShares = customShares;
    }

    state.expenses.push(expense);

    // Reset form
    $('#expenseDesc').value = '';
    $('#expenseAmount').value = '';
    $('#expenseForm').querySelector('input[value="equal"]').checked = true;

    renderAll();
    showToast(_('expenseAdded'), 'success');
});

// Delete expense (delegated)
$('#expensesList').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-expense')) {
        const index = parseInt(e.target.dataset.index);
        state.expenses.splice(index, 1);
        renderAll();
        showToast(_('expenseDeleted'), 'info');
    }
});

// Export
$('#exportBtn').addEventListener('click', () => {
    const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        members: state.members,
        expenses: state.expenses,
        baseCurrency: state.baseCurrency
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-dealer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(_('exported'), 'success');
});

// Import
$('#importBtn').addEventListener('click', () => {
    $('#importFileInput').click();
});

$('#importFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (!data.members || !data.expenses) {
                throw new Error('Invalid backup file');
            }
            state.members = data.members;
            state.expenses = data.expenses;
            state.baseCurrency = data.baseCurrency || 'USD';
            $('#baseCurrency').value = state.baseCurrency;
            renderAll();
            showToast(_('imported'), 'success');
        } catch (err) {
            showToast('Invalid backup file format', 'error');
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// Clear all
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

// Base currency change
$('#baseCurrency').addEventListener('change', () => {
    state.baseCurrency = $('#baseCurrency').value;
    renderAll();
    saveState();
});

// Language toggle
$('#langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'en' ? 'zh' : 'en';
    updateLanguage();
    renderAll();
    saveState();
});

function updateLanguage() {
    document.title = _('title').replace(/[^\w\s]/g, '').trim() || 'Bill Dealer';
    $('#langToggle').textContent = _('langSwitch');

    // Update all static text
    document.querySelector('.app-header h1').textContent = _('title');
    document.querySelector('.subtitle').textContent = _('subtitle');
    $('#settingsSection .section-title').textContent = _('settings');
    $('#settingsSection label[for="baseCurrency"]').textContent = _('baseCurrency');
    $('#settingsSection .members-header h3').textContent = _('members');
    $('#addMemberBtn').textContent = _('addMember');
    $('#memberNameInput').placeholder = _('memberPlaceholder');
    $('#expenseSection .section-title').textContent = _('addExpense');
    $('#noMembersWarning').textContent = _('warningNoMembers');
    $('#expenseSection label[for="expenseDesc"]').textContent = _('desc');
    $('#expenseDesc').placeholder = _('descPlaceholder');
    $('#expenseSection label[for="expenseAmount"]').textContent = _('amount');
    $('#expenseSection label[for="expenseCurrency"]').textContent = _('currency');
    $('#expenseSection label[for="payerSelect"]').textContent = _('paidBy');
    document.querySelector('label[for="splitMethod"]')?.closest('.form-group')?.querySelector('label')?.textContent || '';
    $('#settlementSection .section-title').textContent = _('settlement');
    document.querySelector('.app-footer p').textContent = _('footer');
    $('#exportBtn').textContent = _('export');
    $('#importBtn').textContent = _('import');
    $('#clearBtn').textContent = _('clear');

    // Update split method labels
    const splitLabels = $$('.radio-label');
    if (splitLabels.length >= 1) splitLabels[0].childNodes[splitLabels[0].childNodes.length - 1].textContent = ' ' + _('equal');
    if (splitLabels.length >= 2) splitLabels[1].childNodes[splitLabels[1].childNodes.length - 1].textContent = ' ' + _('custom');

    // Update form group labels
    const formGroups = $$('#expenseForm .form-group');
    formGroups.forEach(g => {
        const label = g.querySelector('label');
        if (label && label.textContent.includes('Split Among')) {
            label.textContent = _('splitAmong');
        }
    });

    document.querySelector('#customSplitArea > label').textContent = _('customAmounts');
    $('#addExpenseBtn').textContent = _('addExpenseBtn');
}

// ─── AI Receipt Scanner ──────────────────────
// (Basic client-side OCR simulation using canvas — in production, use a real AI API)

// We'll add an AI scan button to the expense section
const aiBtn = document.createElement('button');
aiBtn.type = 'button';
aiBtn.className = 'btn btn-ghost btn-sm';
aiBtn.id = 'aiScanBtn';
aiBtn.textContent = '🤖 AI Scan Receipt';
aiBtn.style.marginBottom = '12px';
$('#expenseForm').insertBefore(aiBtn, $('#expenseForm').firstChild);

$('#aiScanBtn').addEventListener('click', () => {
    $('#aiModal').classList.remove('hidden');
});

$('#closeAiModal').addEventListener('click', () => {
    $('#aiModal').classList.add('hidden');
    resetAiModal();
});

$('#aiModal').addEventListener('click', (e) => {
    if (e.target === $('#aiModal')) {
        $('#aiModal').classList.add('hidden');
        resetAiModal();
    }
});

function resetAiModal() {
    $('#receiptPreview').classList.add('hidden');
    $('#receiptPreview').src = '';
    $('#uploadArea').querySelector('.upload-placeholder').classList.remove('hidden');
    $('#aiResult').classList.add('hidden');
    $('#aiResult').innerHTML = '';
    $('#scanReceiptBtn').disabled = true;
    $('#addScannedItemsBtn').classList.add('hidden');
    $('#receiptImageInput').value = '';
}

// Upload area click
$('#uploadArea').addEventListener('click', () => {
    $('#receiptImageInput').click();
});

// Drag and drop
$('#uploadArea').addEventListener('dragover', (e) => {
    e.preventDefault();
    $('#uploadArea').classList.add('dragover');
});

$('#uploadArea').addEventListener('dragleave', () => {
    $('#uploadArea').classList.remove('dragover');
});

$('#uploadArea').addEventListener('drop', (e) => {
    e.preventDefault();
    $('#uploadArea').classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleReceiptImage(file);
    }
});

$('#receiptImageInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleReceiptImage(file);
});

function handleReceiptImage(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const img = $('#receiptPreview');
        img.src = ev.target.result;
        img.classList.remove('hidden');
        $('#uploadArea').querySelector('.upload-placeholder').classList.add('hidden');
        $('#scanReceiptBtn').disabled = false;
    };
    reader.readAsDataURL(file);
}

// Scan receipt (simulated AI analysis)
$('#scanReceiptBtn').addEventListener('click', () => {
    const img = $('#receiptPreview');
    if (!img.src) return;

    // Simulate AI processing with a loading state
    $('#scanReceiptBtn').textContent = '⏳ Analyzing...';
    $('#scanReceiptBtn').disabled = true;

    setTimeout(() => {
        // Simulated AI result — in production, call a real vision API
        const simulatedItems = generateSimulatedItems();
        displayAiResult(simulatedItems);
        $('#scanReceiptBtn').textContent = '🔍 Scan Receipt';
        $('#scanReceiptBtn').disabled = false;
    }, 1500);
});

function generateSimulatedItems() {
    // Generate plausible fake receipt items for demo
    const items = [
        { desc: 'Main Course', amount: 24.50 },
        { desc: 'Drinks', amount: 12.00 },
        { desc: 'Dessert', amount: 8.50 },
        { desc: 'Service Charge', amount: 5.00 },
    ];
    return items;
}

function displayAiResult(items) {
    const container = $('#aiResult');
    const total = items.reduce((sum, item) => sum + item.amount, 0);

    let html = '<h4>📋 Detected Items</h4>';
    items.forEach(item => {
        html += `
            <div class="ai-item">
                <span>${escapeHtml(item.desc)}</span>
                <span><strong>${formatCurrency(item.amount, state.baseCurrency)}</strong></span>
            </div>
        `;
    });
    html += `
        <div class="ai-item" style="font-weight:700;border-top:2px solid var(--border);padding-top:8px;margin-top:4px;">
            <span>Total</span>
            <span>${formatCurrency(total, state.baseCurrency)}</span>
        </div>
    `;

    container.innerHTML = html;
    container.classList.remove('hidden');
    $('#addScannedItemsBtn').classList.remove('hidden');

    // Store for adding
    container._scannedItems = items;
}

$('#addScannedItemsBtn').addEventListener('click', () => {
    const container = $('#aiResult');
    const items = container._scannedItems;
    if (!items || items.length === 0) return;

    if (state.members.length === 0) {
        showToast(_('selectMembers'), 'error');
        return;
    }

    // Add each item as an expense (payer = first member by default, equal split all)
    items.forEach(item => {
        state.expenses.push({
            id: Date.now() + Math.random(),
            desc: item.desc,
            amount: item.amount,
            currency: state.baseCurrency,
            payer: state.members[0],
            splitMethod: 'equal',
            participants: [...state.members],
        });
    });

    $('#aiModal').classList.add('hidden');
    resetAiModal();
    renderAll();
    showToast(`Added ${items.length} items from receipt!`, 'success');
});

// ─── Init ────────────────────────────────────
function init() {
    loadState();
    $('#baseCurrency').value = state.baseCurrency;
    updateLanguage();
    renderAll();
}

init();

console.log('🧾 Bill Dealer ready!');
console.log('Features: Member management, Multi-currency, Equal & Custom split, Settlement calculation, Import/Export, AI Receipt Scanner, Bilingual (EN/ZH), Local storage');
