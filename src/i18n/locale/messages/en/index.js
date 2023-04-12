import group from './group';

export default {
    signin: {
        formLabel: 'Sign in to continue',
        username: 'Username',
        password: 'Password',
        rememberMe: 'Remember me',
        button: 'Sign in',
        invalidUserOrPassword: 'Invalid username or password'
    },
    appTopbar: {
        language: 'Language',
        signout: 'Sign out',
        profile: 'Profile',
        username: 'Username',
        email: 'Email',
        changePassword: 'Change Password',
        password: 'Password',
        newPassword: 'New password',
        confirmPassword: 'Confirm password',
        submit: 'Submit',
        confirm: 'Confirm',
        isConfirmSignout: 'Are you sure you want to sign out?',
        yes: 'Yes',
        no: 'No'
    },
    changePassword: {
        invalidPassword: 'Invalid password'
    },
    crud: {
        showing: 'Showing',
        to: 'to',
        total: 'total',
        clear: 'Clear',
        manage: 'Manage ',
        search: 'Search ',
        empty: 'No data found.',
        topToolbar: {
            new: 'New',
            delete: 'Delete',
            import: 'Import',
            export: 'Export'
        },
        filterView: {
            input: 'Input ',
            searchBy: 'Search by '
        },
        recordDialog: {
            details: ' Details',
            cancel: 'Cancel',
            save: 'Save',
            select: 'Select a ',
            successful: 'Successful',
            created: ' Created',
            updated: ' Updated',
            deleted: ' Deleted'
        },
        pickPermsDialog: {
            header: 'Role permissions',
            srcHeader: 'Available permissions',
            targetHeader: 'Selected permissions',
            cancel: 'Cancel',
            save: 'Save'
        },
        pickRolesDialog: {
            header: 'User roles',
            srcHeader: 'Available roles',
            targetHeader: 'Selected roles',
            cancel: 'Cancel',
            save: 'Save'
        },
        delDialog: {
            confirm: 'Confirm',
            confirmDelRecord: 'Are you sure you want to delete ',
            confirmDelRecords: 'Are you sure you want to delete the selected ',
            no: 'No',
            yes: 'Yes'
        }
    },
    appFooter: {
        goal: 'Powered by Goal'
    },
    validations: {
        required: 'The field is required',
        minLength: 'The field must have a min length of {min}',
        maxLength: 'The field must have a max length of {max}',
        minValue: 'The field must have a min value of {min}',
        maxValue: 'The field must have a max value of {max}',
        alphaNum: 'The field can only contain letters and numbers',
        alpha: 'The field can only contain letters',
        email: 'The field is not a valid email address',
        sameAs: 'The field must be equal to the previous value',
        not: 'The field must not be equal to the previous value',
        used: 'Value is used'
    },
    action: {
        get: 'Query',
        put: 'Change',
        post: 'Add',
        delete: 'Delete'
    },
    group
};
