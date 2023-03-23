export default class CrudHelper {
    isPassword(c) {
        return c.Type === 'string' && c.Name === 'Password';
    }

    isBool(c) {
        return c.Type === 'bool';
    }

    isTime(c) {
        return c.Type === 'Time';
    }

    isUint(c) {
        return c.Type === 'uint';
    }

    isInt(c) {
        return c.Type === 'int';
    }

    isInteger(c) {
        return this.isUint(c) || this.isInt(c);
    }

    isFloat(c) {
        return c.Type === 'float';
    }

    isNumber(c) {
        return this.isInteger(c) || this.isFloat(c);
    }

    minVal(c) {
        if (this.isInteger(c)) {
            if (c.ValidateRule) {
                for (let rule of c.ValidateRule.split(',')) {
                    if (rule.includes('min=')) {
                        return Number(rule.split('=')[1]);
                    }
                }
            }
            if (this.isUint(c)) {
                return 0;
            }
        }
        return null;
    }

    minFractionDigits(c) {
        if (this.isFloat(c)) {
            return 2;
        }
        return null;
    }

    maxFractionDigits(c) {
        if (this.isFloat(c)) {
            return 5;
        }
        return null;
    }

    maxVal(c) {
        if (this.isInteger(c)) {
            if (c.ValidateRule) {
                for (let rule of c.ValidateRule.split(',')) {
                    if (rule.includes('max=')) {
                        return Number(rule.split('=')[1]);
                    }
                }
            }
        }
        return null;
    }

    showPreloadField(c, data) {
        if (c.Preload) {
            return data[c.Name][c.PreloadField];
        }
        return data[c.Name];
    }
}
