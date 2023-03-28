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
        submit: '提交修改',
        confirm: '登出确认',
        isConfirmSignout: '你确定要退出登录吗?',
        yes: '是',
        no: '否'
    },
    crud: {
        showing: '显示',
        to: '至',
        total: '共计',
        manage: '管理',
        search: '搜索...',
        topToolbar: {
            new: '新建',
            delete: '删除',
            import: '导入',
            export: '导出'
        },
        recordDialog: {
            details: '详情',
            cancel: '取消',
            save: '保存',
            select: '选择一个'
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
        sameAs: '字段值必须和另一个字段值相同'
    },
    action: {
        get: '查询',
        put: '修改',
        post: '新增',
        delete: '删除'
    },
    group: {
        admin: {
            label: '通用管理',
            operationlog: {
                label: '操作日志',
                User: '用户名',
                Date: '时间',
                IP: 'IP',
                Action: '动作',
                ObjectID: '目标 ID'
            }
        },
        auth: {
            label: '认证授权',
            role: {
                label: '角色',
                ID: 'ID',
                Name: '名称'
            },
            session: {
                label: '会话',
                Key: '会话',
                User: '用户',
                ExpireDate: '过期时间'
            },
            user: {
                label: '用户',
                ID: 'ID',
                Username: '用户名',
                Email: '邮箱地址',
                Password: '密码',
                IsSuperuser: '超级管理员',
                IsActive: '有效'
            }
        }
    }
};
