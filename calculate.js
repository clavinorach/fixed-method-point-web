const math = require('mathjs');
const StringCalc = require('string-calc');  

class FixedPointCalculator {
    constructor() {
        this.fx = '';
        this.gx = '';
        this.errorLimit = 0;
        this.initial = 0;
        this.decimalPoint = false;
    }

    setFx(fx) {
        this.fx = this.convertToJs(fx.replace(/\s/g, ''));
        return this;
    }

    setGx(gx) {
        this.gx = this.convertToJs(gx.replace(/\s/g, ''));
        return this;
    }

    calculateFx(x) {
        return this.createFunction(x, this.fx);
    }

    calculateGx(x) {
        return this.createFunction(x, this.gx);
    }

    setErrorLimit(errorLimit) {
        this.errorLimit = errorLimit;
    }

    setInitial(x) {
        this.initial = x;
    }

    calculatePoint() {
        let error = 1.0;
        let i = 0;
        const table = [];

        while (error > this.errorLimit) {
            const tmp = {};
            tmp.x = (i === 0) ? this.initial : table[i - 1].gx;
            tmp.gx = this.calculateGx(tmp.x);
            tmp.fx = this.calculateFx(tmp.x);
            tmp.e = 0;

            table.push(tmp);

            if (i > 0) {
                error = this.calcError(table[i - 1].x, table[i].x);
                table[i].e = error;
            }

            i++;
        }

        return table;
    }

    setDecimalPoint(point) {
        this.decimalPoint = point;
    }

    calcError(xInitial, xFinal) {
        return Math.abs(xFinal - xInitial);
    }

    createFunction(x, str) {
        let pre = str.join('');
        x = this.decimalPoint ? Number(x).toFixed(this.decimalPoint) : x;
        pre = pre.replace(/x/g, x);
    
        try {
            return math.evaluate(pre);
        } catch (e) {
            return 0;
        }
    }

    convertToJs(str) {
        const operator = ['(', ')', '+', '*', '-', '/'];
        const exp = [];
        let tmp = '';

        for (let i = 0; i <= str.length; i++) {
            if (i === str.length) {
                exp.push(tmp);
            } else if (operator.includes(str[i])) {
                if (tmp.match(/[\d][a-zA-Z]/)) {
                    tmp = tmp.split('').map((char, index) => {
                        return char + ((index === tmp.length - 1) ? '' : '*');
                    }).join('');
                } else if (tmp.match(/\d?[a-zA-Z]\^\d/m)) {
                    const calon = tmp.split('^');
                    tmp = `Math.pow(${calon[0]}, ${calon[1]})`;
                }

                if (tmp !== '') {
                    exp.push(tmp);
                }

                tmp = '';
                exp.push(str[i]);
            } else {
                tmp += str[i];
            }
        }

        for (let i = 0; i < exp.length; i++) {
            if (i < exp.length - 1) {
                if (exp[i + 1] === '(' && !isNaN(exp[i])) {
                    exp[i] += '*';
                }
            }
        }

        return exp;
    }
}

module.exports = {
    FixedPointCalculator
};
