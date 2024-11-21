// commitlint.config.js
const types = ['feat', 'fix', 'refactor', 'style', 'docs', 'test', 'chore'];
const gitmojis = {
  feat: ':sparkles:',
  fix: ':bug:',
  refactor: ':recycle:',
  style: ':lipstick:',
  docs: ':memo:',
  test: ':test_tube:',
  chore: ':hammer:',
};

module.exports = {
  parserPreset: {
    parserOpts: {
      // :gitmoji: type: subject #123 형식 파싱
      headerPattern: /^:(?<gitmoji>[\w-]+):\s(?<type>\w+)(?::\s)(?<subject>(?:(?!#).)*?)(?:\s+#\d+)*$/,
      headerCorrespondence: ['gitmoji', 'type', 'subject'],
    },
  },
  plugins: [
    {
      rules: {
        'gitmoji-type-enum': ({ type, gitmoji } = {}) => {
          if (!type || !gitmoji) return [false, '커밋 메세지는 :gitmoji: type: subject 형식이어야 합니다'];
          if (typeof type !== 'string' || typeof gitmoji !== 'string') {
            return [false, 'type과 gitmoji는 문자열이어야 합니다'];
          }

          const expectedGitmoji = gitmojis[type];
          if (!expectedGitmoji) return [false, `올바른 type이 아닙니다: \n사용가능 타입: ${types.join(', ')}`];
          if (gitmoji !== expectedGitmoji.replace(/:/g, '')) {
            return [false, `${type} 타입에는 ${expectedGitmoji} 이모지를 사용해야 합니다`];
          }
          return [true];
        },
      },
    },
  ],
  rules: {
    'type-enum': [2, 'always', types],
    'type-empty': [2, 'never'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 50],
    'gitmoji-type-enum': [2, 'always'],
    'references-empty': [1, 'never'], // 이슈 번호 없으면 warning
  },
};
