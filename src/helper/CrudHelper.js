export default class CrudHelper {
    isPrimary(c) {
        return c.Component.Tag.Primary;
    }

    isUnique(c) {
        return c.Component.Tag.Unique;
    }

    isHidden(c) {
        return c.Component.Tag.Hidden;
    }

    isReadonly(c) {
        return c.Component.Tag.Readonly;
    }

    isPostonly(c) {
        return c.Component.Tag.Postonly;
    }

    isPassword(c) {
        return c.Component.Name === '<password>';
    }

    isSwitch(c) {
        return c.Component.Name === '<switch>';
    }

    isCalendar(c) {
        return c.Component.Name === '<calendar>';
    }

    isShowTime(c) {
        return c.Component.Tag.ShowTime;
    }

    isShowIcon(c) {
        return c.Component.Tag.ShowIcon;
    }

    isNumber(c) {
        return c.Component.Name === '<number>';
    }

    isFloat(c) {
        return this.isNumber(c) && c.Component.Tag.Float;
    }

    isInteger(c) {
        return this.isNumber(c) && !c.Component.Tag.Float;
    }

    isShowButtons(c) {
        return c.Component.Tag.ShowButtons;
    }

    minVal(c) {
        if (this.isInteger(c)) {
            return c.Component.Tag.Min;
        }
    }

    maxVal(c) {
        if (this.isInteger(c)) {
            return c.Component.Tag.Max;
        }
    }

    minFractionDigits(c) {
        if (this.isFloat(c)) {
            return c.Component.Tag.Min;
        }
    }

    maxFractionDigits(c) {
        if (this.isFloat(c)) {
            return c.Component.Tag.Max;
        }
    }

    isUuid(c) {
        return c.Component.Name === '<uuid>';
    }

    isDropdown(c) {
        return c.Component.Name === '<dropdown>';
    }

    isFilter(c) {
        return c.Component.Tag.Filter;
    }

    isText(c) {
        return c.Component.Name === '<text>';
    }

    isString(c) {
        return this.isText(c) || this.isPassword(c) || this.isUuid(c);
    }

    belongTo(c) {
        return c.Component.Tag.BelongTo;
    }

    fieldValue(c, data) {
        if (c.Component.Tag.BelongTo) {
            return data[c.Name][c.Component.Tag.BelongTo.Field];
        }
        return data[c.Name];
    }
}
