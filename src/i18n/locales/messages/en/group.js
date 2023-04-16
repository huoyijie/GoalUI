import { locale } from '@/settings';

export default {
    home: {
        label: 'Home',
        dashboard: {
            label: 'Dashboard'
        }
    },
    admin: {
        label: 'Admin',
        operationlog: {
            label: 'Operation Log | operation logs',
            ID: 'ID',
            User: 'User',
            Date: 'Date',
            IP: 'IP',
            Group: 'Group',
            Item: 'Item',
            Action: 'Action',
            ObjectID: 'Object ID'
        }
    },
    auth: {
        label: 'Auth',
        role: {
            label: 'Role | roles',
            ID: 'ID',
            Name: 'Name'
        },
        session: {
            label: 'Session | sessions',
            ID: 'ID',
            Key: 'Session',
            User: 'User',
            ExpireDate: 'Expire Date'
        },
        user: {
            label: 'User | users',
            ID: 'ID',
            Username: 'Username',
            Email: 'Email',
            Password: 'Password',
            IsSuperuser: 'Super User',
            IsActive: 'Active'
        }
    },
    ...locale.en
};
