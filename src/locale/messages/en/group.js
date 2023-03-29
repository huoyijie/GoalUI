import { locale } from '@/settings';

export default {
    admin: {
        label: 'Admin',
        operationlog: {
            label: 'Operation Log | operation logs',
            User: 'User',
            Date: 'Date',
            IP: 'IP',
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