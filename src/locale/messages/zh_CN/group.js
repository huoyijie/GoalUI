import { locale } from '@/settings';

export default {
    home: {
        label: 'home',
        dashboard: {
            label: '首页'
        }
    },
    admin: {
        label: '通用管理',
        operationlog: {
            label: '操作日志',
            ID: 'ID',
            User: '用户',
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
            ID: 'ID',
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
    },
    ...locale.zh_CN
};
