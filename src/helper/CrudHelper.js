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

    isSortable(c) {
        return c.Component.Tag.Sortable;
    }

    isAsc(c) {
        return c.Component.Tag.Asc;
    }

    isDesc(c) {
        return c.Component.Tag.Desc;
    }

    isPresort(c) {
        return this.isSortable(c) && (this.isAsc(c) || this.isDesc(c));
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

    isFile(c) {
        return c.Component.Name === '<file>';
    }

    isString(c) {
        return this.isText(c) || this.isPassword(c) || this.isUuid(c);
    }

    dataType(c) {
        if (this.isNumber(c)) {
            return 'numeric';
        } else if (this.isCalendar(c)) {
            return 'date';
        } else if (this.isSwitch(c)) {
            return 'boolean';
        }
    }

    isGlobalSearch(c) {
        return c.Component.Tag.GlobalSearch;
    }

    belongTo(c) {
        return c.Component.Tag.BelongTo;
    }

    hasOne(c) {
        return c.Component.Tag.HasOne;
    }

    filterField(c) {
        const bt = this.belongTo(c);
        const ho = this.hasOne(c);
        if (bt) {
            return `${bt.Name}.${bt.Field}`;
        } else if (ho) {
            return `${ho.Name}.${ho.Field}`;
        } else {
            return c.Name;
        }
    }

    fieldValue(c, data) {
        const bt = this.belongTo(c);
        const ho = this.hasOne(c);
        if (bt) {
            return data[c.Name][bt.Field];
        } else if (ho) {
            return data[c.Name][ho.Field];
        } else {
            return data[c.Name];
        }
    }

    isDropdownOptions(c) {
        return this.isDropdown(c) && !(this.belongTo(c) || this.hasOne(c));
    }

    isInline(c) {
        return c.Component.Name === '<inline>';
    }

    hasMany(c) {
        return c.Component.Tag.HasMany;
    }

    isInlineMany(c) {
        return this.isInline(c) && this.hasMany(c);
    }

    isInlineOne(c) {
        return this.isInline(c) && this.hasOne(c);
    }

    isMultiSelect(c) {
        return c.Component.Name === '<multiSelect>';
    }

    many2Many(c) {
        return c.Component.Tag.Many2Many;
    }

    isDataTable(c) {
        return (this.isMultiSelect(c) && this.many2Many(c)) || this.isInlineMany(c);
    }

    isRequired(c) {
        const rule = c.ValidateRule;
        return rule && rule.includes('required');
    }
}
