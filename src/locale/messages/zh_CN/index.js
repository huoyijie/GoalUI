import group from './group';

export default {
    signin: {
        formLabel: '欢迎登录',
        username: '用户名',
        password: '密码',
        rememberMe: '记住我',
        button: '登录',
        invalidUserOrPassword: '用户名或密码错误'
    },
    appTopbar: {
        language: '切换语言',
        signout: '登出',
        profile: '用户信息',
        username: '用户名',
        email: '邮箱地址',
        changePassword: '修改密码',
        password: '密码',
        newPassword: '新密码',
        confirmPassword: '确认新密码',
        submit: '提交',
        confirm: '登出确认',
        isConfirmSignout: '你确定要退出登录吗?',
        yes: '是',
        no: '否'
    },
    crud: {
        showing: '显示',
        to: '至',
        total: '共计',
        clear: '清空',
        manage: '管理',
        search: '搜索...',
        loading: '正在加载数据...',
        empty: '没有找到数据',
        topToolbar: {
            new: '新建',
            delete: '删除',
            import: '导入',
            export: '导出'
        },
        filterView: {
            input: '输入',
            searchBy: '搜索'
        },
        recordDialog: {
            details: '详情',
            cancel: '取消',
            save: '保存',
            select: '选择一个',
            successful: '成功',
            created: '已创建',
            updated: '已更新',
            deleted: '已删除'
        },
        pickPermsDialog: {
            header: '管理角色权限',
            srcHeader: '可授予权限',
            targetHeader: '已授予权限',
            cancel: '取消',
            save: '保存'
        },
        pickRolesDialog: {
            header: '管理用户角色',
            srcHeader: '可授予角色',
            targetHeader: '已授予角色',
            cancel: '取消',
            save: '保存'
        },
        delDialog: {
            confirm: '删除确认',
            confirmDelRecord: '你确定要删除',
            confirmDelRecords: '你确定要删除选中的',
            no: '否',
            yes: '是'
        }
    },
    changePassword: {
        invalidPassword: '密码错误'
    },
    appFooter: {
        goal: '由 Goal 提供支持'
    },
    validations: {
        required: '必填字段',
        minLength: '字段长度不能小于 {min}',
        maxLength: '字段长度不能大于 {max}',
        minValue: '字段不能小于 {min}',
        maxValue: '字段不能大于 {max}',
        alphaNum: '字段只能由字母和数字组成',
        alpha: '字段只能由字母组成',
        email: '邮箱地址格式不正确',
        sameAs: '字段值必须和前一个字段值相同',
        not: '字段值不能和前一个字段值相同',
        used: '已被占用'
    },
    action: {
        get: '查询',
        put: '修改',
        post: '新增',
        delete: '删除'
    },
    group
};
