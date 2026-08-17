const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'patient',
        'hospital',
        'admin',
        'lab',
        'agent',
        'doctor',
        'auth',
        'gateway',
        'db',
        'infra',
        'deps',
        'ci',
        'security',
        'billing',
      ],
    ],
  },
};

export default config;
