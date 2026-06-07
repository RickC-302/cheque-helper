/* scripts.js - extracted and wrapped from index.html */
(function () {
    'use strict';

    function numberToChinese(num) {
        if (num === 0) return '零元整';
        const zhNums = ['零', '壹', '貳', '參', '肆', '伍', '陸', '柒', '捌', '玖'];
        const zhUnits = ['', '拾', '佰', '仟', '萬', '拾', '佰', '仟', '億'];
        let str = Math.floor(num).toString();
        let result = '';
        let len = str.length;

        for (let i = 0; i < len; i++) {
            let n = parseInt(str.charAt(i));
            let unit = zhUnits[len - i - 1] || '';
            if (n !== 0) {
                result += zhNums[n] + unit;
            } else {
                if (result.charAt(result.length - 1) !== '零' && i !== len - 1) {
                    result += '零';
                }
            }
        }
        if (result.endsWith('零')) result = result.slice(0, -1);
        return result + '元整';
    }

    function numberToEnglish(num) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        let n = Math.floor(num);
        if (n === 0) return 'Zero';

        function convertLessThanOneThousand(v) {
            let res = '';
            if (v >= 100) {
                res += ones[Math.floor(v / 100)] + ' Hundred ';
                v %= 100;
            }
            if (v >= 20) {
                res += tens[Math.floor(v / 10)] + ' ';
                v %= 10;
            }
            if (v > 0) {
                res += ones[v] + ' ';
            }
            return res.trim();
        }

        let english = '';
        if (Math.floor(n / 1000000) > 0) {
            english += convertLessThanOneThousand(Math.floor(n / 1000000)) + ' Million ';
            n %= 1000000;
        }
        if (Math.floor(n / 1000) > 0) {
            english += convertLessThanOneThousand(Math.floor(n / 1000)) + ' Thousand ';
            n %= 1000;
        }
        if (n > 0) {
            english += convertLessThanOneThousand(n);
        }

        return english.trim() + ' Dollars Only';
    }

    function updateCheque() {
        const date = document.getElementById('input-date').value;
        const payee = document.getElementById('input-payee').value;
        const amount = parseFloat(document.getElementById('input-amount').value) || 0;
        const crossing = document.getElementById('input-crossing').value;

        document.getElementById('view-date').innerText = date;
        const stubDate = document.getElementById('stub-date');
        if (stubDate) stubDate.innerText = date;

        document.getElementById('view-payee').innerText = payee;
        const stubPayee = document.getElementById('stub-payee');
        if (stubPayee) stubPayee.innerText = payee;

        document.getElementById('view-amount-num').innerText = amount > 0 ? `HK$ ${amount.toLocaleString()}` : 'HK$ ';
        const stubAmount = document.getElementById('stub-amount');
        if (stubAmount) stubAmount.innerText = amount > 0 ? `$${amount.toLocaleString()}` : '';

        const crossingEl = document.getElementById('view-crossing');
        if (crossingEl) crossingEl.style.display = crossing === 'yes' ? 'block' : 'none';

        if (amount > 0) {
            document.getElementById('view-amount-zh').innerText = numberToChinese(amount);
            document.getElementById('view-amount-en').innerText = numberToEnglish(amount);
        } else {
            document.getElementById('view-amount-zh').innerText = '';
            document.getElementById('view-amount-en').innerText = '';
        }
    }

    function saveCheque() {
        const payee = document.getElementById('input-payee').value;
        const amount = document.getElementById('input-amount').value;

        if (!payee || !amount) {
            alert('請填寫收款人和金額再儲存！');
            return;
        }
        // Save the record to localStorage history (keep last 10 records)
        const record = {
            payee: payee,
            amount: Number(amount),
            date: document.getElementById('input-date').value || '',
            crossing: document.getElementById('input-crossing').value || 'no',
            savedAt: new Date().toISOString()
        };
        try {
            let list = getHistory();
            if (!list) list = [];
            // ensure array
            if (!Array.isArray(list)) list = [list];
            // add newest to front
            list.unshift(record);
            // keep only last 10
            if (list.length > 10) list = list.slice(0, 10);
            localStorage.setItem('cheque_history', JSON.stringify(list));
        } catch (e) {
            console.error('Failed to save history', e);
        }

        alert(`【已成功儲存】\n收款人: ${payee}\n金額: HK$ ${amount}\n已儲存至歷史紀錄（最多保留最近 10 筆）。`);
        updateHistoryUI();
        displayLastSaved();
    }

    function getHistory() {
        try {
            const raw = localStorage.getItem('cheque_history');
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            // normalize older single-object format to array
            let list = Array.isArray(parsed) ? parsed : [parsed];
            // prune records older than 30 days (1 month approximation)
            const now = Date.now();
            const monthMs = 30 * 24 * 60 * 60 * 1000;
            const filtered = list.filter(item => {
                if (!item || !item.savedAt) return true; // keep items without timestamp
                const t = Date.parse(item.savedAt);
                if (isNaN(t)) return true;
                return (now - t) <= monthMs;
            });
            if (filtered.length !== list.length) {
                // save pruned list back to storage
                if (filtered.length === 0) {
                    localStorage.removeItem('cheque_history');
                    return null;
                } else {
                    localStorage.setItem('cheque_history', JSON.stringify(filtered));
                    list = filtered;
                }
            }
            return list;
        } catch (e) {
            console.error('Failed to parse history', e);
            return null;
        }
    }

    function displayLastSaved() {
        const previewEl = document.getElementById('last-saved-preview');
        const record = getHistory();
        if (!previewEl) return;
        if (!record || record.length === 0) {
            previewEl.innerText = 'No history found';
            renderHistoryList();
            return;
        }
        const latest = record[0];
        const amt = latest.amount != null ? Number(latest.amount).toLocaleString() : '-';
        const date = latest.date || '-';
        const crossingText = latest.crossing === 'yes' ? '劃線' : '不劃線';
        const count = record.length;
        previewEl.innerText = `Last Saved: Payee: ${latest.payee} | Amount: HK$ ${amt} on ${date} | ${crossingText} — (${count} saved, only last 10 kept)`;
        renderHistoryList();
    }

    function renderHistoryList() {
        const container = document.getElementById('history-list');
        if (!container) return;
        const list = getHistory();
        container.innerHTML = '';
        if (!list || list.length === 0) {
            container.innerText = '— No saved records —';
            return;
        }

        const ul = document.createElement('ul');
        ul.style.margin = '0';
        ul.style.paddingLeft = '18px';
        ul.style.listStyle = 'decimal';

        list.forEach((r, idx) => {
            const li = document.createElement('li');
            li.style.marginBottom = '6px';
            const amt = r.amount != null ? Number(r.amount).toLocaleString() : '-';
            const date = r.date || '-';
            const savedAt = r.savedAt ? new Date(r.savedAt).toLocaleString() : '';
            const crossingText = r.crossing === 'yes' ? '劃線' : '不劃線';
            li.textContent = `Payee: ${r.payee} | Amount: HK$ ${amt} | Date: ${date} | ${crossingText}`;

            if (savedAt) {
                const meta = document.createElement('span');
                meta.style.opacity = '0.8';
                meta.style.marginLeft = '8px';
                meta.textContent = `(saved: ${savedAt})`;
                li.appendChild(meta);
            }

            const btn = document.createElement('button');
            btn.style.marginLeft = '10px';
            btn.textContent = 'Recall';
            btn.addEventListener('click', () => recallSpecific(idx));
            li.appendChild(btn);

            ul.appendChild(li);
        });

        container.appendChild(ul);
    }

    function recallSpecific(index) {
        const list = getHistory();
        if (!list || !list[index]) return;
        const rec = list[index];
        const dateEl = document.getElementById('input-date');
        const payeeEl = document.getElementById('input-payee');
        const amountEl = document.getElementById('input-amount');
        const crossingEl = document.getElementById('input-crossing');
        if (dateEl) dateEl.value = rec.date || '';
        if (payeeEl) payeeEl.value = rec.payee || '';
        if (amountEl) amountEl.value = rec.amount != null ? rec.amount : '';
        if (crossingEl) crossingEl.value = rec.crossing || 'no';
        updateCheque();
    }

    function recallHistory() {
        const list = getHistory();
        if (!list || list.length === 0) return;
        const latest = list[0];
        const dateEl = document.getElementById('input-date');
        const payeeEl = document.getElementById('input-payee');
        const amountEl = document.getElementById('input-amount');
        const crossingEl = document.getElementById('input-crossing');
        if (dateEl) dateEl.value = latest.date || '';
        if (payeeEl) payeeEl.value = latest.payee || '';
        if (amountEl) amountEl.value = latest.amount != null ? latest.amount : '';
        if (crossingEl) crossingEl.value = latest.crossing || 'no';

        // Trigger the existing conversion/update logic so preview updates
        updateCheque();
    }

    function clearHistory() {
        try {
            localStorage.removeItem('cheque_history');
        } catch (e) {
            console.error('Failed to clear history', e);
        }
        displayLastSaved();
        updateHistoryUI();
    }

    function updateHistoryUI() {
        const recallBtn = document.getElementById('btn-recall');
        const clearBtn = document.getElementById('btn-clear');
        const list = getHistory();
        const enabled = Array.isArray(list) && list.length > 0;
        if (recallBtn) recallBtn.disabled = !enabled;
        if (clearBtn) clearBtn.disabled = !enabled;
    }

    // Initialize listeners once DOM is ready
    function init() {
        const inputs = ['input-date', 'input-payee', 'input-amount'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', updateCheque);
        });
        const crossingEl = document.getElementById('input-crossing');
        if (crossingEl) crossingEl.addEventListener('change', updateCheque);

        const saveBtn = document.getElementById('btn-save');
        if (saveBtn) saveBtn.addEventListener('click', saveCheque);

        const viewBtn = document.getElementById('btn-view');
        if (viewBtn) viewBtn.addEventListener('click', displayLastSaved);
        const recallBtn = document.getElementById('btn-recall');
        if (recallBtn) recallBtn.addEventListener('click', recallHistory);
        const clearBtn = document.getElementById('btn-clear');
        if (clearBtn) clearBtn.addEventListener('click', function () {
            if (confirm('確定要清除歷史紀錄嗎？')) clearHistory();
        });

        // initialize history UI
        displayLastSaved();
        updateHistoryUI();

        // initial render
        updateCheque();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
