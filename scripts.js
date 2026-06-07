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
        alert(`【已成功儲存】\n收款人: ${payee}\n金額: HK$ ${amount}\n請您現在可以根據畫面資料抄寫至實體支票上。`);
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

        // initial render
        updateCheque();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
