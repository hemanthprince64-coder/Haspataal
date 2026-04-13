const validatePassword = (password) => {
    const rules = [
        { regex: /.{8,}/, message: 'Password must be at least 8 characters long' },
        { regex: /[A-Z]/, message: 'Password must contain at least one uppercase letter' },
        { regex: /[a-z]/, message: 'Password must contain at least one lowercase letter' },
        { regex: /[0-9]/, message: 'Password must contain at least one number' },
        { regex: /[^A-Za-z0-9]/, message: 'Password must contain at least one special character' },
    ];

    const errors = rules
        .filter(rule => !rule.regex.test(password))
        .map(rule => rule.message);

    return {
        isValid: errors.length === 0,
        errors
    };
};

module.exports = { validatePassword };
