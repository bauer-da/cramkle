module.exports = {
  sourceLocale: 'en',
  locales: ['en', 'pt', 'es'],
  catalogs: [
    {
      path: 'src/locales/{locale}/messages',
      include: ['src/'],
      exclude: ['**/node_modules/**'],
    },
  ],
  format: 'po',
}
